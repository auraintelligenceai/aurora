import path from "node:path";

import { describe, expect, it } from "vitest";

import { resolveGatewayStateDir } from "./paths.js";

describe("resolveGatewayStateDir", () => {
  it("uses the default state dir when no overrides are set", () => {
    const env = { HOME: "/Users/test" };
    expect(resolveGatewayStateDir(env)).toBe(path.join("/Users/test", ".aura"));
  });

  it("appends the profile suffix when set", () => {
    const env = { HOME: "/Users/test", AURA_PROFILE: "rescue" };
    expect(resolveGatewayStateDir(env)).toBe(path.join("/Users/test", ".aura-rescue"));
  });

  it("treats default profiles as the base state dir", () => {
    const env = { HOME: "/Users/test", AURA_PROFILE: "Default" };
    expect(resolveGatewayStateDir(env)).toBe(path.join("/Users/test", ".aura"));
  });

  it("uses AURA_STATE_DIR when provided", () => {
    const env = { HOME: "/Users/test", AURA_STATE_DIR: "/var/lib/aura_intelligence" };
    expect(resolveGatewayStateDir(env)).toBe(path.resolve("/var/lib/aura_intelligence"));
  });

  it("expands ~ in AURA_STATE_DIR", () => {
    const env = { HOME: "/Users/test", AURA_STATE_DIR: "~/aura_intelligence-state" };
    expect(resolveGatewayStateDir(env)).toBe(path.resolve("/Users/test/aura_intelligence-state"));
  });

  it("preserves Windows absolute paths without HOME", () => {
    const env = { AURA_STATE_DIR: "C:\\State\\aura_intelligence" };
    expect(resolveGatewayStateDir(env)).toBe("C:\\State\\aura_intelligence");
  });
});
