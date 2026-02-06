import type { aura_intelligencePluginApi } from "../../src/plugins/types.js";

import { createLlmTaskTool } from "./src/llm-task-tool.js";

export default function register(api: aura_intelligencePluginApi) {
  api.registerTool(createLlmTaskTool(api), { optional: true });
}
