import type { aura_intelligenceConfig } from "../config/config.js";
import type { HookInstallRecord } from "../config/types.hooks.js";

export type HookInstallUpdate = HookInstallRecord & { hookId: string };

export function recordHookInstall(
  cfg: aura_intelligenceConfig,
  update: HookInstallUpdate,
): aura_intelligenceConfig {
  const { hookId, ...record } = update;
  const installs = {
    ...cfg.hooks?.internal?.installs,
    [hookId]: {
      ...cfg.hooks?.internal?.installs?.[hookId],
      ...record,
      installedAt: record.installedAt ?? new Date().toISOString(),
    },
  };

  return {
    ...cfg,
    hooks: {
      ...cfg.hooks,
      internal: {
        ...cfg.hooks?.internal,
        installs: {
          ...installs,
          [hookId]: installs[hookId],
        },
      },
    },
  };
}
