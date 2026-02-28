import type { aura_intelligenceConfig } from "../config/config.js";
import type { ApplyAuthChoiceParams, ApplyAuthChoiceResult } from "./auth-choice.apply.js";
import { discoverOllamaModels } from "../agents/models-config.providers.js";
import type { ModelDefinitionConfig } from "../agents/models-config.js";

export const OLLAMA_DEFAULT_MODEL_REF = "ollama/mistral";

export function applyOllamaProviderConfig(cfg: aura_intelligenceConfig, modelRef: string): aura_intelligenceConfig {
  const models = { ...cfg.agents?.defaults?.models };
  models[modelRef] = {
    ...models[modelRef],
    alias: models[modelRef]?.alias ?? `Ollama ${modelRef.split('/')[1]}`,
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

export function applyOllamaConfig(cfg: aura_intelligenceConfig, modelRef: string): aura_intelligenceConfig {
  const next = applyOllamaProviderConfig(cfg, modelRef);
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
          primary: modelRef,
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
    ].join("\n"),
    "Ollama",
  );

  // Discover available Ollama models
  const availableModels = await discoverOllamaModels();
  
  let selectedModelRef = OLLAMA_DEFAULT_MODEL_REF;
  
  if (availableModels.length > 0) {
    // Prompt user to select a model from the available list
    const options = availableModels.map((model: ModelDefinitionConfig) => ({
      value: `ollama/${model.id}`,
      label: model.id,
      hint: model.name,
    }));
    
    options.push({
      value: OLLAMA_DEFAULT_MODEL_REF,
      label: "mistral (default, will download if not available)",
      hint: "Mistral model",
    });
    
    selectedModelRef = await params.prompter.select({
      message: "Select default Ollama model",
      options,
      initialValue: OLLAMA_DEFAULT_MODEL_REF,
    });
  } else {
    // No models available, inform user we'll use the default
    await params.prompter.note(
      `No Ollama models found. Will use ${OLLAMA_DEFAULT_MODEL_REF} (will be downloaded if not available).`,
      "Ollama",
    );
  }

  let nextConfig = params.config;
  
  // Apply Ollama configuration
  if (params.setDefaultModel) {
    nextConfig = applyOllamaConfig(nextConfig, selectedModelRef);
    await params.prompter.note(
      `Default model set to ${selectedModelRef}`,
      "Model configured",
    );
  } else {
    nextConfig = applyOllamaProviderConfig(nextConfig, selectedModelRef);
    await noteAgentModel(selectedModelRef);
  }

  return { 
    config: nextConfig, 
    agentModelOverride: params.setDefaultModel ? undefined : selectedModelRef 
  };
}
