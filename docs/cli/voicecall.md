---
summary: "CLI reference for `aura_intelligence voicecall` (voice-call plugin command surface)"
read_when:
  - You use the voice-call plugin and want the CLI entry points
  - You want quick examples for `voicecall call|continue|status|tail|expose`
---

# `aura_intelligence voicecall`

`voicecall` is a plugin-provided command. It only appears if the voice-call plugin is installed and enabled.

Primary doc:
- Voice-call plugin: [Voice Call](/plugins/voice-call)

## Common commands

```bash
aura_intelligence voicecall status --call-id <id>
aura_intelligence voicecall call --to "+15555550123" --message "Hello" --mode notify
aura_intelligence voicecall continue --call-id <id> --message "Any questions?"
aura_intelligence voicecall end --call-id <id>
```

## Exposing webhooks (Tailscale)

```bash
aura_intelligence voicecall expose --mode serve
aura_intelligence voicecall expose --mode funnel
aura_intelligence voicecall unexpose
```

Security note: only expose the webhook endpoint to networks you trust. Prefer Tailscale Serve over Funnel when possible.

