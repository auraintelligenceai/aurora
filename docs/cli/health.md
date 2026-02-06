---
summary: "CLI reference for `aura_intelligence health` (gateway health endpoint via RPC)"
read_when:
  - You want to quickly check the running Gateway’s health
---

# `aura_intelligence health`

Fetch health from the running Gateway.

```bash
aura_intelligence health
aura_intelligence health --json
aura_intelligence health --verbose
```

Notes:
- `--verbose` runs live probes and prints per-account timings when multiple accounts are configured.
- Output includes per-agent session stores when multiple agents are configured.
