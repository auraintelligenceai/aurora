import type { aura_intelligencePluginApi } from "aura/plugin-sdk";
import { emptyPluginConfigSchema } from "aura/plugin-sdk";

import { createDiagnosticsOtelService } from "./src/service.js";

const plugin = {
  id: "diagnostics-otel",
  name: "Diagnostics OpenTelemetry",
  description: "Export diagnostics events to OpenTelemetry",
  configSchema: emptyPluginConfigSchema(),
  register(api: aura_intelligencePluginApi) {
    api.registerService(createDiagnosticsOtelService());
  },
};

export default plugin;
