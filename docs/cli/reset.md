---
summary: "CLI reference for `aura_intelligence reset` (reset local state/config)"
read_when:
  - You want to wipe local state while keeping the CLI installed
  - You want a dry-run of what would be removed
---

# `aura_intelligence reset`

Reset local config/state (keeps the CLI installed).

```bash
aura_intelligence reset
aura_intelligence reset --dry-run
aura_intelligence reset --scope config+creds+sessions --yes --non-interactive
```

