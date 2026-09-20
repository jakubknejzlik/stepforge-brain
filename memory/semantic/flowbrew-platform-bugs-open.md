# Flowbrew (taskflow-platform) — Open Bugs/Gaps

## Context
Split from `flowbrew-platform-bugs.md` during 2026-09-19 reflection (that
file crossed 121 lines, over the 100-line semantic-file guideline, repeating
the exact reactive-split pattern the 2026-09-16 reflection flagged for its
predecessor `flowbrew-platform.md`). Split by lifecycle status this time
instead of waiting for another 100-line trigger: this file holds bugs/gaps
that are still open (no confirmed fix or platform-side resolution yet); see
`flowbrew-platform-bugs-resolved.md` for closed/resolved incidents. See
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

## Known compile-time gap: `update_workflow` codegen rejects permissive object schemas (2026-09-13/14)
`update_workflow`'s plain-language-description codegen fails to compile a
workflow `inputSchema` when asked (in natural language) for an open/
permissive body — both Zod `record()` and `looseObject()` with any options
error with "Unsupported arguments for Zod record/looseObject; custom
options are not supported." The only phrasing that compiled successfully
was one built around a bare `.passthrough()`. Filed via `submit_feedback`
(id `8a939b0c-5a82-45d8-97df-e73d9871a842`) — a genuine compile-time
codegen limitation, not a description-wording issue Smith could work
around indefinitely; combined with the (now-fixed) fail-closed validation
behavior (see resolved file), this gap is what caused the original
schema-mismatch webhook dispatch failure.

## Known compile-time gap: `delayMs` (milliseconds) compiles into an invalid `step.sleep()` duration (2026-09-18, open, not yet filed)
A numeric `delayMs` field described in natural language as milliseconds
compiled into an invalid Cloudflare Workflows `step.sleep()` duration
format. Workaround: reword the field description to require an explicit
`"<N> seconds"` string, which compiles correctly. Not yet filed via
`submit_feedback` — noted as a minor, separate codegen gap from the
`update_workflow` gaps above. See
`episodic/flowbrew-subworkflow-testing-2026-09-18.md`.

## Known compile-time gap: `update_workflow` codegen doesn't auto-fill JSON-schema defaults (2026-09-15)
Separate from the permissive-schema gap above: when a plain-language
description asks for a field with a default value but doesn't spell the
default out explicitly, the generated `inputSchema` omits it — the default
must be stated in the description text itself for the compiled schema to
carry it. Hit while building a slack-send-message test workflow
(`unfurlLinks`/`unfurlMedia` silently missing until spelled out). Filed via
`submit_feedback` (id `cec632ef-74a2-427f-a89b-1cc10fc12503`).

## UX nuance: `read_instance` shows a terser error wrapper for uncaught vs. caught `core.workflow-call` failures (2026-09-18, not a bug)
An uncaught `core.workflow-call` error surfaces a terser wrapper via
`read_instance` than the same error caught via try/catch shows (400 generic
vs. 422 detailed). Landed as a follow-up idea in the #199 closing comment,
not filed as its own issue. See
`episodic/flowbrew-subworkflow-testing-2026-09-18.md`.
