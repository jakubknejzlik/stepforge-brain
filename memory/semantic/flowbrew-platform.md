# Flowbrew (taskflow-platform) — Integration Reference

## Context
Smith is onboarded as a test/integration agent for Flowbrew, a separate
low-code workflow platform (serverInfo.name: `taskflow-platform`), via MCP.
Captured 2026-09-12/13 during onboarding + plugin-building validation. See
episodic/flowbrew-onboarding-2026-09.md for the full narrative (security
incident, misattribution catch, plugin test campaign, platform bug found).

## Endpoints & auth
- Prod MCP: `https://mcp.flowbrew.app/mcp`
- Staging MCP: `https://mcp.staging.flowbrew.app/mcp`
- Always use `https://` for the bearer token — staging also answers on plain
  `http://` with no forced upgrade (flagged via submit_feedback, unfixed as
  of 2026-09-12).
- Auth: bearer token via `Authorization` header. Tokens are member-scoped or
  owner-scoped; `create_connection` requires an owner-scoped token.
- Secrets in use: `FLOWBREW_API_TOKEN` (prod, poller→channel scope),
  `FLOWBREW_STAGING_API_TOKEN` (staging, channel scope, owner-scoped as of
  2026-09-12).
- Brick JWKS (for `createBrickHandler`):
  `https://auth.staging.flowbrew.app/.well-known/taskflow-brick-jwks.json`.

## MCP surface (27 tools as of v0.2.20)
Key tools: `get_started`, `list_plugins`, `list_workflows`, `create_workflow`,
`update_workflow` (plain-language description → LLM codegen + compile),
`start_workflow`, `read_instance`, `delete_workflow`, `list_connections`,
`create_connection` (added PR #144, requires owner-scoped token).

Design notes:
- `core.http-request` brick has no connection slot by design — prevents
  credential exfiltration via a caller-controlled URL.
- Connections are otherwise created/validated only through the Flowbrew web
  console UI (`consoleUrl` returned by `create_connection`); MCP never
  returns credential values, only status (`pending_verification` →
  `configured`).

## Plugin SDK (`@flowbrew/plugin-sdk`, v0.2.0)
- Manifest built via `createPluginManifest`/`createPluginDefinition`
  (slug, bricks, connectionTypes, triggers).
- Each brick needs its own publicly-hosted HTTPS endpoint — the SDK's
  `createBrickHandler` validates the incoming token/schema but does not
  host anything itself (bring your own hosting/tunnel).
- Publish via `uploadPluginManifest({ endpoint, apiKey, manifest })` —
  `POST /plugins/upload`; re-uploading the same version with different
  bytes is rejected (bump the version).
- Only plugin as of 2026-09-13: "Taskflow Core" v1.4.0 — `connectionTypes: []`
  on both staging and prod, so `create_connection` has nothing to attach to
  until a plugin defines a connection type (Smith's own `smith-test-plugin`
  was the first to do so, staging-only, test artifact).

## Known platform bug (issue #145, taskflow-hq/taskflow-platform)
`createApiKeyForUser` never persists `taskflowCreatedByUserId` metadata for
any console-created API key, so `create_connection`'s owner-check can never
pass for a real (non-D1-seeded) key — regardless of key age. Workaround used
so far: JARVIS manually patched the metadata in D1 for Smith's staging key.
Fix is tracked upstream; re-verify `create_connection` against a fresh,
un-patched owner-scoped key once Codex's fix PR lands — that is the real
test of whether it's resolved, not just the PR merging.
