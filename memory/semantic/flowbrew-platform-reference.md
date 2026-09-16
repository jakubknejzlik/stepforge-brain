# Flowbrew (taskflow-platform) — Integration Reference

## Context
Smith is onboarded as a test/integration agent for Flowbrew, a separate
low-code workflow platform (serverInfo.name: `taskflow-platform`), via MCP.
Captured 2026-09-12/13 during onboarding + plugin-building validation, split
2026-09-16 from the original `flowbrew-platform.md` (had grown to 149 lines)
into this reference file (stable facts/behavior) and
`flowbrew-platform-bugs.md` (bug/gap log). See
episodic/flowbrew-onboarding-2026-09.md for the full narrative (security
incident, misattribution catch, plugin test campaigns, platform bugs found).

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
- `mcp.staging.flowbrew.app` is a stateless streamable-HTTP MCP endpoint —
  directly driveable via raw curl JSON-RPC with a bearer token when a
  channel has no Flowbrew MCP server registered (no session-id required).
  Useful when `/channels` can't add an arbitrary MCP server (platform
  limitation, confirmed 2026-09-15). Reusable procedure captured as
  `.claude/skills/local/flowbrew-mcp/SKILL.md`.

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
- No `delete_plugin`/`archive_plugin` MCP tool exists — verified live
  2026-09-14: absent from `tools/list`, and direct `DELETE` probes on
  `/plugins/upload` and `/plugins/{id}` both 404 (route doesn't exist, not
  a permission denial). Same console-only-or-missing pattern already seen
  with API key deletion (#114) and connection creation before PR #144
  (#143) — check console-only first before assuming an MCP gap is
  fixable via a request-shape change.
- No per-step execution trace tool exists — `read_instance` returns only
  the final status/output of a workflow run. Reconstructing "what happened
  at each step" requires inferring it from the `update_workflow` description
  + the final output, not querying it directly (2026-09-15).
- Plugin visibility is scoped to the uploading API token's workspace —
  `list_plugins`/`create_connection` only see plugins uploaded under the
  same token used to call them, even within what looks like the same
  staging environment. A plugin JARVIS uploaded under
  `TASKFLOW_STAGING_JARVIS_API_KEY` was invisible to
  `FLOWBREW_STAGING_API_TOKEN`; fix was re-uploading the same manifest
  under the target token, which mints a new plugin id owned by that
  token's workspace (2026-09-15). Same "console/token-scoped, not a bug to
  route around" pattern as the create_connection owner-check (issue #145)
  and the missing delete/archive tool above — check token/workspace scope
  first before assuming an MCP visibility gap needs a platform fix.
- Approval-gate workflows (Slack url-button → human decision): the inbound
  `button_click` notification fires when the user clicks the Slack
  message's link button, but that is only Slack's own link-open
  acknowledgement, not the approve/reject decision itself. `read_instance`
  keeps returning `running` until the user actually submits a choice on
  the separate approval page the button opened — don't infer workflow
  completion from a `button_click` event alone (2026-09-15).

## Plugin SDK (`@flowbrew/plugin-sdk`, v0.2.0)
- Manifest built via `createPluginManifest`/`createPluginDefinition`
  (slug, bricks, connectionTypes, triggers).
- Each brick needs its own publicly-hosted HTTPS endpoint — the SDK's
  `createBrickHandler` validates the incoming token/schema but does not
  host anything itself (bring your own hosting/tunnel).
- Publish via `uploadPluginManifest({ endpoint, apiKey, manifest })` —
  `POST /plugins/upload`; re-uploading the same version with different
  bytes is rejected (bump the version).
- Plugins as of 2026-09-15 (staging): "Taskflow Core" v1.4.0 (built-in,
  `connectionTypes: []`), `smith-test-plugin` (test/validation artifact),
  `github-tools` v0.2.1 — Smith's real GitHub integration plugin
  (`BearerConnection` "github-pat", bricks `create-issue` and
  `comment-on-issue`, working end-to-end webhook trigger), and a
  `taskflow-slack-plugin` re-upload (plugin id
  `2c6bd991-5e68-448d-92e2-9d0f56fa6897`, owned by Smith's workspace after
  the token-scoping re-upload above) used for the 2026-09-15 blind-user
  test. See episodic/flowbrew-onboarding-2026-09.md for both build/test
  narratives.
