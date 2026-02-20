import type { Guild } from "@buape/carbon";
import { describe, expect, it, vi } from "vitest";
import {
  allowListMatches,
  buildDiscordMediaPayload,
  type DiscordGuildEntryResolved,
  isDiscordGroupAllowedByPolicy,
  normalizeDiscordAllowList,
  normalizeDiscordSlug,
  registerDiscordListener,
  resolveDiscordChannelConfig,
  resolveDiscordChannelConfigWithFallback,
  resolveDiscordGuildEntry,
  resolveDiscordReplyTarget,
  resolveDiscordShouldRequireMention,
  resolveGroupDmAllow,
  sanitizeDiscordThreadName,
  shouldEmitDiscordReactionNotification,
} from "./monitor.js";
import { DiscordMessageListener } from "./monitor/listeners.js";

const fakeGuild = (id: string, name: string) => ({ id, name }) as Guild;

const makeEntries = (
  entries: Record<string, Partial<DiscordGuildEntryResolved>>,
): Record<string, DiscordGuildEntryResolved> => {
  const out: Record<string, DiscordGuildEntryResolved> = {};
  for (const [key, value] of Object.entries(entries)) {
    out[key] = {
      slug: value.slug,
      requireMention: value.requireMention,
      reactionNotifications: value.reactionNotifications,
      users: value.users,
      channels: value.channels,
    };
  }
  return out;
};

describe("registerDiscordListener", () => {
  class FakeListener {}

  it("dedupes listeners by constructor", () => {
    const listeners: object[] = [];

    expect(registerDiscordListener(listeners, new FakeListener())).toBe(true);
    expect(registerDiscordListener(listeners, new FakeListener())).toBe(false);
    expect(listeners).toHaveLength(1);
  });
});

describe("DiscordMessageListener", () => {
  it("returns before the handler finishes", async () => {
    let handlerResolved = false;
    let resolveHandler: (() => void) | null = null;
    const handlerPromise = new Promise<void>((resolve) => {
      resolveHandler = () => {
        handlerResolved = true;
        resolve();
      };
    });
    const handler = vi.fn(() => handlerPromise);
    const listener = new DiscordMessageListener(handler);

    await listener.handle(
      {} as unknown as import("./monitor/listeners.js").DiscordMessageEvent,
      {} as unknown as import("@buape/carbon").Client,
    );

    expect(handler).toHaveBeenCalledOnce();
    expect(handlerResolved).toBe(false);

    resolveHandler?.();
    await handlerPromise;
  });

  it("logs handler failures", async () => {
    const logger = {
      warn: vi.fn(),
      error: vi.fn(),
    } as unknown as ReturnType<typeof import("../logging/subsystem.js").createSubsystemLogger>;
    const handler = vi.fn(async () => {
      throw new Error("boom");
    });
    const listener = new DiscordMessageListener(handler, logger);

    await listener.handle(
      {} as unknown as import("./monitor/listeners.js").DiscordMessageEvent,
      {} as unknown as import("@buape/carbon").Client,
    );
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining("discord handler failed"));
  });

  it("logs slow handlers after the threshold", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);

    try {
      let resolveHandler: (() => void) | null = null;
      const handlerPromise = new Promise<void>((resolve) => {
        resolveHandler = resolve;
      });
      const handler = vi.fn(() => handlerPromise);
      const logger = {
        warn: vi.fn(),
        error: vi.fn(),
      } as unknown as ReturnType<typeof import("../logging/subsystem.js").createSubsystemLogger>;
      const listener = new DiscordMessageListener(handler, logger);

      await listener.handle(
        {} as unknown as import("./monitor/listeners.js").DiscordMessageEvent,
        {} as unknown as import("@buape/carbon").Client,
      );

      vi.setSystemTime(31_000);
      resolveHandler?.();
      await handlerPromise;
      await Promise.resolve();

      expect(logger.warn).toHaveBeenCalled();
      const [, meta] = logger.warn.mock.calls[0] ?? [];
      expect(meta?.durationMs).toBeGreaterThanOrEqual(30_000);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("discord allowlist helpers", () => {
  it("normalizes slugs", () => {
    expect(normalizeDiscordSlug("Friends of Aura")).toBe("friends-of-aura");
    expect(normalizeDiscordSlug("#General")).toBe("general");
    expect(normalizeDiscordSlug("Dev__Chat")).toBe("dev-chat");
  });

  it("matches ids or names", () => {
    const allow = normalizeDiscordAllowList(
      ["123", "steipete", "Friends of Aura"],
      ["discord:", "user:", "guild:", "channel:"],
    );
    expect(allow).not.toBeNull();
    if (!allow) {
      throw new Error("Expected allow list to be normalized");
    }
    expect(allowListMatches(allow, { id: "123" })).toBe(true);
    expect(allowListMatches(allow, { name: "steipete" })).toBe(true);
    expect(allowListMatches(allow, { name: "friends-of-aura" })).toBe(true);
    expect(allowListMatches(allow, { name: "other" })).toBe(false);
  });
});
