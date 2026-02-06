---
summary: "CLI reference for `aura_intelligence memory` (status/index/search)"
read_when:
  - You want to index or search semantic memory
  - You’re debugging memory availability or indexing
---

# `aura_intelligence memory`

Manage semantic memory indexing and search.
Provided by the active memory plugin (default: `memory-core`; set `plugins.slots.memory = "none"` to disable).

Related:
- Memory concept: [Memory](/concepts/memory)
 - Plugins: [Plugins](/plugins)

## Examples

```bash
aura_intelligence memory status
aura_intelligence memory status --deep
aura_intelligence memory status --deep --index
aura_intelligence memory status --deep --index --verbose
aura_intelligence memory index
aura_intelligence memory index --verbose
aura_intelligence memory search "release checklist"
aura_intelligence memory status --agent main
aura_intelligence memory index --agent main --verbose
```

## Options

Common:

- `--agent <id>`: scope to a single agent (default: all configured agents).
- `--verbose`: emit detailed logs during probes and indexing.

Notes:
- `memory status --deep` probes vector + embedding availability.
- `memory status --deep --index` runs a reindex if the store is dirty.
- `memory index --verbose` prints per-phase details (provider, model, sources, batch activity).
- `memory status` includes any extra paths configured via `memorySearch.extraPaths`.
