# Flowbrew (taskflow-platform) — Bug/Gap Log

## Context
Bug and compile-time-gap log for the Flowbrew integration, split out
2026-09-16 from `flowbrew-platform.md` (had grown to 149 lines) to separate
stable reference facts (now `flowbrew-platform-reference.md`) from this
running log of platform bugs/gaps found during onboarding and plugin
testing. See episodic/flowbrew-onboarding-2026-09.md for full narratives.

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

## TriggerDispatchCoordinator hang — fix verified on staging (PR #175, taskflow-hq/taskflow-platform, 2026-09-16)
Separate from the fail-closed schema-validation bug above — this was a
reported hang in trigger dispatch. Verified staging fix by running a live
minute-cron smoke test for 5 minutes via MCP
(`create_trigger_instance`/`create_trigger_subscription` on a throwaway
workflow): 5/5 expected fires completed, ~59s spacing, no hangs. Confirmed
OK for prod to JARVIS/Jakub in-thread. See
episodic/flowbrew-onboarding-2026-09.md for the full closure note.

## P0 dispatch-hang report NOT reproduced by independent test (issue #184, PR #185, 2026-09-17)
Follow-on to the PR #175 hang fix above, same `TriggerDispatchStartEntrypoint`
code path. JARVIS reported ~0/16 prod dispatch failures (`"Workers runtime
canceled - code had hung"` wrapping DO RPC `startTrusted`) and floated a
platform-wide CF `workerd` hang-detector bug theory. Smith's independent
test — fresh no-op workflow + new webhook trigger, fired directly on PROD
(6/6 fires: 1 solo + 5 rapid-fire) concurrent with live prod traffic —
completed cleanly with no hang. Conclusion: contradicts the platform-wide
theory; points to something specific to the affected workflow/trigger
(`ranni-menu-prostejov`), not a general CF/workerd issue. See
episodic/flowbrew-onboarding-2026-09.md for the full narrative.

## Known compile-time gap: `update_workflow` codegen doesn't auto-fill JSON-schema defaults (2026-09-15)
Separate from the permissive-schema gap above: when a plain-language
description asks for a field with a default value but doesn't spell the
default out explicitly, the generated `inputSchema` omits it — the default
must be stated in the description text itself for the compiled schema to
carry it. Hit while building a slack-send-message test workflow
(`unfurlLinks`/`unfurlMedia` silently missing until spelled out). Filed via
`submit_feedback` (id `cec632ef-74a2-427f-a89b-1cc10fc12503`).
