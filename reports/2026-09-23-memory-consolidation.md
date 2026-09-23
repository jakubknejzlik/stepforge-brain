# Maintenance Report: memory-consolidation
date: 2026-09-23
trigger: scheduled

## Context
Overdue per `maintenance-guard.sh` (last ran 51h ago, 48h fallback threshold, running outside the normal window). Reflection was also overdue (`reflection-guard.sh`: last ran 4d ago, 3d threshold) and was run as part of this same session — see `reports/2026-09-23-memory-reflection.md` for that portion; this report covers consolidation only, with `reflectionStatus` reflecting the just-completed reflection.

## What happened
Archived `memory/TODAY.md`'s three date sections (`2026-09-21`, `2026-09-22`, `2026-09-23`) verbatim to `memory/daily/`, reset `TODAY.md` for today. Scanned daily logs since the last consolidation (2026-09-21) and found 4 tracked `[MEM-NNN]` entries (MEM-36 through MEM-39, all registered same-day by the regular 2026-09-22 session but not yet promoted to a content tier) — promoted all four to `memory/semantic/flowbrew-platform-bugs-open.md`, grep-verified, and updated their `MEM_REGISTRY.md` pointers. Extracted the day's larger Flowbrew email-to-slack campaign (staging build/validate/wipe, prod rebuild blocked on a workspace-identity incident with `FLOWBREW_API_TOKEN`) into a new episodic file, and added a standing workspace-mismatch warning to `semantic/flowbrew-platform-reference.md`. Regenerated `memory/SUMMARY.md` with a fresh timestamp (required one inline trim of the Active Projects section to stay under the 9000B cap). Ran the MEM_REGISTRY.md archive/trim scripts (both no-op — 35/38 rows already pointer-form, 0 live REMOVED) and the LEARNINGS.md scaled-threshold check (under cap, skipped reduction steps). No daily logs are yet 30+ days old, so no deletions this cycle. `HEARTBEAT.md` does not exist. Full daily-log weekly coverage: 8/8 session days in the trailing 7 days have a `memory/daily/*.md` file.

## Changes
- CREATE memory/daily/2026-09-22.md, memory/daily/2026-09-23.md — archived from TODAY.md
- MODIFY memory/daily/2026-09-21.md — appended TODAY.md's 2026-09-21 section
- MODIFY memory/TODAY.md — reset with today's header + consolidation-started entry
- MODIFY memory/semantic/flowbrew-platform-bugs-open.md — promoted MEM-36/37/38/39 (MCP tool-surface lag ×3, staging no-MX bug)
- MODIFY memory/semantic/flowbrew-platform-reference.md — added FLOWBREW_API_TOKEN workspace-mismatch warning
- CREATE memory/episodic/flowbrew-email-to-slack-campaign-2026-09-22.md — full campaign narrative (staging build/wipe, prod workspace-identity incident)
- MODIFY memory/MEM_REGISTRY.md — filled in destination pointers for MEM-36/37/38/39
- MODIFY memory/SUMMARY.md — fresh timestamp, updated Active Projects and Deep Memory Index, one inline trim to stay under 9000B

## Decisions
1. Promoted MEM-36/MEM-37/MEM-38/MEM-39 to `semantic/flowbrew-platform-bugs-open.md` (not `core/LEARNINGS.md`) — classified as Flowbrew platform facts, consistent with how MEM-27 through MEM-35 were routed to the same topic file.
2. Extracted the 2026-09-22 Flowbrew email-to-slack campaign into its own episodic file rather than leaving it only in the daily log — it spans 3 distinct phases (staging build, staging wipe, prod rebuild blocked on a workspace-identity incident) with a still-open action item (Jakub needs to verify the `FLOWBREW_API_TOKEN` secret and complete Slack connection verification).
3. Kept the 3 stale SST/StepFunctions semantic files (30+ days, last touched 2026-08-11/13) as-is — reviewed and re-confirmed accurate, no SST work occurred this cycle to contradict them.
4. Did not run LEARNINGS.md's Step 5c/5d reduction — `mem-scaled-threshold.ts --mode learnings` reports 4715B under its 5000B scaled cap.
5. Ran both `mem-registry-archive.ts` and `mem-registry-trim.ts` against the over-cap `MEM_REGISTRY.md` (7826B vs. 6000B scaled threshold, 38 rows) — both no-op'd (0 live REMOVED rows; 35/38 already pointer-form with no fresh promotable candidates) — flagged rather than force-trimmed.

## Tier Coverage
- core/ (corrections, preferences, lessons): No new content this cycle — confirmed ✅ (MEM-36-39 classified as semantic platform facts, not core lessons)
- semantic/ (facts, knowledge): Updated flowbrew-platform-bugs-open.md (+MEM-36/37/38/39) and flowbrew-platform-reference.md (+workspace-mismatch warning) ✅
- episodic/ (significant events): Created flowbrew-email-to-slack-campaign-2026-09-22.md ✅
- procedural/ (workflows): No new content — confirmed ✅ (no new reusable procedure learned this cycle)

## MEM Audit
- Total keys: 39 (MEM-1 through MEM-39)
- ACTIVE: 38, OBSOLETE: 0, REMOVED: 1 (archived to MEM_REGISTRY_ARCHIVE.md)
- New this cycle: 4 (MEM-36, MEM-37, MEM-38, MEM-39) — registered by the 2026-09-22 regular session, promoted to a content tier and grep-verified this cycle
- Obsoleted this cycle: 0
- Integrity: ✅ all 38 ACTIVE keys found in content files (grep-verified, excluding MEM_REGISTRY.md and daily/)
- Sequence: ✅ no unexplained gaps — MEM-1 is REMOVED/archived, explained in the registry

