import type { Command } from "commander";
import { defaultRuntime } from "../../runtime.js";
import { runCommandWithRuntime } from "../cli-utils.js";
import { ollamaLaunchCommand } from "../../commands/ollama.js";
import { formatDocsLink } from "../../terminal/links.js";
import { theme } from "../../terminal/theme.js";
import { formatHelpExamples } from "../help-format.js";

export function registerOllamaCommand(program: Command) {
  const ollama = program
    .command("ollama")
    .description("Manage Ollama integration")
    .addHelpText(
      "after",
      () =>
        `
${theme.heading("Examples:")}
${formatHelpExamples([
  ['aura_intelligence ollama launch', "Launch with default Ollama configuration"],
  ['aura_intelligence ollama launch --config', "Configure Ollama model without starting the gateway"],
  ['aura_intelligence ollama launch --model mistral-8b', "Launch with specific Ollama model"],
])}

${theme.muted("Docs:")} ${formatDocsLink("/cli/ollama", "docs.molt.bot/cli/ollama")}`,
    );

  ollama
    .command("launch")
    .description("Launch aura_intelligence with Ollama integration")
    .option("--config", "Configure Ollama model without starting the gateway and TUI", false)
    .option("--model <name>", "Use a specific Ollama model directly")
    .action(async (opts) => {
      await runCommandWithRuntime(defaultRuntime, async () => {
        await ollamaLaunchCommand(opts, defaultRuntime);
      });
    });
}
