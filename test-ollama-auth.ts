import { getApiKeyForModel } from "./src/agents/model-auth.js";
import type { Model, Api } from "@mariozechner/pi-ai";

async function testOllamaAuth() {
  console.log("Testing Ollama authentication...");
  
  const ollamaModel: Model<Api> = {
    id: "mistral",
    name: "Mistral",
    api: "openai-completions",
    provider: "ollama",
    baseUrl: "http://127.0.0.1:11434/v1",
    reasoning: false,
    input: ["text"],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: 128000,
    maxTokens: 8192,
  };

  try {
    const apiKeyInfo = await getApiKeyForModel({ 
      model: ollamaModel 
    });
    console.log("✅ getApiKeyForModel returned:", apiKeyInfo);
    console.log("  - apiKey:", apiKeyInfo.apiKey);
    console.log("  - source:", apiKeyInfo.source);
    console.log("  - mode:", apiKeyInfo.mode);
  } catch (error) {
    console.error("❌ Error:", error);
    if (error instanceof Error) {
      console.error("  - message:", error.message);
      console.error("  - stack:", error.stack);
    }
  }
}

testOllamaAuth();
