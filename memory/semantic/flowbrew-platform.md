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
- No `delete_plugin`/`archive_plugin` MCP tool exists — verified live
  2026-09-14: absent from `tools/list`, and direct `DELETE` probes on
  `/plugins/upload` and `/plugins/{id}` both 404 (route doesn't exist, not
  a permission denial). Same console-only-or-missing pattern already seen
  with API key deletion (#114) and connection creation before PR #144
  (#143) — check console-only first before assuming an MCP gap is
  fixable via a request-shape change.

## Plugin SDK (`@flowbrew/plugin-sdk`, v0.2.0)
- Manifest built via `createPluginManifest`/`createPluginDefinition`
  (slug, bricks, connectionTypes, triggers).
- Each brick needs its own publicly-hosted HTTPS endpoint — the SDK's
  `createBrickHandler` validates the incoming token/schema but does not
  host anything itself (bring your own hosting/tunnel).
- Publish via `uploadPluginManifest({ endpoint, apiKey, manifest })` —
  `POST /plugins/upload`; re-uploading the same version with different
  bytes is rejected (bump the version).
- Plugins as of 2026-09-14 (staging): "Taskflow Core" v1.4.0 (built-in,
  `connectionTypes: []`), `smith-test-plugin` (test/validation artifact),
  and `github-tools` v0.2.1 — Smith's real GitHub integration plugin
  (`BearerConnection` "github-pat", bricks `create-issue` and
  `comment-on-issue`), now with a working end-to-end webhook trigger
  (`smith-github-issue-autoresponder` workflow, `comment-on-issue` fires on
  real inbound GitHub issues). See episodic/flowbrew-onboarding-2026-09.md
  for the build narrative.

## Known platform bug (issue #145, taskflow-hq/taskflow-platform)
`createApiKeyForUser` never persists `taskflowCreatedByUserId` metadata for
any console-created API key, so `create_connection`'s owner-check can never
pass for a real (non-D1-seeded) key — regardless of key age. Workaround used
so far: JARVIS manually patched the metadata in D1 for Smith's staging key.
Fix is tracked upstream; re-verify `create_connection` against a fresh,
un-patched owner-scoped key once Codex's fix PR lands — that is the real
test of whether it's resolved, not just the PR merging.

## Known platform bug: staging ingestion credential pepper (2026-09-13, RESOLVED 2026-09-14)
`create_trigger_instance` failed on staging for any trigger type that needed
an ingestion credential (confirmed on both `core.webhook` and `core.cron`)
with `Ingestion credential pepper must decode to exactly 32 bytes`. Root
cause (found by JARVIS in code, `ingestion-credential-pepper.ts`): the
pepper decode was a hard 32-byte requirement with no fallback, and staging's
configured secret didn't meet it. Jakub ran
`sst secret set --stage staging IngestionCredentialPepper <32 bytes base64>`
and the fix was confirmed 2026-09-14 — `create_trigger_instance` for
`core.webhook` now succeeds on staging.

## Trigger dispatch validates without try/catch — fail-closed, not silent-drop (2026-09-14)
After the pepper fix, a real GitHub webhook wired end-to-end
(webhook → `core.webhook` trigger → subscription → workflow) still produced
zero workflow instances despite GitHub's delivery log showing 202 OK
accepted. Root cause (JARVIS, via server-side telemetry, not visible over
MCP): `trigger-dispatch-coordinator.ts` validates the incoming payload
against the workflow's `inputSchema` **without a try/catch**, so a
narrow/strict schema (`additionalProperties:false` at every level, the
fallback Smith had used because `update_workflow`'s codegen rejected a
permissive `record()`/`looseObject()` schema — see below) causes the
dispatch to fail closed and retry infinitely in the queue, with **no
visible error anywhere in the MCP surface** — not a silent drop as
originally suspected. Fix: give the workflow's `inputSchema`
`additionalProperties:{}` (fully permissive) so it can accept GitHub's
rich, unpredictable real payload shape. General implication: a workflow
consuming any third-party webhook body on this platform should default to
a permissive input schema, not a strict one, unless the exact payload shape
is already pinned down.

## Known compile-time gap: `update_workflow` codegen rejects permissive object schemas (2026-09-13/14)
`update_workflow`'s plain-language-description codegen fails to compile a
workflow `inputSchema` when asked (in natural language) for an open/
permissive body — both Zod `record()` and `looseObject()` with any options
error with "Unsupported arguments for Zod record/looseObject; custom
options are not supported." The only phrasing that compiled successfully
was one built around a bare `.passthrough()`. Filed via `submit_feedback`
(id `8a939b0c-5a82-45d8-97df-e73d9871a842`) — a genuine compile-time
codegen limitation, not a description-wording issue Smith could work
around indefinitely; combined with the fail-closed validation above, this
gap is what caused the schema-mismatch webhook dispatch failure.
