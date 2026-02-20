import type { aura_intelligenceConfig } from "../config/config.js";
import type { ApplyAuthChoiceParams, ApplyAuthChoiceResult } from "./auth-choice.apply.js";

export const OLLAMA_DEFAULT_MODEL_REF = "ollama/mistral";

export function applyOllamaProviderConfig(cfg: aura_intelligenceConfig): aura_intelligenceConfig {
  const models = { ...cfg.agents?.defaults?.models };
  models[OLLAMA_DEFAULT_MODEL_REF] = {
    ...models[OLLAMA_DEFAULT_MODEL_REF],
    alias: models[OLLAMA_DEFAULT_MODEL_REF]?.alias ?? "Ollama Llama 3",
  };

  return {
    ...cfg,
    agents: {
      ...cfg.agents,
      defaults: {
        ...cfg.agents?.defaults,
        models,
      },
    },
  };
}

export function applyOllamaConfig(cfg: aura_intelligenceConfig): aura_intelligenceConfig {
  const next = applyOllamaProviderConfig(cfg);
  const existingModel = next.agents?.defaults?.model;
  return {
    ...next,
    agents: {
      ...next.agents,
      defaults: {
        ...next.agents?.defaults,
        model: {
          ...(existingModel && "fallbacks" in (existingModel as Record<string, unknown>)
            ? {
                fallbacks: (existingModel as { fallbacks?: string[] }).fallbacks,
              }
            : undefined),
          primary: OLLAMA_DEFAULT_MODEL_REF,
        },
      },
    },
  };
}

export async function applyAuthChoiceOllama(
  params: ApplyAuthChoiceParams,
): Promise<ApplyAuthChoiceResult | null> {
  if (params.authChoice !== "ollama") {
    return null;
  }

  const noteAgentModel = async (model: string) => {
    if (!params.agentId) return;
    await params.prompter.note(
      `Default model set to ${model} for agent "${params.agentId}".`,
      "Model configured",
    );
  };

  await params.prompter.note(
    [
      "Ollama provides local model execution on your machine.",
      "No API key is required - models run directly on your hardware.",
      "Make sure Ollama is installed and running (https://ollama.com/download)",
      "",
      "Default model: Llama 3 (will be downloaded if not available)",
    ].join("\n"),
    "Ollama",
  );

  let nextConfig = params.config;
  
  // Apply Ollama configuration
  if (params.setDefaultModel) {
    nextConfig = applyOllamaConfig(nextConfig);
    await params.prompter.note(
      `Default model set to ${OLLAMA_DEFAULT_MODEL_REF}`,
      "Model configured",
    );
  } else {
    nextConfig = applyOllamaProviderConfig(nextConfig);
    await noteAgentModel(OLLAMA_DEFAULT_MODEL_REF);
  }

  return { 
    config: nextConfig, 
    agentModelOverride: params.setDefaultModel ? undefined : OLLAMA_DEFAULT_MODEL_REF 
  };
}
