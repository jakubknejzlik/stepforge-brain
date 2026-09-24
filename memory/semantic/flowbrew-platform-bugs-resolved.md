# Flowbrew (taskflow-platform) — Resolved Bugs/Incidents

## Context
Split from `flowbrew-platform-bugs.md` during 2026-09-19 reflection (see
`flowbrew-platform-bugs-open.md` for the sibling file and the rationale).
This file holds bugs/incidents that were confirmed fixed, closed, or
concluded to not be a real platform issue — kept as a historical record
since a closed incident can still be relevant context (e.g. issue #199's
correction below). See episodic/flowbrew-onboarding-2026-09.md and
episodic/flowbrew-subworkflow-testing-2026-09-18.md for full narratives.

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

## Trigger dispatch validates without try/catch — fail-closed, not silent-drop (2026-09-14, RESOLVED)
After the pepper fix, a real GitHub webhook wired end-to-end
(webhook → `core.webhook` trigger → subscription → workflow) still produced
zero workflow instances despite GitHub's delivery log showing 202 OK
accepted. Root cause (JARVIS, via server-side telemetry, not visible over
MCP): `trigger-dispatch-coordinator.ts` validates the incoming payload
against the workflow's `inputSchema` **without a try/catch**, so a
narrow/strict schema (`additionalProperties:false` at every level, the
fallback Smith had used because `update_workflow`'s codegen rejected a
permissive schema — see `flowbrew-platform-codegen-gaps.md`) causes the
dispatch to fail closed and retry infinitely in the queue, with **no
visible error anywhere in the MCP surface** — not a silent drop as
originally suspected. Fix: give the workflow's `inputSchema`
`additionalProperties:{}` (fully permissive) so it can accept GitHub's
rich, unpredictable real payload shape. General implication: a workflow
consuming any third-party webhook body on this platform should default to
a permissive input schema, not a strict one, unless the exact payload shape
is already pinned down.

## TriggerDispatchCoordinator hang — fix verified on staging (PR #175, taskflow-hq/taskflow-platform, 2026-09-16, RESOLVED)
Separate from the fail-closed schema-validation bug above — this was a
reported hang in trigger dispatch. Verified staging fix by running a live
minute-cron smoke test for 5 minutes via MCP
(`create_trigger_instance`/`create_trigger_subscription` on a throwaway
workflow): 5/5 expected fires completed, ~59s spacing, no hangs. Confirmed
OK for prod to JARVIS/Jakub in-thread. See
episodic/flowbrew-onboarding-2026-09.md for the full closure note.

## P0 dispatch-hang report NOT reproduced by independent test (issue #184, PR #185, 2026-09-17, CLOSED — not a platform-wide issue)
Follow-on to the PR #175 hang fix above, same `TriggerDispatchStartEntrypoint`
code path. JARVIS reported ~0/16 prod dispatch failures (`"Workers runtime
canceled - code had hung"` wrapping DO RPC `startTrusted`) and floated a
platform-wide CF `workerd` hang-detector bug theory. Smith's independent
test — fresh no-op workflow + new webhook trigger, fired directly on PROD
(6/6 fires: 1 solo + 5 rapid-fire) concurrent with live prod traffic —
completed cleanly with no hang. Conclusion: contradicts the platform-wide
theory; points to something specific to the affected workflow/trigger
(`ranni-menu-prostejov`), not a general CF/workerd issue. [MEM-27]'s
workflow-specific root cause remains open (tracked in Active Projects), but
the platform-wide theory itself is closed. See
episodic/flowbrew-onboarding-2026-09.md for the full narrative.

## Issue #199 (`core.workflow-call` opaque failure-path error) — corrected, closed as false positive (2026-09-18)
Initial finding: all 3 `core.workflow-call` failure paths (missing required
input field, nonexistent target `workflowId`, target output violating its
own declared `outputSchema`) threw the identical opaque
`TypeError: Cannot read properties of undefined (reading 'get')` instead of
a descriptive message. Filed as issue #199. Re-tested on a healthy platform
after an unrelated concurrent staging regression (missing `env.LOADER`
binding, see episodic writeup) was fixed, and got 3 distinct, specific,
actionable error messages instead — the original finding's timing lined up
exactly with the regression window. JARVIS closed #199 as a false positive;
Smith independently verified the closure via `gh api`. Lesson: readable,
specific errors ARE the real behavior of `core.workflow-call`'s failure
paths once the platform is healthy. See
`episodic/flowbrew-subworkflow-testing-2026-09-18.md` for the full
narrative (test methodology, regression detour, resolution).

## MCP metadata gap ([MEM-36]) and staging MX/relay outage ([MEM-38]) — both confirmed fixed live (2026-09-23)
**[MEM-36]:** `create_trigger_instance`/`list_trigger_instances` now returns
`metadata.inboundAddress` directly in the MCP response — confirmed
2026-09-23 while setting up a fresh staging email trigger (`52571d6e`), no
GET-endpoint workaround ([MEM-37], now obsolete) needed. **[MEM-38]:** the
staging `triggers.staging.flowbrew.app` MX/relay outage (bug
`01M3547ADJ13JH99R04FA3P1CA`) is also fixed — PR#228/v0.2.53 shipped an
authenticated HTTPS relay for staging email trigger domains, and a real
email sent to a fresh staging trigger arrived and fired workflow instance
`22f98612` within ~10s, echoing from/title/body correctly. Both closures
verified via real, non-synthetic traffic (a live email + live MCP response),
not just a clean deploy. See `memory/daily/2026-09-23.md` (12:56/13:04
entries) for the full session narrative.
