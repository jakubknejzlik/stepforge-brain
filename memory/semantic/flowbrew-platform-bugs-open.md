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

## MCP tool surface lag: new platform fields not exposed in MCP schemas ([MEM-36], [MEM-37], [MEM-39], 2026-09-22)
Recurring pattern: a platform feature ships in the underlying API/console but
the MCP tool's `outputSchema`/`inputSchema` isn't updated to expose it, so it
can't be read via MCP alone.
- **[MEM-36]** `create_trigger_instance`/`list_trigger_instances` outputSchema
  is still `additionalProperties:false` with no `metadata` field declared,
  even after PR#221/v0.2.47 shipped the new email `inboundAddress` metadata
  to browser-api. Verified via `tools/list` schema inspection on staging, not
  just absence in a response.
- **[MEM-37]** Workaround for MEM-36: a plain GET on the trigger's
  `publicEndpointUrl` (`https://core-plugin.staging.flowbrew.app/email/<instanceId>/<secret>`)
  returns `{"address": "trigger+...@triggers.staging.flowbrew.app"}` — the
  real inbound SMTP address. POST on the same URL returns 405 (not the
  ingestion path). Given to Jakub for staging trigger `7341df78`.
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

## Platform bug: staging email trigger domain has no MX record ([MEM-38], bug `01M3547ADJ13JH99R04FA3P1CA`, 2026-09-22)
`triggers.staging.flowbrew.app` (the domain backing staging `core.email`
trigger inbound addresses) has NO MX record (NXDOMAIN) — real email delivery
to a staging email trigger is impossible. Confirmed via Jakub's bounce
screenshot plus an independent DNS-over-HTTPS check. The prod equivalent
`triggers.flowbrew.app` DOES have a working MX (Cloudflare Email Routing).
Filed as bug `01M3547ADJ13JH99R04FA3P1CA` (high priority) via
`submit_feedback`, which also references the still-open MEM-36/37
MCP-metadata-exposure gap as a secondary note. Practical effect: staging
email triggers can only be tested via `start_workflow`/synthetic payload, not
real inbound mail, until the platform fixes the staging MX config.
