# Flowbrew (taskflow-platform) — Endpoints & Auth Reference

## Context
Smith is onboarded as a test/integration agent for Flowbrew, a separate
low-code workflow platform (serverInfo.name: `taskflow-platform`), via MCP.
Captured 2026-09-12/13 during onboarding + plugin-building validation, split
2026-09-16 from the original `flowbrew-platform.md` into this reference file
and a bug/gap log, further split 2026-09-19 into
`flowbrew-platform-bugs-open.md`/`flowbrew-platform-bugs-resolved.md`,
further split 2026-09-23 into `flowbrew-platform-codegen-gaps.md`. **Split
again 2026-09-24** (this file crossed 100 lines): MCP tool-surface behavior
and Plugin SDK notes moved to `flowbrew-platform-mcp-and-sdk.md`; this file
now holds only endpoints, auth, and secrets. See
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
- **⚠️ `FLOWBREW_API_TOKEN` workspace mismatch (found 2026-09-22, STILL not
  confirmed fixed as of 2026-09-23 re-check):** the token resolves to
  workspace `e4673c3e...` (0 connections), but Jakub confirmed the *actual*
  prod workspace is `fY95o8FW5bmPreaFK4FOH5RUKDiYsPnB`. Jakub was asked
  (2026-09-22) to correct the secret via `/settings/secrets`; re-verified
  2026-09-23 (19:46) and still unresolved. **Always re-check which workspace
  `FLOWBREW_API_TOKEN` resolves to before relying on it for prod work** —
  don't assume the fix landed just because time has passed. See
  episodic/flowbrew-email-to-slack-campaign-2026-09-22.md and
  episodic/flowbrew-email-to-slack-approval-gate-2026-09-23.md.
- Brick JWKS (for `createBrickHandler`):
  `https://auth.staging.flowbrew.app/.well-known/taskflow-brick-jwks.json`.
- `mcp.staging.flowbrew.app` is a stateless streamable-HTTP MCP endpoint —
  directly driveable via raw curl JSON-RPC with a bearer token when a
  channel has no Flowbrew MCP server registered (no session-id required).
  Useful when `/channels` can't add an arbitrary MCP server (platform
  limitation, confirmed 2026-09-15). Reusable procedure captured as
  `.claude/skills/local/flowbrew-mcp/SKILL.md`.
