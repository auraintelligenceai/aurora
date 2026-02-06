---
summary: "CLI reference for `aura_intelligence devices` (device pairing + token rotation/revocation)"
read_when:
  - You are approving device pairing requests
  - You need to rotate or revoke device tokens
---

# `aura_intelligence devices`

Manage device pairing requests and device-scoped tokens.

## Commands

### `aura_intelligence devices list`

List pending pairing requests and paired devices.

```
aura_intelligence devices list
aura_intelligence devices list --json
```

### `aura_intelligence devices approve <requestId>`

Approve a pending device pairing request.

```
aura_intelligence devices approve <requestId>
```

### `aura_intelligence devices reject <requestId>`

Reject a pending device pairing request.

```
aura_intelligence devices reject <requestId>
```

### `aura_intelligence devices rotate --device <id> --role <role> [--scope <scope...>]`

Rotate a device token for a specific role (optionally updating scopes).

```
aura_intelligence devices rotate --device <deviceId> --role operator --scope operator.read --scope operator.write
```

### `aura_intelligence devices revoke --device <id> --role <role>`

Revoke a device token for a specific role.

```
aura_intelligence devices revoke --device <deviceId> --role node
```

## Common options

- `--url <url>`: Gateway WebSocket URL (defaults to `gateway.remote.url` when configured).
- `--token <token>`: Gateway token (if required).
- `--password <password>`: Gateway password (password auth).
- `--timeout <ms>`: RPC timeout.
- `--json`: JSON output (recommended for scripting).

## Notes

- Token rotation returns a new token (sensitive). Treat it like a secret.
- These commands require `operator.pairing` (or `operator.admin`) scope.
