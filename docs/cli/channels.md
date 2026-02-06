---
summary: "CLI reference for `aura_intelligence channels` (accounts, status, login/logout, logs)"
read_when:
  - You want to add/remove channel accounts (WhatsApp/Telegram/Discord/Google Chat/Slack/Mattermost (plugin)/Signal/iMessage)
  - You want to check channel status or tail channel logs
---

# `aura_intelligence channels`

Manage chat channel accounts and their runtime status on the Gateway.

Related docs:
- Channel guides: [Channels](/channels/index)
- Gateway configuration: [Configuration](/gateway/configuration)

## Common commands

```bash
aura_intelligence channels list
aura_intelligence channels status
aura_intelligence channels capabilities
aura_intelligence channels capabilities --channel discord --target channel:123
aura_intelligence channels resolve --channel slack "#general" "@jane"
aura_intelligence channels logs --channel all
```

## Add / remove accounts

```bash
aura_intelligence channels add --channel telegram --token <bot-token>
aura_intelligence channels remove --channel telegram --delete
```

Tip: `aura_intelligence channels add --help` shows per-channel flags (token, app token, signal-cli paths, etc).

## Login / logout (interactive)

```bash
aura_intelligence channels login --channel whatsapp
aura_intelligence channels logout --channel whatsapp
```

## Troubleshooting

- Run `aura_intelligence status --deep` for a broad probe.
- Use `aura_intelligence doctor` for guided fixes.
- `aura_intelligence channels list` prints `Claude: HTTP 403 ... user:profile` → usage snapshot needs the `user:profile` scope. Use `--no-usage`, or provide a claude.ai session key (`CLAUDE_WEB_SESSION_KEY` / `CLAUDE_WEB_COOKIE`), or re-auth via Claude Code CLI.

## Capabilities probe

Fetch provider capability hints (intents/scopes where available) plus static feature support:

```bash
aura_intelligence channels capabilities
aura_intelligence channels capabilities --channel discord --target channel:123
```

Notes:
- `--channel` is optional; omit it to list every channel (including extensions).
- `--target` accepts `channel:<id>` or a raw numeric channel id and only applies to Discord.
- Probes are provider-specific: Discord intents + optional channel permissions; Slack bot + user scopes; Telegram bot flags + webhook; Signal daemon version; MS Teams app token + Graph roles/scopes (annotated where known). Channels without probes report `Probe: unavailable`.

## Resolve names to IDs

Resolve channel/user names to IDs using the provider directory:

```bash
aura_intelligence channels resolve --channel slack "#general" "@jane"
aura_intelligence channels resolve --channel discord "My Server/#support" "@someone"
aura_intelligence channels resolve --channel matrix "Project Room"
```

Notes:
- Use `--kind user|group|auto` to force the target type.
- Resolution prefers active matches when multiple entries share the same name.
