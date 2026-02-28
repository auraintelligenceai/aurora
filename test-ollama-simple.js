const { resolveModel } = require("./dist/agents/pi-embedded-runner/model.js");
const { getApiKeyForModel } = require("./dist/agents/model-auth.js");

async function test() {
  console.log("Testing resolveModel with ollama...");
  
  try {
    const result = resolveModel("ollama", "mistral");
    console.log("resolveModel successful:");
    console.log("  model:", result.model);
    console.log("  provider:", result.model.provider);
    
    console.log("\nTesting getApiKeyForModel...");
    const apiKeyInfo = await getApiKeyForModel({ model: result.model });
    console.log("getApiKeyForModel successful:", apiKeyInfo);
    
  } catch (error) {
    console.error("\nError:", error);
    if (error instanceof Error) {
      console.error("Message:", error.message);
      console.error("Stack:", error.stack);
    }
  }
}

test();
