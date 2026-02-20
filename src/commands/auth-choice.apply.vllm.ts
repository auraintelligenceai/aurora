import type { aura_intelligenceConfig } from "../config/config.js";
import type { ApplyAuthChoiceParams, ApplyAuthChoiceResult } from "./auth-choice.apply.js";

export const VLLM_DEFAULT_MODEL_REF = "vllm/vllm-default";

export function applyVllmProviderConfig(cfg: aura_intelligenceConfig): aura_intelligenceConfig {
  const models = { ...cfg.agents?.defaults?.models };
  models[VLLM_DEFAULT_MODEL_REF] = {
    ...models[VLLM_DEFAULT_MODEL_REF],
    alias: models[VLLM_DEFAULT_MODEL_REF]?.alias ?? "vLLM Default",
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

export function applyVllmConfig(cfg: aura_intelligenceConfig): aura_intelligenceConfig {
  const next = applyVllmProviderConfig(cfg);
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
          primary: VLLM_DEFAULT_MODEL_REF,
        },
      },
    },
  };
}

export async function applyAuthChoiceVllm(
  params: ApplyAuthChoiceParams,
): Promise<ApplyAuthChoiceResult | null> {
  if (params.authChoice !== "vllm") {
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
      "vLLM provides fast local LLM serving with OpenAI-compatible API.",
      "No API key is required - models run directly on your hardware.",
      "Make sure vLLM is installed and running (https://vllm.ai)",
      "",
      "Default model: vLLM Default (configure in vLLM server)",
    ].join("\n"),
    "vLLM",
  );

  let nextConfig = params.config;
  
  // Apply vLLM configuration
  if (params.setDefaultModel) {
    nextConfig = applyVllmConfig(nextConfig);
    await params.prompter.note(
      `Default model set to ${VLLM_DEFAULT_MODEL_REF}`,
      "Model configured",
    );
  } else {
    nextConfig = applyVllmProviderConfig(nextConfig);
    await noteAgentModel(VLLM_DEFAULT_MODEL_REF);
  }

  return { 
    config: nextConfig, 
    agentModelOverride: params.setDefaultModel ? undefined : VLLM_DEFAULT_MODEL_REF 
  };
}
