import { describe, expect, it } from "vitest";
import { resolveImplicitProviders } from "./models-config.providers.js";
import { mkdtempSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

describe("Ollama provider", () => {
  it("should include ollama by default without API key for local usage", async () => {
    const agentDir = mkdtempSync(join(tmpdir(), "aura-test-"));
    const providers = await resolveImplicitProviders({ agentDir });

    // Ollama is available by default for local usage without API key
    expect(providers?.ollama).toBeDefined();
  });
});
