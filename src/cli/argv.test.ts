import { describe, expect, it } from "vitest";

import {
  buildParseArgv,
  getFlagValue,
  getCommandPath,
  getPrimaryCommand,
  getPositiveIntFlagValue,
  getVerboseFlag,
  hasHelpOrVersion,
  hasFlag,
  shouldMigrateState,
  shouldMigrateStateFromPath,
} from "./argv.js";

describe("argv helpers", () => {
  it("detects help/version flags", () => {
    expect(hasHelpOrVersion(["node", "aura_intelligence", "--help"])).toBe(true);
    expect(hasHelpOrVersion(["node", "aura_intelligence", "-V"])).toBe(true);
    expect(hasHelpOrVersion(["node", "aura_intelligence", "status"])).toBe(false);
  });

  it("extracts command path ignoring flags and terminator", () => {
    expect(getCommandPath(["node", "aura_intelligence", "status", "--json"], 2)).toEqual([
      "status",
    ]);
    expect(getCommandPath(["node", "aura_intelligence", "agents", "list"], 2)).toEqual([
      "agents",
      "list",
    ]);
    expect(getCommandPath(["node", "aura_intelligence", "status", "--", "ignored"], 2)).toEqual([
      "status",
    ]);
  });

  it("returns primary command", () => {
    expect(getPrimaryCommand(["node", "aura_intelligence", "agents", "list"])).toBe("agents");
    expect(getPrimaryCommand(["node", "aura_intelligence"])).toBeNull();
  });

  it("parses boolean flags and ignores terminator", () => {
    expect(hasFlag(["node", "aura_intelligence", "status", "--json"], "--json")).toBe(true);
    expect(hasFlag(["node", "aura_intelligence", "--", "--json"], "--json")).toBe(false);
  });

  it("extracts flag values with equals and missing values", () => {
    expect(
      getFlagValue(["node", "aura_intelligence", "status", "--timeout", "5000"], "--timeout"),
    ).toBe("5000");
    expect(
      getFlagValue(["node", "aura_intelligence", "status", "--timeout=2500"], "--timeout"),
    ).toBe("2500");
    expect(
      getFlagValue(["node", "aura_intelligence", "status", "--timeout"], "--timeout"),
    ).toBeNull();
    expect(
      getFlagValue(["node", "aura_intelligence", "status", "--timeout", "--json"], "--timeout"),
    ).toBe(null);
    expect(
      getFlagValue(["node", "aura_intelligence", "--", "--timeout=99"], "--timeout"),
    ).toBeUndefined();
  });

  it("parses verbose flags", () => {
    expect(getVerboseFlag(["node", "aura_intelligence", "status", "--verbose"])).toBe(true);
    expect(getVerboseFlag(["node", "aura_intelligence", "status", "--debug"])).toBe(false);
    expect(
      getVerboseFlag(["node", "aura_intelligence", "status", "--debug"], { includeDebug: true }),
    ).toBe(true);
  });

  it("parses positive integer flag values", () => {
    expect(
      getPositiveIntFlagValue(["node", "aura_intelligence", "status"], "--timeout"),
    ).toBeUndefined();
    expect(
      getPositiveIntFlagValue(["node", "aura_intelligence", "status", "--timeout"], "--timeout"),
    ).toBeNull();
    expect(
      getPositiveIntFlagValue(
        ["node", "aura_intelligence", "status", "--timeout", "5000"],
        "--timeout",
      ),
    ).toBe(5000);
    expect(
      getPositiveIntFlagValue(
        ["node", "aura_intelligence", "status", "--timeout", "nope"],
        "--timeout",
      ),
    ).toBeUndefined();
  });

  it("builds parse argv from raw args", () => {
    const nodeArgv = buildParseArgv({
      programName: "aura_intelligence",
      rawArgs: ["node", "aura_intelligence", "status"],
    });
    expect(nodeArgv).toEqual(["node", "aura_intelligence", "status"]);

    const versionedNodeArgv = buildParseArgv({
      programName: "aura_intelligence",
      rawArgs: ["node-22", "aura_intelligence", "status"],
    });
    expect(versionedNodeArgv).toEqual(["node-22", "aura_intelligence", "status"]);

    const versionedNodeWindowsArgv = buildParseArgv({
      programName: "aura_intelligence",
      rawArgs: ["node-22.2.0.exe", "aura_intelligence", "status"],
    });
    expect(versionedNodeWindowsArgv).toEqual(["node-22.2.0.exe", "aura_intelligence", "status"]);

    const versionedNodePatchlessArgv = buildParseArgv({
      programName: "aura_intelligence",
      rawArgs: ["node-22.2", "aura_intelligence", "status"],
    });
    expect(versionedNodePatchlessArgv).toEqual(["node-22.2", "aura_intelligence", "status"]);

    const versionedNodeWindowsPatchlessArgv = buildParseArgv({
      programName: "aura_intelligence",
      rawArgs: ["node-22.2.exe", "aura_intelligence", "status"],
    });
    expect(versionedNodeWindowsPatchlessArgv).toEqual([
      "node-22.2.exe",
      "aura_intelligence",
      "status",
    ]);

    const versionedNodeWithPathArgv = buildParseArgv({
      programName: "aura_intelligence",
      rawArgs: ["/usr/bin/node-22.2.0", "aura_intelligence", "status"],
    });
    expect(versionedNodeWithPathArgv).toEqual([
      "/usr/bin/node-22.2.0",
      "aura_intelligence",
      "status",
    ]);

    const nodejsArgv = buildParseArgv({
      programName: "aura_intelligence",
      rawArgs: ["nodejs", "aura_intelligence", "status"],
    });
    expect(nodejsArgv).toEqual(["nodejs", "aura_intelligence", "status"]);

    const nonVersionedNodeArgv = buildParseArgv({
      programName: "aura_intelligence",
      rawArgs: ["node-dev", "aura_intelligence", "status"],
    });
    expect(nonVersionedNodeArgv).toEqual([
      "node",
      "aura_intelligence",
      "node-dev",
      "aura_intelligence",
      "status",
    ]);

    const directArgv = buildParseArgv({
      programName: "aura_intelligence",
      rawArgs: ["aura_intelligence", "status"],
    });
    expect(directArgv).toEqual(["node", "aura_intelligence", "status"]);

    const bunArgv = buildParseArgv({
      programName: "aura_intelligence",
      rawArgs: ["bun", "src/entry.ts", "status"],
    });
    expect(bunArgv).toEqual(["bun", "src/entry.ts", "status"]);
  });

  it("builds parse argv from fallback args", () => {
    const fallbackArgv = buildParseArgv({
      programName: "aura_intelligence",
      fallbackArgv: ["status"],
    });
    expect(fallbackArgv).toEqual(["node", "aura_intelligence", "status"]);
  });

  it("decides when to migrate state", () => {
    expect(shouldMigrateState(["node", "aura_intelligence", "status"])).toBe(false);
    expect(shouldMigrateState(["node", "aura_intelligence", "health"])).toBe(false);
    expect(shouldMigrateState(["node", "aura_intelligence", "sessions"])).toBe(false);
    expect(shouldMigrateState(["node", "aura_intelligence", "memory", "status"])).toBe(false);
    expect(shouldMigrateState(["node", "aura_intelligence", "agent", "--message", "hi"])).toBe(
      false,
    );
    expect(shouldMigrateState(["node", "aura_intelligence", "agents", "list"])).toBe(true);
    expect(shouldMigrateState(["node", "aura_intelligence", "message", "send"])).toBe(true);
  });

  it("reuses command path for migrate state decisions", () => {
    expect(shouldMigrateStateFromPath(["status"])).toBe(false);
    expect(shouldMigrateStateFromPath(["agents", "list"])).toBe(true);
  });
});
