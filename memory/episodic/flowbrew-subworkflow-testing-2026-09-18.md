# Event: Flowbrew subworkflow (core.workflow-start / core.workflow-call) testing campaign

**Date:** 2026-09-18
**Outcome:** Campaign closed out. Both bricks fully functional across all tested scenarios; the one apparent bug found mid-campaign (opaque error on failure paths, issue #199) was corrected and closed as a false positive — its real cause was an unrelated concurrent staging regression, not `core.workflow-call` itself.

## What happened

### Phase 1 — initial independent test ([MEM-28])
Smith ran an independent test of `core.workflow-start`/`core.workflow-call` (staging) covering:
- **Fire&forget** — parent returns `instanceId` in ~5s, before the child's 6s sleep finishes.
- **Wait-for-completion** — parent blocks ~13s and returns the child's real output.
- **inputSchema fail-fast** — invalid input creates no child instance at all.

All three matched JARVIS's description and worked cleanly. But differential testing of 3 failure paths — missing required input field, nonexistent target `workflowId`, and a target whose actual output violates its own declared `outputSchema` — all threw the *identical* opaque error (`TypeError: Cannot read properties of undefined (reading 'get')`) instead of a descriptive validation/not-found message. Reported to JARVIS/Jakub in-thread as a suspected `core.workflow-call` bug (this became issue #199). Separately, and apparently unrelated: a numeric `delayMs` field described as milliseconds compiled into an invalid Cloudflare Workflows `step.sleep()` duration format — worked once reworded to require an explicit `"<N> seconds"` string.

### Phase 2 — staging regression detour ([MEM-29]/[MEM-30]/[MEM-31])
~30 minutes after Phase 1's clean results, starting the serial multi-subworkflow test, Smith found `core.workflow-start` AND `core.workflow-call` both failing on staging even for a bare, trivial, valid single call — the same generic `TypeError`. This was a regression from the working state confirmed minutes earlier; core plugin manifest version was unchanged (1.6.0), pointing to a server-side change rather than a manifest redeploy. JARVIS independently reproduced the identical error firing a totally unrelated pre-existing staging workflow (issue #117 repro, no subworkflow brick involved at all) — 3 independent firings (Smith's, JARVIS's earlier bg-agent run, this one) confirmed this was a general staging `start_workflow`/runtime failure, not subworkflow-specific. Both agents paused subworkflow testing pending resolution.

**Root cause (JARVIS, via wrangler tail + Cloudflare audit log):** a missing `env.LOADER` (Worker Loader) binding on the staging runtime worker (`dynamic-workflow-host.ts:85`), caused by JARVIS's own earlier lost/orphaned background-agent run that executed a stray manual `sst deploy --stage staging` around 06:54 UTC — intended to spin up an isolated PR preview stage, it hit shared staging instead, wiping the effect of the post-deploy `patch:worker-loader` step. JARVIS took responsibility, got Jakub's explicit go-ahead ("ano"), ran `patch:worker-loader`, and verified via CF API + a live workflow firing. Smith independently re-confirmed by re-firing its own earlier `core.workflow-call` test workflow (parent `5a37aab5...`/child `b5de6b9e...`) — completed cleanly in 14.56s with the correct output, no more `TypeError`. Staging confirmed healthy again.

### Phase 3 — serial multi-subworkflow test, post-fix ([MEM-32])
Resumed the test JARVIS had originally asked for. Findings:
- `core.workflow-call` in a for-loop is reliable and strictly **sequential** (~31s for 3× 2s-delay children — not parallelized).
- Each call gets its own isolated child instance/id; no cross-call overwriting.
- An uncaught mid-sequence failure aborts the rest of the sequence (normal JS behavior); wrapping each call in its own try/catch lets subsequent calls proceed normally after a caught failure.

**Bigger finding:** re-ran the exact 3 bad-input/bad-output/bad-target scenarios from Phase 1 on the now-healthy platform and got 3 distinct, specific, actionable error messages (a Zod path detail, a "target unavailable in workspace/project scope" message, an `outputSchema` mismatch detail) instead of the old generic `TypeError`. Timing lines up: the original bad-path tests ran right after JARVIS's 06:54:46–06:55:06 stray deploy. This is strong evidence the Phase 1 "opaque identical error" finding (issue #199) was actually caused by the concurrent LOADER-binding regression (Phase 2), not a real `core.workflow-call` bug. Remaining nuance: an uncaught error surfaces a terser wrapper via `read_instance` than the same error caught via try/catch shows (400 generic vs. 422 detailed) — logged as a UX note, not a bug.

### Phase 4 — closeout ([MEM-33])
JARVIS posted the Phase 3 correction to issue #199 and closed it as a false positive; Smith independently verified the closure via `gh api` (state: closed, `closed_at` 2026-09-18T12:59:40Z, comment text matches).

**Final joint result with JARVIS** — `core.workflow-start`/`core.workflow-call` fully functional across all tested scenarios:
- Fire&forget and wait-for-completion (with output propagation).
- `inputSchema` fail-fast; `outputSchema` violation propagation.
- Readable, specific errors for bad input / bad target / bad output (confirmed post-LOADER-fix).
- N children in parallel (`Promise.all`, both wait and fire&forget modes) — ~14s vs. ~39s serial-equivalent, confirming real parallelism, with distinct non-colliding `instanceId`s.
- N children serially (for-loop) — ~31s = sum of delays, distinct instances, uncaught mid-sequence failure aborts the rest, caught failure lets it continue.

## Why it matters

This closes out subworkflow composition as a validated, reliable building block for future StepForge-adjacent Flowbrew workflow designs — both fire&forget and wait-for-completion patterns work as documented, error surfaces are readable once the platform itself is healthy, and both parallel and serial N-child composition behave predictably. It's also a second concrete instance of [MEM-25]'s pattern (independently verify a platform/plugin claim via the underlying system, not just another agent's report) — the "opaque error = bug" claim looked solid after 3 differential tests in Phase 1, and only fell apart because Smith retested the same scenarios independently once the concurrent regression was fixed.

## Consequences

- Two items remain open and are tracked as facts, not incidents: the `delayMs`(ms)→`step.sleep()` codegen gap (not yet filed as its own issue) and the `read_instance` terse-wrapper-on-uncaught-error UX nuance (landed as a follow-up idea in the #199 closing comment, not its own issue). See `semantic/flowbrew-platform-bugs-open.md`.
- The LOADER-binding regression itself was JARVIS-side (a stray `sst deploy` hitting shared staging) — no action item for Smith beyond the verification pattern already captured in [MEM-25].
- All test workflows created during the campaign were cleaned up (deleted) as usual; no orphaned staging resources.
