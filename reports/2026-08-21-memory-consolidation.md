# Maintenance Report: memory-consolidation
date: 2026-08-21
trigger: heartbeat

## Context

`scripts/maintenance-guard.sh` reported consolidation overdue (last ran 52h ago, past the 48h fallback threshold, running outside the normal window). `scripts/reflection-guard.sh` also reported due (last ran 2026-08-18, 3 days ago, threshold 3 days) — reflection ran in the same session immediately after this consolidation (see `reports/2026-08-21-memory-reflection.md`). Ran per the daily consolidation procedure, all Steps 0–12, no shortcuts.

## What happened

`memory/TODAY.md` held three unarchived date sections — `# 2026-08-19`, `# 2026-08-20`, `# 2026-08-21` — spanning three days of no consolidation (the guard was overdue). Archived each verbatim to its own `memory/daily/YYYY-MM-DD.md` file and reset `TODAY.md` to a fresh `# 2026-08-21` header. Five tracked keys ([MEM-17] through [MEM-21]) had accumulated in the daily logs without being promoted to a durable content file — all five were promoted this cycle: [MEM-17]/[MEM-18] to `core/LEARNINGS.md` as standalone lessons, and [MEM-19]/[MEM-20]/[MEM-21] to both `core/LEARNINGS.md` (condensed rule) and `episodic/stepforge-multi-team-distribution.md` (full narrative, as two new dated status sections continuing that project's existing structure). Separately, while investigating why `MEM_REGISTRY.md` had sat over its 5000B cap for 6 consecutive cycles, found the actual root cause: MEM-5, MEM-6, MEM-10, and MEM-16 had already been promoted to content files in earlier cycles, but their registry rows were never shortened to pointers — the automated `mem-registry-trim.ts` script structurally cannot catch these (MEM-5/MEM-10 each cite a second key in the same entry, which the script's single-key-only scope excludes; MEM-6/MEM-16 have a generic extracted section-heading hook the script doesn't trust). Manually verified all four promotions by reading both sides and shortened the rows, cutting the registry from 6481B to 3867B — back under threshold for the first time in 6+ cycles.

## Changes
- CREATE memory/daily/2026-08-19.md, memory/daily/2026-08-20.md, memory/daily/2026-08-21.md — verbatim archives of TODAY.md's three pending date sections
- MODIFY memory/TODAY.md — archived, reset to fresh `# 2026-08-21` header with the consolidation-started entry
- MODIFY memory/core/LEARNINGS.md — added [MEM-17], [MEM-18], [MEM-19]/[MEM-20] (combined), [MEM-21] (1985→3869 bytes)
- MODIFY memory/episodic/stepforge-multi-team-distribution.md — added "Status as of 2026-08-19 — PR #3 self-merged..." and "Status as of 2026-08-20 — Task #4 deployed live..." sections (58→68 lines)
- MODIFY memory/MEM_REGISTRY.md — shortened MEM-17 through MEM-21 to pointer format at write time; manually shortened MEM-5, MEM-6, MEM-10, MEM-16 to pointers after verifying their promotions (6481→3867 bytes)
- MODIFY memory/SUMMARY.md — fresh timestamp (2026-08-21 04:22 UTC), added 4 new Key Rules bullets (MEM-16/18, MEM-17, MEM-19/20, MEM-21), rewrote the multi-team-distribution Active Projects bullet for the Task #4 live-deployment status, updated Deep Memory Index (registry byte count, daily/ file count, LEARNINGS.md entry count); 6448→7660 bytes
- MODIFY memory/.last_consolidation — 2026-08-19 → 2026-08-21

## [MEM] Promotions
| Key | Destination | Action | Verification |
|-----|-------------|--------|---------------|
| MEM-17 | core/LEARNINGS.md | ADD | VERIFIED (grep) |
| MEM-18 | core/LEARNINGS.md | ADD | VERIFIED (grep) |
| MEM-19 | core/LEARNINGS.md + episodic/stepforge-multi-team-distribution.md | ADD | VERIFIED (grep) |
| MEM-20 | core/LEARNINGS.md + episodic/stepforge-multi-team-distribution.md | ADD | VERIFIED (grep) |
| MEM-21 | core/LEARNINGS.md + episodic/stepforge-multi-team-distribution.md | ADD | VERIFIED (grep) |

MEM-19 and MEM-20 were combined into a single condensed LEARNINGS.md bullet (they're two halves of one lesson — an action and its correction) but kept as separate registry rows and separate full-narrative episodic sections, so both keys remain independently traceable.

## [MEM] Lifecycle
No entries marked OBSOLETE this cycle. MEM-19 (the self-merge decision) is followed by MEM-20 (a correction of the reasoning behind it) but MEM-19 is not superseded/contradicted — it's a historical record of what happened, which the correction explains rather than replaces — so both stay ACTIVE, matching this brain's existing pattern (e.g. MEM-4/MEM-11 root-cause correction) of correcting-in-place rather than obsoleting. No previously-OBSOLETE entries awaiting REMOVED processing (only MEM-1 has ever been REMOVED).

## Tier Coverage
- core/ (corrections, preferences, lessons): Updated `core/LEARNINGS.md` with [MEM-17], [MEM-18], [MEM-19]/[MEM-20], [MEM-21] ✅
- semantic/ (facts, knowledge): No new content — confirmed ✅ (3 files reviewed for staleness/size, most recent touch 2026-08-13, oldest 2026-08-11, all well within the 30-day window; largest is 12 lines)
- episodic/ (significant events): Updated `episodic/stepforge-multi-team-distribution.md` with two new dated status sections (2026-08-19, 2026-08-20) ✅
- procedural/ (workflows): No new workflows — confirmed ✅

## Semantic Lifecycle
- Files scanned: 3 (sst-stepfunctions-deploy-gotchas.md, sst-stepfunctions-iam-and-map.md, sst-stepfunctions-jsonata.md)
- Stale (30+ days): 0 (most recent touch 2026-08-13, oldest 2026-08-11 — 8-10 days)
- Actions: 0 KEEP/UPDATE/DELETE needed — nothing stale
- Oversized (>100 lines): 0 (largest is 12 lines)
- Merges: 0 (all three files cover distinct sub-topics)
- Files changed: none

## LEARNINGS.md Reduction
Skipped — `memory/core/LEARNINGS.md` is 3869 bytes after this cycle's promotions, still under the 5000B threshold (Step 5c preflight `wc -c` check).

## LEARNINGS.md Promoted-Entry Trim
Skipped — `memory/core/LEARNINGS.md` is under 5000 bytes (Step 5d only runs when Step 9b flags it over cap).

## MEM_REGISTRY Archival
Ran `mem-registry-archive.ts`: no-op — "No REMOVED rows in live registry — already archived (1 in archive)." 0 REMOVED rows in the live registry.

## MEM_REGISTRY Promoted-Row Trim
Ran `mem-registry-trim.ts` (backfill scan mode) since `MEM_REGISTRY.md` was 6481 bytes (over threshold) before manual intervention:
- Proposed: 1 (MEM-20 → episodic/stepforge-multi-team-distribution.md:62)
- Applied via `--apply --only MEM-20`: script aborted (exit 1) — "Trim increased registry size (6481 → 6528 bytes)" — because the registry row I had already written manually at promotion time (Step 1b) was shorter than the script's proposed pointer. No write performed; correct abort behavior.
- Excluded for unreliable hook: MEM-5 (hook="Context"), MEM-6 (hook="Context"), MEM-16 (hook="Learnings"), MEM-21 (hook="Learnings")
- **Manual trim (outside script scope):** reviewed MEM-5, MEM-6, MEM-10, and MEM-16 by hand — read both the registry row and the destination file's actual entry side by side, confirmed each registry row was a stale full-text duplicate of content already promoted (MEM-5/MEM-6 in `semantic/sst-stepfunctions-jsonata.md`, MEM-10 in `semantic/sst-stepfunctions-iam-and-map.md`, MEM-16 in `core/LEARNINGS.md`), and shortened all four to pointers. This is exactly the "incremental path... no ambiguity to review" case for MEM-16/17-21 (I authored those promotions this run) but a genuine backfill-path manual review for MEM-5/6/10 (promoted in a prior cycle, verified now).
- Size delta: 6481 → 3867 bytes (-2614 bytes)

`MEM_REGISTRY.md` is now under its 5000B threshold for the first time since at least 2026-08-13 (6 consecutive over-cap cycles before this one).

## MEM Audit
- Total keys: 21
- ACTIVE: 20 (MEM-2 through MEM-21), REMOVED: 1 (MEM-1, archived in a prior cycle)
- New this cycle: 5 (MEM-17, MEM-18, MEM-19, MEM-20, MEM-21)
- Obsoleted this cycle: 0
- Integrity: ✅ all 20 ACTIVE keys found in at least one content file (verified via grep across core/, semantic/, episodic/, procedural/, excluding the registry and daily/) — counts range from 1–3 files per key
- Sequence: ✅ no unexplained gaps (MEM-1's gap is explained by its REMOVED status)
- Comparison with previous run: ACTIVE count 15→20 (+5, expected — matches the 5 new keys promoted this cycle, no alarm)

## Memory Metrics
| File | Size (bytes) | Threshold | Status |
|------|-------------|-----------|--------|
| CLAUDE.md | 8151 | 10000 | :white_check_mark: |
| SUMMARY.md | 7660 | 9000 | :white_check_mark: |
| LEARNINGS.md | 3869 | 5000 | :white_check_mark: |
| MEM_REGISTRY.md | 3867 | 5000 | :white_check_mark: |
| PREFERENCES.md | 93 | 5000 | :white_check_mark: |
| MISTAKES.md | 80 | — | — |
| TODAY.md | 76 | — | — |

## CLAUDE.md Reduction
Skipped — `CLAUDE.md` is 8151 bytes, under the 10000B threshold.

## Daily Log Compliance
- Coverage (last 7d): 6/6 session-days logged (2026-08-15 through 2026-08-20, per `git log --format='%as' --since='7 days ago'`) — 100% ✅ (all 6 days already had `memory/daily/` files after this cycle's Step 0 archived the 3 pending TODAY.md sections)
- Today's log: no user sessions before this consolidation (`git log --oneline --since=midnight` empty at 04:18 UTC) — not applicable
- Continuous appends: 2026-08-20's archived log has 5 distinct timestamped entries (start-of-day + 08:07, 08:08, 08:16, 08:17) — not a single end-of-session dump ✅
- Retention: today's `memory/TODAY.md` (`# 2026-08-21`) and yesterday's `memory/daily/2026-08-20.md` both preserved after consolidation ✅
- Empty/trivial logs: 0 (all 12 files in `memory/daily/` contain real content, 287–12025 bytes)
- Gaps: none — this cycle's Step 0 closed the only gap (3 unarchived TODAY.md sections were 3 already-logged session days, not missing ones, so no stub-backfill and no [self-critique] is required for this bullet)
- `@` imports: CLAUDE.md contains both `@memory/SUMMARY.md` and `@memory/TODAY.md` ✅

## Heartbeat Self-Report
`HEARTBEAT.md` confirmed absent from the brain root (goal state, per `teamvibeai/teamvibe.ai#102`). `heartbeatStatus`: present=false, nonEmpty=false, itemCount=0.

## Decisions
- Archived 3 pending TODAY.md date sections (2026-08-19, 2026-08-20, 2026-08-21) to 3 separate new `memory/daily/*.md` files per Step 0's multi-section rule, since the guard had gone 52h overdue (2 missed cycles) rather than the usual single pending day.
- Promoted [MEM-17] through [MEM-21] from daily-log-only entries to durable content files (`core/LEARNINGS.md` + `episodic/stepforge-multi-team-distribution.md`), closing a 2-day promotion backlog.
- Manually diagnosed and fixed the actual cause of `MEM_REGISTRY.md`'s 6-cycle cap breach: MEM-5, MEM-6, MEM-10, MEM-16 were long-promoted rows never shortened to pointers, invisible to the automated scripts for structural reasons (multi-key entries, generic hooks) rather than genuinely absent — cut registry from 6481B to 3867B.
- Kept MEM-19 and MEM-20 both ACTIVE (not obsoleting MEM-19) since MEM-20 corrects the reasoning behind MEM-19's decision rather than superseding the historical fact that the decision was made.

## Consequences
- ✅ `MEM_REGISTRY.md` is back under its 5000B cap for the first time in 6+ cycles, and the root cause (mechanically-undetectable already-promoted rows) is now documented so a future stuck cycle can go straight to a manual audit instead of re-running the same no-op scripts.
- ⚠️ The mechanical trim/archive scripts will very likely stall again on the *next* multi-key or generic-hook row that gets fully promoted without a matching registry-row shortening — this cycle's fix was a one-time manual catch-up, not a process change. Nothing currently reminds a future consolidation to check for this pattern proactively; flagged as this run's process self-critique.

## Files changed
- Created: memory/daily/2026-08-19.md, memory/daily/2026-08-20.md, memory/daily/2026-08-21.md, reports/2026-08-21-memory-consolidation.md, reports/2026-08-21-memory-consolidation.json
- Modified: memory/TODAY.md, memory/core/LEARNINGS.md, memory/episodic/stepforge-multi-team-distribution.md, memory/MEM_REGISTRY.md, memory/SUMMARY.md, memory/.last_consolidation

Commit: (recorded after commit — see JSON report `brainCommitSha` for the pre-commit HEAD)
