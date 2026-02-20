---
summary: "CLI reference for `aura_intelligence agents` (list/add/delete/set identity)"
read_when:
  - You want multiple isolated agents (workspaces + routing + auth)
---

# `aura_intelligence agents`

Manage isolated agents (workspaces + auth + routing).

Related:
- Multi-agent routing: [Multi-Agent Routing](/concepts/multi-agent)
- Agent workspace: [Agent workspace](/concepts/agent-workspace)

## Examples

```bash
aura_intelligence agents list
aura_intelligence agents add work --workspace ~/aura-work
aura_intelligence agents set-identity --workspace ~/aura --from-identity
aura_intelligence agents set-identity --agent main --avatar avatars/aura.png
aura_intelligence agents delete work
```

## Identity files

Each agent workspace can include an `IDENTITY.md` at the workspace root:
- Example path: `~/aura/IDENTITY.md`
- `set-identity --from-identity` reads from the workspace root (or an explicit `--identity-file`)

Avatar paths resolve relative to the workspace root.

## Set identity

`set-identity` writes fields into `agents.list[].identity`:
- `name`
- `theme`
- `emoji`
- `avatar` (workspace-relative path, http(s) URL, or data URI)

Load from `IDENTITY.md`:

```bash
aura_intelligence agents set-identity --workspace ~/aura --from-identity
```

Override fields explicitly:

```bash
aura_intelligence agents set-identity --agent main --name "Clawd" --emoji "🦞" --avatar avatars/aura.png
```

Config sample:

```json5
{
  agents: {
    list: [
      {
        id: "main",
        identity: {
          name: "Clawd",
          theme: "space lobster",
          emoji: "🦞",
          avatar: "avatars/aura.png"
        }
      }
    ]
  }
}
```
