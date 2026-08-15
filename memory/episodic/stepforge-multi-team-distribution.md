# StepForge multi-team distribution — design & rollout

## Context
Converged 2026-08-12 with DevGuru + Jakub on how to distribute Smith/StepForge's skills and structural rules across multiple teams' brain repos, since `stepforge-brain` started as this team's own single-instance wrapper.

## [MEM-13] Topology decision (2026-08-12)
1. New CLEAN-history **public** repo (`stepforge-skills`) containing only `skills/` + generic docs, submoduled read-only into each team's own repo at `.claude/skills/shared/`.
2. Team repo = SST code + durable team docs (architecture/decisions/conventions) together, split by write-frequency+audience, not brain-vs-workspace.
3. Agent's operational scratchpad (daily logs, episodic, MEM_REGISTRY, reports) stays local to the agent, never goes into any shared/reviewed repo.
4. Scope is Smith/StepForge instances only, NOT a universal brain across all platform agent types (that's the separate base-brain tier).

Public-repo gate needs TWO layers: shape-based grep as a mechanical pre-push/CI gate (account IDs, ARNs, access keys, emails, credential URLs — must fail loudly, non-zero exit) AND a human review step per-PR for "does this reveal too much internal detail" (no grep catches judgment calls) — written into `stepforge-skills`' `CONTRIBUTING.md`.

Found during design and fixed same-day: `eu-central-1` was hardcoded (not placeholder'd) in `aws-auth/SKILL.md` and `setup/SKILL.md`, inconsistent with the files' own `YOUR_ACCOUNT_ID`/`YOUR_ORG` placeholder convention — parameterized via `.local/config.yaml` as source of truth, committed `71fe067`.

DevGuru's two closing points (20:12): (5) harvest cycle — Smith reviews own scratchpad 1x/sprint against "would this help another team" and proactively opens a PR upstream, rather than relying on passive fork-sends-PR (DevGuru's own repo had proof this doesn't self-execute: an unmerged harvest branch sitting since 2026-08-03). (6) the `eu-central-1` fix above, done immediately rather than deferred.

## Execution (2026-08-12, 20:14 onward)
- 20:14 — Jakub gave go-ahead to build brain submodule support and prepare the public shared-skills content; JARVIS to create the target empty GH repo.
- 20:25 — `jakubknejzlik/stepforge-skills` populated: 16 files (aws-auth/deployment/setup/step-functions/lambda-blocks skills), fixed a stale `claude-sonnet-4-20250514` default in `ai-decide`, added `check-secrets.sh` mechanical grep gate + GH Actions CI wiring it to every push/PR. Empirically proved the gate works: pushed a fake AKIA-shaped string on a test branch, opened PR #1, confirmed CI failed red, downloaded the log as proof, then closed the PR unmerged and deleted the branch (`aada3c8`). Also fixed a real fail-open bug DevGuru caught: `xargs` without `-r` invokes `grep` with zero args on empty input, reading real stdin instead of scanning nothing.
- **[MEM-14]** (see `core/LEARNINGS.md`) — discovered here: deleting the PR #1 branch did NOT remove the fake secret from public reachability (`refs/pull/1/head`). Any future red-CI proof test must use an obviously-synthetic value only.
- 21:57 — Task #3 (submodule conversion) complete and verified in `stepforge-brain`: `.claude/skills/shared/` submodule added, `.claude/skills/local/` reserved (documented, not physically created — blocked by a hard "sensitive file" permission gate on new paths under `.claude/`), CLAUDE.md/README.md references updated. Task #4 (write-guard + SessionStart hook) content drafted but cannot self-apply `.claude/settings.json`/`.claude/hooks/` (same permission gate) — handed off to Jakub. Opened `stepforge-skills` PR #2 adding a "Step 0" to `setup/SKILL.md` so `/setup` establishes the write-guard+hook for every team.
- 22:00 — PR #2 updated (`642c15e`) after 3 DevGuru follow-ups: named the "/setup bump only reaches teams who rerun it" limit explicitly; moved `check-shared-mount.sh` canonical content into the submodule (`setup/templates/`); scheduled a message for 2026-08-13T08:00Z to verify the hook's stdout-vs-stderr behavior at a genuine fresh session boundary (couldn't be tested mid-session). CI green. **[Corrected 2026-08-14 reflection]** This was originally created `ONE_TIME`, then switched to a daily `CRON` (`0 8 * * *`, re-fires until the condition clears) at 2026-08-12T22:02Z per Slack thread `C0AU7QJ5X35`/`1786398477.943069` — this file wasn't updated at the time of the switch, causing the "one-time" language below to go stale immediately. See `[MEM-16]`/core/LEARNINGS.md for the downstream outcome.
- 23:23 — Jakub approved and merged PR #2 (squash, `93bcf26`). `stepforge-skills` now has `setup/templates/check-shared-mount.sh` + Step 0 in `setup/SKILL.md`. Task #4 still open pending Jakub applying `.claude/settings.json` + `.claude/hooks/check-shared-mount.sh` to `stepforge-brain`.

## [MEM-15] CLAUDE.md distribution — Option A (2026-08-12 23:23)
Jakub confirmed: extract structural/mechanical rules (submodule-enforcement, brain-stays-clean conventions, etc.) into a file in `stepforge-skills`, `@`-imported from each team's CLAUDE.md the same way `memory/SUMMARY.md` is already imported. Identity + local paths stay in the team's own CLAUDE.md.

DevGuru flagged a dependency: this makes the Step 0 startup check (task #4, still pending Jakub's deployment) load-bearing for the whole model — if the shared mount is empty, the agent silently loses not just skills but its own behavioral rules. **Deferred** starting implementation until task #4 (write-guard + startup check) is actually deployed and verified.

## Status as of 2026-08-13 04:00 UTC
- `stepforge-skills` repo live, PR #2 merged, CI green on main.
- Task #4 (write-guard `.claude/settings.json` deny rule + SessionStart hook) — content drafted, blocked on Jakub applying it (agent cannot self-write those sensitive paths).
- A recurring daily (`CRON 0 8 * * *`) scheduled message will perform the hook stdout/stderr verification test once Task #4 is live, and re-fire each morning until then.
- CLAUDE.md distribution (Option A, MEM-15) not yet started — explicitly deferred pending Task #4 verification.

## Status as of 2026-08-14 04:00 UTC (added during 2026-08-14 reflection)
- The daily CRON check (schedule `01KZVZST46PT2B8S97N72G4A9D`) fired as designed at 2026-08-13T08:00:47 UTC, confirmed neither `.claude/settings.json` nor `.claude/hooks/check-shared-mount.sh` exist yet, and posted a Slack status update ("Checked — still waiting on Jakub to deploy the guard...") to `C0AU7QJ5X35`/`1786398477.943069` — this ran correctly per its own instructions, but the outcome was never written to `memory/daily/2026-08-13.md`, so the 2026-08-14 consolidation report incorrectly stated "no daily-log evidence" of the check having fired at all (it had fired; it just wasn't logged locally). See `reports/2026-08-14-memory-reflection.md` for the full gap writeup.
- Task #4 is still unresolved as of this reflection — Jakub asked Smith to retry directly ("tohle zvladnes i Ty", 2026-08-13T15:39:59Z), Smith retried and hit the same hard harness block (now `[MEM-16]`), and the thread has no further activity after that. The CRON will fire again 2026-08-14T08:00Z.

## Status as of 2026-08-14 08:00 UTC
- The daily CRON check fired again as scheduled, confirmed the guard files still don't exist, posted a status update, and took no further action (logged in `memory/daily/2026-08-14.md`). No change since the 2026-08-14 04:00 status above — still blocked on Jakub.
