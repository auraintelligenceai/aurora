import type { ProviderConfig, ModelDefinitionConfig } from "./models-config.js";

export function normalizeGoogleModelId(model: string): string {
  const trimmed = model.trim();
  if (!trimmed) return trimmed;
  // Add any Google model normalization logic here
  return trimmed;
}

const OLLAMA_API_BASE_URL = "http://localhost:11434";
const OLLAMA_DEFAULT_CONTEXT_WINDOW = 8192;
const OLLAMA_DEFAULT_MAX_TOKENS = 4096;

interface OllamaModel {
  name: string;
  model: string;
  modified_at: string;
  size: number;
  digest: string;
}

interface OllamaTagsResponse {
  models: OllamaModel[];
}

export async function resolveImplicitProviders({
  _agentDir,
}: {
  _agentDir: string;
}): Promise<Record<string, ProviderConfig>> {
  const providers: Record<string, ProviderConfig> = {};

  // Ollama is available by default for local usage without API key
  // We don't want to block gateway startup with model discovery, so we provide an empty list initially
  // and let the models be discovered later if needed
  providers.ollama = {
    models: [],
  };

  return providers;
}

async function isOllamaHealthy(): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_API_BASE_URL}/api/tags`, {
      signal: AbortSignal.timeout(15000),
      method: "HEAD",
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function discoverOllamaModels(): Promise<ModelDefinitionConfig[]> {
  // Skip Ollama discovery in test environments
  if (process.env.VITEST || process.env.NODE_ENV === "test") {
    return [];
  }
  
  const startTime = Date.now();
  
  try {
    console.debug(`Checking if Ollama service is healthy at ${OLLAMA_API_BASE_URL}`);
    
    const isHealthy = await isOllamaHealthy();
    if (!isHealthy) {
      console.debug("Ollama service is not healthy or accessible");
      return [];
    }
    
    console.debug(`Ollama service is healthy, attempting to discover models`);
    
    const response = await fetch(`${OLLAMA_API_BASE_URL}/api/tags`, {
      signal: AbortSignal.timeout(30000), // Increased timeout for model discovery
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    console.debug(`Ollama API response received in ${Date.now() - startTime}ms (status: ${response.status})`);
    
    if (!response.ok) {
      console.warn(
        `Failed to discover Ollama models: HTTP ${response.status} ${response.statusText}. ` +
        `Ollama service may not be running or accessible at ${OLLAMA_API_BASE_URL}`
      );
      return [];
    }
    
    const data = (await response.json()) as OllamaTagsResponse;
    if (!data.models || data.models.length === 0) {
      console.warn("No Ollama models found on local instance");
      return [];
    }
    
    console.debug(`Successfully discovered ${data.models.length} Ollama models`);
    
    return data.models.map((model) => {
      const modelId = model.name;
      const isReasoning =
        modelId.toLowerCase().includes("r1") || modelId.toLowerCase().includes("reasoning");
      return {
        id: modelId,
        name: modelId,
        reasoning: isReasoning,
        input: ["text"],
        cost: {
          input: 0,
          output: 0,
          cacheRead: 0,
          cacheWrite: 0
        },
        contextWindow: OLLAMA_DEFAULT_CONTEXT_WINDOW,
        maxTokens: OLLAMA_DEFAULT_MAX_TOKENS,
      };
    });
  } catch (error) {
    console.debug(`Ollama discovery failed in ${Date.now() - startTime}ms`);
    
    if (error instanceof Error) {
      if (error.name === "TimeoutError" || error.message.includes("timeout")) {
        console.warn(
          "Failed to discover Ollama models: Connection timed out. " +
          "Ollama service may not be running, or there may be network connectivity issues. " +
          `Please verify Ollama is installed and running on ${OLLAMA_API_BASE_URL}`
        );
      } else if (error.name === "TypeError" && error.message.includes("fetch")) {
        console.warn(
          "Failed to discover Ollama models: Connection failed. " +
          "Ollama service is not running or not accessible. " +
          `Please install Ollama (https://ollama.com/download) and start the service on ${OLLAMA_API_BASE_URL}`
        );
      } else {
        console.warn(`Failed to discover Ollama models: ${error.message}`);
      }
    } else {
      console.warn(`Failed to discover Ollama models: ${String(error)}`);
    }
    
    return [];
  }
}

export function normalizeProviders({
  providers,
  _agentDir,
}: {
  providers: Record<string, ProviderConfig>;
  _agentDir: string;
}): Record<string, ProviderConfig> {
  // Normalization logic here
  return providers;
}

export async function resolveImplicitBedrockProvider({
  _agentDir,
  _config,
}: {
  _agentDir: string;
  _config: any;
}): Promise<ProviderConfig | null> {
  // Bedrock implicit provider resolution
  return null;
}

export async function resolveImplicitCopilotProvider({
  _agentDir,
}: {
  _agentDir: string;
}): Promise<ProviderConfig | null> {
  // Copilot implicit provider resolution
  return null;
}
