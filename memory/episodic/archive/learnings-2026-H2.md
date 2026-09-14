# LEARNINGS.md Archive — 2026 H2 (Jul–Dec)

Append-only. Entries relocated here from `memory/core/LEARNINGS.md` by Step
5c of the memory-consolidate skill. Do not insert above existing content —
earlier archival pointers cite `:line` numbers into this file.

---

Archived 2026-09-13 — superseded-by-episodic-stepforge-multi-team-distribution (MEM-16 status ACTIVE — live rule, relocated for LEARNINGS.md size; pointer left at LEARNINGS.md)

- [MEM-16] Writes to `.claude/settings.json` and `.claude/hooks/` are blocked by the harness as a "sensitive file", regardless of explicit verbal authorization from the human owner in Slack (e.g. Jakub's "tohle zvladnes i Ty" go-ahead) — both direct Write and the `update-config` skill silently failed to create the files. This is a hard technical/sandbox boundary, not a permission-in-principle gate that chat instructions can lift. Correct path: the human must apply changes to these paths themselves via direct git access (clone/edit/push) — not delegate it to the agent.

Archived 2026-09-14 — superseded-by-episodic-sst-stepfunctions-test-campaign-2026-08-11 (MEM-2 status ACTIVE — live rule, relocated for LEARNINGS.md size; pointer left at LEARNINGS.md)

- [MEM-2] The environment can carry stray `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY` (e.g. leftover from a scoped test identity like `jarvis-test-s3-writer`) that silently override `--profile`/`AWS_PROFILE` in the AWS SDK credential chain — env vars win over profile files. Any `aws-cli`/`sst`/`pulumi` command that needs an SSO profile must run with `env -u AWS_ACCESS_KEY_ID -u AWS_SECRET_ACCESS_KEY -u AWS_DEFAULT_REGION AWS_PROFILE=<profile> ...` or it silently deploys/queries as the wrong identity and fails with confusing AccessDenied errors that look like the new profile lacks permissions. Detail: [[sst-stepfunctions-jsonata]] test campaign (2026-08-10) hit this first.
