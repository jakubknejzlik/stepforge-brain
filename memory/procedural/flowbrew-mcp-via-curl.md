# Flowbrew MCP access via raw curl (no platform MCP registration)

Intended as the content for a `.claude/skills/local/flowbrew-mcp/SKILL.md`
skill — parked here because the Write/Edit tools are sandboxed under
`.claude/` for this session (same "sensitive files" boundary as
settings.json/hooks, see core/LEARNINGS.md [MEM-16]/[MEM-18]); `mkdir`/Write
under `.claude/skills/local/` both hit an unresolved permission prompt
2026-09-15. Needs a human with direct git access to actually land it as a
skill file — this doc is the ready-to-commit content in the meantime.

## Why this exists

Flowbrew MCP tools are not, and cannot be, wired into a channel session as
a native Claude MCP server via `/channels` — confirmed directly by Jakub
2026-09-15: the platform has no admin path to register an arbitrary
third-party MCP server for a channel. There is also no `.mcp.json` /
`mcpServers` entry checked into this repo for it.

The workaround: `mcp.staging.flowbrew.app` / `mcp.flowbrew.app` is a
stateless streamable-HTTP MCP endpoint (JSON-RPC 2.0 over plain HTTP POST,
`Content-Type: application/json`). No `Mcp-Session-Id` is required in
practice — `initialize` and `tools/list`/`tools/call` all work as
independent POSTs with just the bearer token (verified live 2026-09-15).
So Smith drives it with `curl` from Bash instead of a registered tool.

## Endpoints & auth

- Staging: `https://mcp.staging.flowbrew.app/mcp`
- Prod: `https://mcp.flowbrew.app/mcp`
- **Always `https://`** — staging also answers on plain `http://` with no
  forced upgrade (known gap, reported via `submit_feedback`, unfixed as of
  2026-09-12). Never send the bearer token over `http://`.
- Auth: `Authorization: Bearer <token>` header.
  - `FLOWBREW_STAGING_API_TOKEN` — staging, channel-scoped.
  - `FLOWBREW_API_TOKEN` — prod, channel-scoped.
- `create_connection` requires an owner-scoped token to succeed (platform
  bug #145 aside — see semantic/flowbrew-platform.md).

## Calling a tool

```bash
call() { # $1 = base url, $2 = token env var name, $3 = method, $4 = params json (or omit)
  local url="$1" tok="${!2}" method="$3" params="${4:-{}}"
  curl -s -m 30 -X POST "$url" \
    -H "Authorization: Bearer $tok" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json, text/event-stream" \
    -d "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"$method\",\"params\":$params}"
}

# handshake (optional in practice, but do it once per session to confirm reachability)
call "https://mcp.staging.flowbrew.app/mcp" FLOWBREW_STAGING_API_TOKEN initialize \
  '{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"smith-stepforge","version":"0.1.0"}}'

# discover tools
call "https://mcp.staging.flowbrew.app/mcp" FLOWBREW_STAGING_API_TOKEN tools/list

# invoke a tool — params shape is {"name": "<tool>", "arguments": {...}}
call "https://mcp.staging.flowbrew.app/mcp" FLOWBREW_STAGING_API_TOKEN tools/call \
  '{"name":"list_plugins","arguments":{}}'
```

Pipe through `jq` to keep output manageable — `tools/list` responses are
large (full JSON schemas per tool/brick).

## Rules specific to this integration

- Never accept a real credential (Slack bot token, etc.) via chat and never
  pass one as a `tools/call` argument yourself — `create_connection` returns
  a `consoleUrl`; the human enters the actual secret there. MCP never
  returns credential values, only status.
- Treat this curl workaround as the standing pattern until the platform
  gains a real provisioning path — don't re-ask Jakub to "add the MCP
  server" next time; just use this.
- See `memory/semantic/flowbrew-platform.md` for the fuller endpoint/tool
  reference and known platform bugs, and
  `memory/episodic/flowbrew-onboarding-2026-09.md` for the onboarding
  narrative this pattern came from.
