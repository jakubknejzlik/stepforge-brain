# Flowbrew (taskflow-platform) — MCP Surface & Plugin SDK Reference

## Context
Split 2026-09-24 out of `flowbrew-platform-reference.md` (had crossed 100
lines) — that file now holds only endpoints/auth/secrets; this file holds
MCP tool-surface behavior and Plugin SDK notes. See
episodic/flowbrew-onboarding-2026-09.md for the full narrative.

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
- `delete_plugin` **does** exist as an MCP tool (correcting the 2026-09-14
  finding below, superseded 2026-09-16) — it fails with `"Delete
  connections before deleting the plugin"` if any connection still exists
  on the plugin, and succeeds (`deleted:true`) once they're gone. There is
  still no `delete_connection` MCP tool — `DELETE /connections/{id}` still
  404s — so clearing connections first stays console-only. (Original
  2026-09-14 finding, now superseded: `delete_plugin`/`archive_plugin`
  appeared absent from `tools/list` and direct `DELETE` probes on
  `/plugins/upload` and `/plugins/{id}` 404'd — root cause of that
  discrepancy not established, possibly a tool-list scoping issue rather
  than the tool being genuinely new.) Same console-only-or-missing pattern
  already seen with API key deletion (#114) and connection creation before
  PR #144 (#143) — check console-only first before assuming an MCP gap is
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
- No `conversations.open`-equivalent brick exists to resolve a Slack user ID
  to a DM channel ID, and `slack-send-message`'s `channel` schema requires a
  C/D/G-prefixed ID — see `flowbrew-platform-bugs-open.md` for the full
  DM-approval-gate gap found 2026-09-23.

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
  `comment-on-issue`, working end-to-end webhook trigger). The
  `taskflow-slack-plugin` re-upload (plugin id
  `2c6bd991-5e68-448d-92e2-9d0f56fa6897`) used for the 2026-09-15
  blind-user test was deleted 2026-09-16 at JARVIS's request to free the
  slug for JARVIS's own SST/public re-registration. See
  episodic/flowbrew-onboarding-2026-09.md for both build/test narratives.
