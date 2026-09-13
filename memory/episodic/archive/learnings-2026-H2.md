# LEARNINGS.md Archive — 2026 H2 (Jul–Dec)

Append-only. Entries relocated here from `memory/core/LEARNINGS.md` by Step
5c of the memory-consolidate skill. Do not insert above existing content —
earlier archival pointers cite `:line` numbers into this file.

---

Archived 2026-09-13 — superseded-by-episodic-stepforge-multi-team-distribution (MEM-16 status ACTIVE — live rule, relocated for LEARNINGS.md size; pointer left at LEARNINGS.md)

- [MEM-16] Writes to `.claude/settings.json` and `.claude/hooks/` are blocked by the harness as a "sensitive file", regardless of explicit verbal authorization from the human owner in Slack (e.g. Jakub's "tohle zvladnes i Ty" go-ahead) — both direct Write and the `update-config` skill silently failed to create the files. This is a hard technical/sandbox boundary, not a permission-in-principle gate that chat instructions can lift. Correct path: the human must apply changes to these paths themselves via direct git access (clone/edit/push) — not delegate it to the agent.
