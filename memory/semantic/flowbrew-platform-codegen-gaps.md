# Flowbrew (taskflow-platform) — `update_workflow` Codegen Gaps

## Context
Split from `flowbrew-platform-bugs-open.md` during 2026-09-23 reflection
(that file crossed 111 lines, over the 100-line semantic-file guideline —
the third consecutive cycle this exact pattern recurred, after
`flowbrew-platform.md` 2026-09-16 and `flowbrew-platform-bugs.md`
2026-09-19). Split by category this time (compile-time/codegen vs.
everything else) rather than lifecycle status again, since the codegen gaps
share a root cause (the plain-language-description → LLM codegen path) and
a resolved-status split axis had already been used on this same file's
lineage twice. This file holds only `update_workflow` codegen/compile-time
gaps; see `flowbrew-platform-bugs-open.md` for runtime bugs, MCP-surface
lag, and documentation gaps.

## `update_workflow` codegen rejects permissive object schemas (2026-09-13/14)
`update_workflow`'s plain-language-description codegen fails to compile a
workflow `inputSchema` when asked (in natural language) for an open/
permissive body — both Zod `record()` and `looseObject()` with any options
error with "Unsupported arguments for Zod record/looseObject; custom
options are not supported." The only phrasing that compiled successfully
was one built around a bare `.passthrough()`. Filed via `submit_feedback`
(id `8a939b0c-5a82-45d8-97df-e73d9871a842`) — a genuine compile-time
codegen limitation, not a description-wording issue Smith could work
around indefinitely; combined with the (now-fixed) fail-closed validation
behavior (see `flowbrew-platform-bugs-resolved.md`), this gap is what
caused the original schema-mismatch webhook dispatch failure.

## `delayMs` (milliseconds) compiles into an invalid `step.sleep()` duration (2026-09-18, open, not yet filed)
A numeric `delayMs` field described in natural language as milliseconds
compiled into an invalid Cloudflare Workflows `step.sleep()` duration
format. Workaround: reword the field description to require an explicit
`"<N> seconds"` string, which compiles correctly. Not yet filed via
`submit_feedback` — noted as a minor, separate codegen gap from the
permissive-schema gap above. See
`episodic/flowbrew-subworkflow-testing-2026-09-18.md`.

## `update_workflow` codegen doesn't auto-fill JSON-schema defaults (2026-09-15)
Separate from the permissive-schema gap above: when a plain-language
description asks for a field with a default value but doesn't spell the
default out explicitly, the generated `inputSchema` omits it — the default
must be stated in the description text itself for the compiled schema to
carry it. Hit while building a slack-send-message test workflow
(`unfurlLinks`/`unfurlMedia` silently missing until spelled out). Filed via
`submit_feedback` (id `cec632ef-74a2-427f-a89b-1cc10fc12503`).
