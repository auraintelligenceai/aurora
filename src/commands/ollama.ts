import type { RuntimeEnv } from "../runtime.js";
import { defaultRuntime } from "../runtime.js";
import { applyOllamaConfig, applyOllamaProviderConfig } from "./auth-choice.apply.ollama.js";
import { loadConfig } from "../config/config.js";
import { formatCliCommand } from "../cli/command-format.js";
import { theme } from "../terminal/theme.js";
import { promptDefaultModel } from "./model-picker.js";
import { createConfigIO } from "../config/io.js";
import type { WizardPrompter } from "../wizard/prompts.js";

export async function ollamaLaunchCommand(opts: { config?: boolean; model?: string }, runtime: RuntimeEnv = defaultRuntime) {
  if (opts.config) {
    // Configure Ollama model without starting gateway and TUI
    await configureOllamaModel(runtime);
    return;
  }

  if (opts.model) {
    // Use specific model directly
    await launchOllamaWithModel(opts.model, runtime);
    return;
  }

  // Default behavior: Launch with configured or default model
  await launchOllama(runtime);
}

async function configureOllamaModel(runtime: RuntimeEnv) {
  runtime.log("Configuring Ollama model...");
  
  const cfg = loadConfig();
  
  // Let user select a model using the built-in model picker
  const result = await promptDefaultModel({
    config: cfg,
    prompter: createWizardPrompter(runtime),
    allowKeep: false,
    includeManual: true,
    ignoreAllowlist: true,
    preferredProvider: "ollama",
    message: "Select an Ollama model to use:",
  });

  if (!result.model) {
    runtime.log("Model selection canceled.");
    return;
  }

  // Update config with selected model
  let nextConfig = applyOllamaProviderConfig(cfg, result.model);
  nextConfig = {
    ...nextConfig,
    agents: {
      ...nextConfig.agents,
      defaults: {
        ...nextConfig.agents?.defaults,
        model: {
          ...(nextConfig.agents?.defaults?.model && typeof nextConfig.agents.defaults.model === "object" 
            ? { fallbacks: (nextConfig.agents.defaults.model as any).fallbacks } 
            : undefined),
          primary: result.model,
        },
      },
    },
  };
  
  const configIO = createConfigIO();
  await configIO.writeConfigFile(nextConfig);
  runtime.log(theme.success(`Ollama configured with model: ${result.model}`));
}

async function launchOllamaWithModel(model: string, runtime: RuntimeEnv) {
  runtime.log(`Launching aura_intelligence with Ollama model: ${model}...`);
  
  const normalizedModel = model.toLowerCase().startsWith("ollama/") 
    ? model 
    : `ollama/${model}`;
  
  // Update config with specified model
  const cfg = loadConfig();
  let nextConfig = applyOllamaProviderConfig(cfg, normalizedModel);
  nextConfig = {
    ...nextConfig,
    agents: {
      ...nextConfig.agents,
      defaults: {
        ...nextConfig.agents?.defaults,
        model: {
          ...(nextConfig.agents?.defaults?.model && typeof nextConfig.agents.defaults.model === "object" 
            ? { fallbacks: (nextConfig.agents.defaults.model as any).fallbacks } 
            : undefined),
          primary: normalizedModel,
        },
      },
    },
  };
  
  const configIO = createConfigIO();
  await configIO.writeConfigFile(nextConfig);
  runtime.log(theme.success(`aura_intelligence has been configured with Ollama model: ${model}`));

  runtime.log("\nNext steps:");
  runtime.log(`- To connect messaging apps: ${formatCliCommand("aura_intelligence configure --section channels")}`);
  runtime.log(`- To start the gateway: ${formatCliCommand("aura_intelligence gateway run")}`);
}

async function launchOllama(runtime: RuntimeEnv) {
  runtime.log("Launching aura_intelligence...");
  
  // Apply Ollama configuration
  const cfg = loadConfig();
  const nextConfig = applyOllamaConfig(cfg, "ollama/mistral");
  
  const configIO = createConfigIO();
  await configIO.writeConfigFile(nextConfig);
  runtime.log(theme.success("aura_intelligence has been configured with Ollama."));

  runtime.log("\nNext steps:");
  runtime.log(`- To change the model without starting the gateway and TUI: ${formatCliCommand("aura_intelligence ollama launch --config")}`);
  runtime.log(`- To connect messaging apps: ${formatCliCommand("aura_intelligence configure --section channels")}`);
  runtime.log(`- To use a specific model directly: ${formatCliCommand("aura_intelligence ollama launch --model <model-name>")}`);
}

// Simple wizard prompter implementation for non-interactive use
function createWizardPrompter(_runtime: RuntimeEnv) {
  return {
    intro: async () => {},
    outro: async () => {},
    note: async () => {},
    select: async (params: any) => {
      // For now, just return the first available option
      const ollamaOptions = params.options.filter((opt: any) => opt.value.startsWith("ollama/"));
      if (ollamaOptions.length > 0) {
        return ollamaOptions[0].value;
      }
      return undefined;
    },
    multiselect: async () => [],
    text: async () => "",
    confirm: async () => false,
    progress: (_label: string) => ({
      update: (_message: string) => {},
      stop: (_message?: string) => {},
    }),
  } as unknown as WizardPrompter;
}
