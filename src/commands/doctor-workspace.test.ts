import path from "node:path";

import { describe, expect, it } from "vitest";

import { detectLegacyWorkspaceDirs } from "./doctor-workspace.js";

describe("detectLegacyWorkspaceDirs", () => {
  it("ignores ~/aura_intelligence when it doesn't look like a workspace (e.g. install dir)", () => {
    const home = "/home/user";
    const workspaceDir = "/home/user/clawd";
    const candidate = path.join(home, "aura_intelligence");

    const detection = detectLegacyWorkspaceDirs({
      workspaceDir,
      homedir: () => home,
      exists: (value) => value === candidate,
    });

    expect(detection.activeWorkspace).toBe(path.resolve(workspaceDir));
    expect(detection.legacyDirs).toEqual([]);
  });

  it("flags ~/aura_intelligence when it contains workspace markers", () => {
    const home = "/home/user";
    const workspaceDir = "/home/user/clawd";
    const candidate = path.join(home, "aura_intelligence");
    const agentsPath = path.join(candidate, "AGENTS.md");

    const detection = detectLegacyWorkspaceDirs({
      workspaceDir,
      homedir: () => home,
      exists: (value) => value === candidate || value === agentsPath,
    });

    expect(detection.legacyDirs).toEqual([candidate]);
  });
});
