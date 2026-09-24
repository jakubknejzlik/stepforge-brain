# Flowbrew (taskflow-platform) — Open Bugs/Gaps

## Context
Split from `flowbrew-platform-bugs.md` during 2026-09-19 reflection (that
file crossed 121 lines, over the 100-line semantic-file guideline, repeating
the exact reactive-split pattern the 2026-09-16 reflection flagged for its
predecessor `flowbrew-platform.md`). Split by lifecycle status that time:
this file holds bugs/gaps that are still open (no confirmed fix or
platform-side resolution yet); see `flowbrew-platform-bugs-resolved.md` for
closed/resolved incidents. **2026-09-23 reflection:** this file crossed 111
lines (third consecutive cycle the same growth pattern recurred) — the three
`update_workflow` codegen/compile-time gaps were split out to
`flowbrew-platform-codegen-gaps.md`; this file now holds runtime bugs,
MCP-surface lag, and documentation gaps. See
episodic/flowbrew-onboarding-2026-09.md and
episodic/flowbrew-subworkflow-testing-2026-09-18.md for full narratives.

## Known platform bug (issue #145, taskflow-hq/taskflow-platform)
`createApiKeyForUser` never persists `taskflowCreatedByUserId` metadata for
any console-created API key, so `create_connection`'s owner-check can never
pass for a real (non-D1-seeded) key — regardless of key age. Workaround used
so far: JARVIS manually patched the metadata in D1 for Smith's staging key.
Fix is tracked upstream; re-verify `create_connection` against a fresh,
un-patched owner-scoped key once Codex's fix PR lands — that is the real
test of whether it's resolved, not just the PR merging.

## UX nuance: `read_instance` shows a terser error wrapper for uncaught vs. caught `core.workflow-call` failures (2026-09-18, not a bug)
An uncaught `core.workflow-call` error surfaces a terser wrapper via
`read_instance` than the same error caught via try/catch shows (400 generic
vs. 422 detailed). Landed as a follow-up idea in the #199 closing comment,
not filed as its own issue. See
`episodic/flowbrew-subworkflow-testing-2026-09-18.md`.

## Documentation gap: subworkflow fan-out, error shapes, and delayMs not documented ([MEM-34], taskflow-hq/taskflow-platform, 2026-09-19)
`docs/workflow-start-call.md` (taskflow-platform repo, last touched
2026-09-11 PR #131) explicitly states fan-out/recursion policies are out of
scope, so the N-child parallel/serial subworkflow patterns confirmed
working ([MEM-32]/[MEM-33]) aren't documented anywhere a developer would
find them. The actual error message shapes (Zod path detail, "target
unavailable in workspace/project scope") also aren't documented despite
being exactly what a workflow author needs to write correct try/catch. The
`delayMs`→`step.sleep()` codegen gap (see `flowbrew-platform-codegen-gaps.md`) only exists as a sentence in
the #199 closing comment, not its own tracked issue. Found in response to
Jakub asking whether subworkflow testing is well documented; reported
in-thread with a proposal for JARVIS to add a fan-out+error-shapes section
to the doc and file the delayMs issue, since Smith only has `gh api`
read-only access to taskflow-platform, not write/PR access.

## MCP tool surface lag: new platform fields not exposed in MCP schemas ([MEM-39], 2026-09-22)
Recurring pattern: a platform feature ships in the underlying API/console but
the MCP tool's `outputSchema`/`inputSchema` isn't updated to expose it, so it
can't be read via MCP alone. MEM-36 (`create_trigger_instance` metadata gap)
and its MEM-37 GET workaround were resolved 2026-09-23 — see
`flowbrew-platform-bugs-resolved.md`.
- **[MEM-39]** Same pattern recurred in v0.2.50 `brick_calls` (issue #213):
  `read_instance`/`list_instances` outputSchemas are unchanged (status/output/
  error only — no duration/brickCount/attempts) despite the feature shipping.
  Verified via a `core.http-request` test workflow (`smith-brickcalls-test-v213`,
  instance `c998c0ec`, httpStatus 200) completing successfully with the new
  fields still not surfaced via MCP. Needs a human/JARVIS with an
  authenticated browser session to confirm the console UI itself shows the
  new fields — Smith has no such session.
- Shared MEM-36/37/38 findings with cross-brain agent U0AJN756TTL (working on
  the MCP metadata schema fix) in thread `1790104705.497419` on 2026-09-22.
- **[MEM-37:obsolete]** Former workaround for MEM-36 (plain GET on the
  trigger's `publicEndpointUrl` to read the real inbound SMTP address) — no
  longer needed as of 2026-09-23; `create_trigger_instance` now returns
  `metadata.inboundAddress` directly. Kept one cycle for visibility, then
  removed per MEM lifecycle.

## Platform gap: no way to open/resolve a Slack DM channel ID via MCP (2026-09-23)
`slack-send-message`'s `channel` schema requires a C/D/G-prefixed channel ID
— a raw Slack user ID cannot be used directly. There is no
`conversations.open`-equivalent brick to resolve a user ID to a DM channel
ID, and `slack-list-channels` with `types=[im]` requires the `im:read`
(+`mpim:read`) OAuth scope, which the connected Slack app may not have.
Net effect: a workflow cannot reliably DM a specific user unless (a) the
connection already has `im:read`/`mpim:read` and the bot has an existing DM
with that user (so the IM channel already exists to be listed), or (b) the
target channel ID is hardcoded from a prior manual lookup. Found while
attempting to build a DM-based approval gate for `smith-email-to-slack-test`
(5b97dddc) — abandoned in favor of posting everything to the channel
instead. See `memory/daily/2026-09-23.md` (20:46 entry).
