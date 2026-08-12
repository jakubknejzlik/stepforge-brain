# Event: SST v3 StepFunctions JSONata test campaign completed

**Date:** 2026-08-10 to 2026-08-11
**Outcome:** All 32 planned test scenarios (Tier1–Tier4) SUCCEEDED/verified as expected.

## What happened

Ran a structured 4-tier validation of the `sst.aws.StepFunctions` component (JSONata query language mode) against a real AWS account, to build confidence in the patterns this brain will use for future workflow builds:

- **Tier1 (1–8):** core state types — Wait, Choice, Fail, Parallel/Map join, input/output filtering, intrinsics.
- **Tier2 (9–18):** Lambda integration — invoke/echo, retry+backoff, catch/fallback, timeout workaround, chained invokes, Map-over-Lambda, distributed Map, heterogeneous Parallel branches, task-token round trip (auto success, race-timeout, explicit failure).
- **Tier3 (19–26):** external service integrations — SQS send, SNS publish, EventBridge PutEvents, EventBridge schedule→SFN trigger, DynamoDB put/get via task() escape hatch, S3 read/write via linked Bucket, nested SFN (`.sync:2`), Express vs Standard workflow semantics.
- **Tier4 (27–32):** operational concerns — idempotent redeploy, IAM baseline audit, X-Ray/CloudWatch tracing, Map partial-failure tolerance (inline vs distributed), mid-flight redeploy/versioning semantics, full teardown with zero-orphan verification.

Before this campaign, an AWS credentials blocker ([MEM-1], now OBSOLETE) prevented any deploy — resolved same-day via real SSO setup (knedlopark), which also surfaced the env-var-precedence lesson now in `core/LEARNINGS.md` ([MEM-2]).

## Why it matters

Surfaced 8 non-obvious gotchas in the SST v3 JSONata-mode StepFunctions component that are invisible from the SST docs alone — now captured in `memory/semantic/`:
- [[sst-stepfunctions-jsonata]] — data-flow/payload gotchas (MEM-3, MEM-5, MEM-6)
- [[sst-stepfunctions-deploy-gotchas]] — deploy/build-time gotchas (MEM-4, MEM-7, MEM-9)
- [[sst-stepfunctions-iam-and-map]] — IAM baseline & Map fault-tolerance (MEM-8, MEM-10)

These directly inform how future workflows built by this agent should be structured (e.g. always narrow `lambdaInvoke` output to `.Payload` before chaining, never rely on native Task `timeout`, use `mode:'standard'` Map when partial-failure tolerance is required).

## Consequences

- The full campaign's infra code lives in the workspace repo's commit history even though the live AWS resources were torn down in Tier4 #31 (`sst remove --stage dev`, verified zero orphans across 9 service categories).
- No workflows have been built for a real user yet — this was pure platform validation, not a delivered workflow.
- [MEM-4]'s "genuine AWS/JSONata gap" root-cause claim for the Tier2 #12 timeout gotcha was corrected: empirically verified (local patch + real deploy/execution) as a one-line SST bug (`Timeout`→`TimeoutSeconds` ASL field name), fixed upstream via PR **anomalyco/sst#6966** (not yet merged as of 2026-08-11). See [[sst-stepfunctions-deploy-gotchas]] MEM-4/MEM-11. This closes out the campaign end-to-end: all 32 scenarios verified, one root cause found and fixed upstream.
