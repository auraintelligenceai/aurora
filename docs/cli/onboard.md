---
summary: "CLI reference for `aura_intelligence onboard` (interactive onboarding wizard)"
read_when:
  - You want guided setup for gateway, workspace, auth, channels, and skills
---

# `aura_intelligence onboard`

Interactive onboarding wizard (local or remote Gateway setup).

Related:
- Wizard guide: [Onboarding](/start/onboarding)

## Examples

```bash
aura_intelligence onboard
aura_intelligence onboard --flow quickstart
aura_intelligence onboard --flow manual
aura_intelligence onboard --mode remote --remote-url ws://gateway-host:18789
```

Flow notes:
- `quickstart`: minimal prompts, auto-generates a gateway token.
- `manual`: full prompts for port/bind/auth (alias of `advanced`).
- Fastest first chat: `aura_intelligence dashboard` (Control UI, no channel setup).
