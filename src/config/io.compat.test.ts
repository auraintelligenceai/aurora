import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { createConfigIO } from "./io.js";

async function withTempHome(run: (home: string) => Promise<void>): Promise<void> {
  const home = await fs.mkdtemp(path.join(os.tmpdir(), "aura_intelligence-config-"));
  try {
    await run(home);
  } finally {
    await fs.rm(home, { recursive: true, force: true });
  }
}

async function writeConfig(
  home: string,
  dirname: ".aura_intelligence" | ".aura",
  port: number,
  filename: "aura_intelligence.json" | "aura.json" = "aura_intelligence.json",
) {
  const dir = path.join(home, dirname);
  await fs.mkdir(dir, { recursive: true });
  const configPath = path.join(dir, filename);
  await fs.writeFile(configPath, JSON.stringify({ gateway: { port } }, null, 2));
  return configPath;
}

describe("config io compat (new + legacy folders)", () => {
  it("prefers ~/.aura_intelligence/aura_intelligence.json when both configs exist", async () => {
    await withTempHome(async (home) => {
      const newConfigPath = await writeConfig(home, ".aura_intelligence", 19001);
      await writeConfig(home, ".aura", 18789);

      const io = createConfigIO({
        env: {} as NodeJS.ProcessEnv,
        homedir: () => home,
      });
      expect(io.configPath).toBe(newConfigPath);
      expect(io.loadConfig().gateway?.port).toBe(19001);
    });
  });

  it("falls back to ~/.aura/aura_intelligence.json when only legacy exists", async () => {
    await withTempHome(async (home) => {
      const legacyConfigPath = await writeConfig(home, ".aura", 20001);

      const io = createConfigIO({
        env: {} as NodeJS.ProcessEnv,
        homedir: () => home,
      });

      expect(io.configPath).toBe(legacyConfigPath);
      expect(io.loadConfig().gateway?.port).toBe(20001);
    });
  });

  it("falls back to ~/.aura/aura.json when only legacy filename exists", async () => {
    await withTempHome(async (home) => {
      const legacyConfigPath = await writeConfig(home, ".aura", 20002, "aura.json");

      const io = createConfigIO({
        env: {} as NodeJS.ProcessEnv,
        homedir: () => home,
      });

      expect(io.configPath).toBe(legacyConfigPath);
      expect(io.loadConfig().gateway?.port).toBe(20002);
    });
  });

  it("prefers aura_intelligence.json over legacy filename in the same dir", async () => {
    await withTempHome(async (home) => {
      const preferred = await writeConfig(home, ".aura", 20003, "aura_intelligence.json");
      await writeConfig(home, ".aura", 20004, "aura.json");

      const io = createConfigIO({
        env: {} as NodeJS.ProcessEnv,
        homedir: () => home,
      });

      expect(io.configPath).toBe(preferred);
      expect(io.loadConfig().gateway?.port).toBe(20003);
    });
  });

  it("honors explicit legacy config path env override", async () => {
    await withTempHome(async (home) => {
      const newConfigPath = await writeConfig(home, ".aura_intelligence", 19002);
      const legacyConfigPath = await writeConfig(home, ".aura", 20002);

      const io = createConfigIO({
        env: { CLAWDBOT_CONFIG_PATH: legacyConfigPath } as NodeJS.ProcessEnv,
        homedir: () => home,
      });

      expect(io.configPath).not.toBe(newConfigPath);
      expect(io.configPath).toBe(legacyConfigPath);
      expect(io.loadConfig().gateway?.port).toBe(20002);
    });
  });
});