## Memory Metrics
| File | Size (bytes) | Threshold | Status |
|------|-------------|-----------|--------|
| CLAUDE.md | 8151 | 10000 | ✅ |
| SUMMARY.md | 8938 | 9000 | ✅ |
| LEARNINGS.md | 4715 | 5000 (scaled, 12 entries) | ✅ |
| MEM_REGISTRY.md | 7826 | 6000 (scaled, 38 rows) | ⚠️ |
| PREFERENCES.md | 93 | 5000 | ✅ |
| MISTAKES.md | 80 | 5000 | ✅ |
| TODAY.md | 55 | — | — |

## MEM_REGISTRY Archival
Ran `mem-registry-archive.ts`: no-op — 0 live REMOVED rows (1 already archived to `MEM_REGISTRY_ARCHIVE.md` from a prior cycle).

## MEM_REGISTRY Promoted-Row Trim
Ran `mem-registry-trim.ts`: no candidates proposed. 4 destination lines rejected as index-shaped (pointer/lookup rows, not condensed narrative), 2 keys excluded for an unreliable extracted hook, 35/38 data rows already pointer-form against 28 destination files. No-op — registry remains 1826B over its scaled cap with no reachable reduction path this cycle (see `reflection-2026-09-23.md` Gap Analysis for the 3-cycle recurrence of this exact condition).

## Semantic Lifecycle
- Files scanned: 6 (3 SST/SFN gotcha files, flowbrew-platform-reference.md, flowbrew-platform-bugs-open.md, flowbrew-platform-bugs-resolved.md) — as they stood during this consolidation's own pass, before this cycle's reflection phase
- Stale (30+ days): 3 (sst-stepfunctions-{jsonata,deploy-gotchas,iam-and-map}.md, last touched 2026-08-11/13) — reviewed 2026-09-23, content still accurate, KEPT
- Actions: 3 KEEP (reviewed); 0 UPDATE; 0 DELETE
- Oversized (>100 lines): 2 flagged (flowbrew-platform-bugs-open.md at 111 lines post-promotion, flowbrew-platform-reference.md at 114 lines post-update) — not split during consolidation itself per the gradual-reduction discipline; `flowbrew-platform-bugs-open.md` was subsequently split during this cycle's reflection phase into itself (84 lines) plus new `flowbrew-platform-codegen-gaps.md` (45 lines) — see `reports/2026-09-23-memory-reflection.md`. `flowbrew-platform-reference.md` (now 117 lines) remains oversized, deferred to a future cycle.
- Merges: 0

## Daily Log Compliance
- Today's log: no user sessions before this consolidation — not applicable
- Continuous appends: memory/daily/2026-09-22.md has 15 distinct timestamped/bulleted entries (not a single dump) ✅
- Retention: memory/TODAY.md (today) and memory/daily/2026-09-22.md (yesterday) both present after consolidation ✅
- Empty/trivial logs: 0 (all 12 files in memory/daily/ have at least 1 content line)
- Coverage (last 7d): 8/8 (100%) ✅ — session days 2026-09-16 through 2026-09-23 (via `git log --format='%as' --since='7 days ago'`), all already had or received a `memory/daily/YYYY-MM-DD.md` file. Note: 2026-09-22.md and 2026-09-23.md did not exist before this run, but were populated via this cycle's normal Step 0 TODAY.md archival (real session content), not the git-log stub-backfill path — no self-critique required per the skill's distinction between the two mechanisms.
- `@` imports: CLAUDE.md contains both `@memory/SUMMARY.md` and `@memory/TODAY.md` ✅

## Process Self-Critique
- MEM_REGISTRY.md has been over its scaled cap for 3 consecutive consolidation cycles (2026-09-18, 2026-09-19, 2026-09-23) with both `mem-registry-archive.ts` and `mem-registry-trim.ts` finding zero candidates each time (35/38 rows already pointer-form, 0 live REMOVED) — the mechanical reduction path is structurally exhausted for this registry's current shape, and no one has yet proposed a fix to the scaling formula itself or a new reduction mode.
- `flowbrew-platform-reference.md` crossed the 100-line guideline this cycle (117 lines) for the second time without being split, deferred again as "still one cohesive topic" — this is the same watch-don't-fix judgment that let its sibling `flowbrew-platform-bugs-open.md` grow to 111 lines before finally being split during this cycle's reflection; worth tracking whether `reference.md` follows the same trajectory next cycle.

## Consequences
- ✅ MEM-36 through MEM-39 (all 4 tracked keys registered by the 2026-09-22 session) are now promoted, grep-verified, and correctly pointed-to from `MEM_REGISTRY.md`; the day's larger Flowbrew campaign has a dedicated episodic record with the still-open `FLOWBREW_API_TOKEN` workspace-mismatch flagged in `semantic/flowbrew-platform-reference.md` for the next session to check before trusting that secret.
- ⚠️ `memory/MEM_REGISTRY.md` remains 1826B over its scaled cap for a third straight cycle with no mechanical reduction path currently reachable — see reflection's recommendation to review the scaled-threshold formula itself upstream.

## Files changed
- Created: memory/daily/2026-09-22.md, memory/daily/2026-09-23.md, memory/episodic/flowbrew-email-to-slack-campaign-2026-09-22.md, reports/2026-09-23-memory-consolidation.md, reports/2026-09-23-memory-consolidation.json
- Modified: memory/TODAY.md, memory/daily/2026-09-21.md, memory/semantic/flowbrew-platform-bugs-open.md, memory/semantic/flowbrew-platform-reference.md, memory/MEM_REGISTRY.md, memory/SUMMARY.md
- Deleted: none

Commit: (recorded after commit)
