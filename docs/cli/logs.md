---
summary: "CLI reference for `aura_intelligence logs` (tail gateway logs via RPC)"
read_when:
  - You need to tail Gateway logs remotely (without SSH)
  - You want JSON log lines for tooling
---

# `aura_intelligence logs`

Tail Gateway file logs over RPC (works in remote mode).

Related:
- Logging overview: [Logging](/logging)

## Examples

```bash
aura_intelligence logs
aura_intelligence logs --follow
aura_intelligence logs --json
aura_intelligence logs --limit 500
```

