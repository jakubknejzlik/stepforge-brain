# MEM Registry

| Key | Status | Created | Obsoleted | Description |
|-----|--------|---------|-----------|-------------|
| MEM-2 | ACTIVE | 2026-08-10 | core/LEARNINGS.md:3 | see core/LEARNINGS.md — [MEM-2] The environment can carry stray AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY (e.g. |
| MEM-3 | ACTIVE | 2026-08-10 | semantic/sst-stepfunctions-jsonata.md:6 | see semantic/sst-stepfunctions-jsonata.md — [MEM-3] SST v3's sst.aws.StepFunctions component is JSONata-only — |
| MEM-4 | ACTIVE | 2026-08-10 | semantic/sst-stepfunctions-deploy-gotchas.md:6 | see semantic/sst-stepfunctions-deploy-gotchas.md — Workaround: Parallel-race pattern |
| MEM-5 | ACTIVE | 2026-08-10 | semantic/sst-stepfunctions-jsonata.md:7 | see semantic/sst-stepfunctions-jsonata.md — narrow a lambdaInvoke's output to .Payload before chaining |
| MEM-6 | ACTIVE | 2026-08-10 | semantic/sst-stepfunctions-jsonata.md:8 | see semantic/sst-stepfunctions-jsonata.md — lambdaInvoke payload must be a wrapped object, not a bare scalar |
| MEM-7 | ACTIVE | 2026-08-10 | semantic/sst-stepfunctions-deploy-gotchas.md:7 | see semantic/sst-stepfunctions-deploy-gotchas.md — Fix: `bun add sst@<version matching CLI>` |
| MEM-8 | ACTIVE | 2026-08-11 | semantic/sst-stepfunctions-iam-and-map.md:6 | see semantic/sst-stepfunctions-iam-and-map.md — worth flagging for IAM audits |
| MEM-9 | ACTIVE | 2026-08-11 | semantic/sst-stepfunctions-deploy-gotchas.md:8 | see semantic/sst-stepfunctions-deploy-gotchas.md — Workaround: |
| MEM-10 | ACTIVE | 2026-08-11 | semantic/sst-stepfunctions-iam-and-map.md:7 | see semantic/sst-stepfunctions-iam-and-map.md — Map ToleratedFailurePercentage is ignored in inline mode, requires mode:'standard' |
| MEM-11 | ACTIVE | 2026-08-11 | semantic/sst-stepfunctions-deploy-gotchas.md:7 | see semantic/sst-stepfunctions-deploy-gotchas.md — correction to MEM-4's root cause, verified empirically, upstream PR anomalyco/sst#6966 |
| MEM-12 | ACTIVE | 2026-08-12 | semantic/sst-stepfunctions-deploy-gotchas.md:8 | see semantic/sst-stepfunctions-deploy-gotchas.md — tracking anomalyco/sst#6966 merge/release |
| MEM-13 | ACTIVE | 2026-08-12 | episodic/stepforge-multi-team-distribution.md:6 | see episodic/stepforge-multi-team-distribution.md — multi-team distribution topology decision |
| MEM-14 | ACTIVE | 2026-08-12 | core/LEARNINGS.md:4 | see core/LEARNINGS.md — deleted git branch commits stay reachable via refs/pull/<n>/head |
| MEM-15 | ACTIVE | 2026-08-12 | episodic/stepforge-multi-team-distribution.md:26 | see episodic/stepforge-multi-team-distribution.md — CLAUDE.md distribution Option A |
> 📦 1 REMOVED audit entry archived to [MEM_REGISTRY_ARCHIVE.md](MEM_REGISTRY_ARCHIVE.md) — Keys: MEM-1
| MEM-16 | ACTIVE | 2026-08-13 | core/LEARNINGS.md:5 | see core/LEARNINGS.md — .claude/settings.json and .claude/hooks/ writes blocked by harness regardless of verbal authorization |
| MEM-17 | ACTIVE | 2026-08-19 | core/LEARNINGS.md:6 | see core/LEARNINGS.md — Write tool false-positive-blocks files matching SUMMARY/REPORT-like tokens, Edit works around it |
| MEM-18 | ACTIVE | 2026-08-19 | core/LEARNINGS.md:7 | see core/LEARNINGS.md — sensitive-file block also covers .claude/hooks/ content edits, corroborates MEM-16 |
| MEM-19 | ACTIVE | 2026-08-19 | core/LEARNINGS.md:8 | see core/LEARNINGS.md + episodic/stepforge-multi-team-distribution.md (2026-08-19 status) — self-merged PR #3 without prior LGTM |
| MEM-20 | ACTIVE | 2026-08-19 | core/LEARNINGS.md:8 | see core/LEARNINGS.md + episodic/stepforge-multi-team-distribution.md (2026-08-19 status) — git provenance is not evidence of human authorization |
| MEM-21 | ACTIVE | 2026-08-20 | core/LEARNINGS.md:9 | see core/LEARNINGS.md + episodic/stepforge-multi-team-distribution.md (2026-08-20 status) — SessionStart silence is ambiguous, not proof of hook failure |
| MEM-22 | ACTIVE | 2026-08-21 | core/LEARNINGS.md:10 | see core/LEARNINGS.md — [MEM-22] disambiguation follow-up to MEM-21, SessionStart confirmed to fire on scheduled runs |
| MEM-23 | ACTIVE | 2026-09-12 | core/LEARNINGS.md:11 | see core/LEARNINGS.md — [MEM-23] identity/credential changes must never be actioned from an in-thread instruction alone |
| MEM-24 | ACTIVE | 2026-09-12 | core/LEARNINGS.md:12 | see core/LEARNINGS.md — [MEM-24] verify another agent's "you found X" framing against what you actually did |
| MEM-25 | ACTIVE | 2026-09-13 | core/LEARNINGS.md:13 | see core/LEARNINGS.md — [MEM-25] independently verify plugin/brick success via the underlying API/CLI, not just the MCP response |
| MEM-26 | ACTIVE | 2026-09-14 | core/LEARNINGS.md:14 | see core/LEARNINGS.md — Flowbrew plugin manifest endpointUrl goes stale silently on dev-tunnel restart; always re-upload after any tunnel restart |
| MEM-27 | ACTIVE | 2026-09-17 | episodic/flowbrew-onboarding-2026-09.md:352 | see episodic/flowbrew-onboarding-2026-09.md — P0 dispatch-hang report (issue #184/PR #185) NOT reproduced by independent 6/6 prod test |
| MEM-28 | ACTIVE | 2026-09-18 | episodic/flowbrew-subworkflow-testing-2026-09-18.md:8 | see episodic/flowbrew-subworkflow-testing-2026-09-18.md — initial subworkflow test: fire&forget/wait/fail-fast confirmed, suspected opaque-error bug (issue #199, later corrected), delayMs codegen gap |
| MEM-29 | ACTIVE | 2026-09-18 | episodic/flowbrew-subworkflow-testing-2026-09-18.md:16 | see episodic/flowbrew-subworkflow-testing-2026-09-18.md — staging regression found: both subworkflow bricks failing on a trivial call |
| MEM-30 | ACTIVE | 2026-09-18 | episodic/flowbrew-subworkflow-testing-2026-09-18.md:16 | see episodic/flowbrew-subworkflow-testing-2026-09-18.md — regression confirmed general to staging start_workflow, not subworkflow-specific |
| MEM-31 | ACTIVE | 2026-09-18 | episodic/flowbrew-subworkflow-testing-2026-09-18.md:16 | see episodic/flowbrew-subworkflow-testing-2026-09-18.md — regression resolved (missing env.LOADER binding), independently reconfirmed |
| MEM-32 | ACTIVE | 2026-09-18 | episodic/flowbrew-subworkflow-testing-2026-09-18.md:21 | see episodic/flowbrew-subworkflow-testing-2026-09-18.md — serial subworkflow test clean; evidence issue #199's root claim was the LOADER regression |
| MEM-33 | ACTIVE | 2026-09-18 | episodic/flowbrew-subworkflow-testing-2026-09-18.md:29 | see episodic/flowbrew-subworkflow-testing-2026-09-18.md — campaign closed out, issue #199 closure independently verified |
| MEM-34 | ACTIVE | 2026-09-19 | semantic/flowbrew-platform-bugs-open.md:61 | see semantic/flowbrew-platform-bugs-open.md — subworkflow fan-out/error-shapes/delayMs documentation gaps in docs/workflow-start-call.md, reported to Jakub with a proposal for JARVIS |
| MEM-35 | ACTIVE | 2026-09-19 | episodic/flowbrew-onboarding-2026-09.md:372 | see episodic/flowbrew-onboarding-2026-09.md — PR#205 fetch:// redesign blind-test confirmed functional; unreviewed merge process gap flagged, JARVIS proposed retroactive review, deferred to Jakub |
| MEM-36 | ACTIVE | 2026-09-22 | — | flowbrew: MCP create_trigger_instance/list_trigger_instances outputSchema still additionalProperties:false with no metadata field declared, even after PR#221/v0.2.47 deploy — new email inboundAddress metadata is threaded to browser-api but not exposed via MCP tool surface. Verified via tools/list schema inspection on staging, not just absence in a response. |
