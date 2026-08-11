# Procedure: SST StepFunctions smoke-test tiers

## Context
Reusable structure from the 2026-08-11 validation campaign (see [[sst-stepfunctions-test-campaign-2026-08-11]] in episodic/). Use this shape when validating a new SST/AWS Step Functions pattern before relying on it in a delivered workflow — a real `start-execution` + result check is required, not just a successful `sst deploy` (several gotchas were deploy-time-invisible, e.g. [MEM-6]).

## Tiers

1. **Core state types** — Wait, Choice, Fail, Parallel/Map join, input/output filtering (JSONata `output`/`assign`), intrinsic functions.
2. **Lambda integration** — invoke, retry+backoff, catch/fallback, timeout (native field is broken in JSONata mode — use the Parallel-race workaround, [[sst-stepfunctions-deploy-gotchas]]), chained invokes (narrow `.Payload` between steps), Map-over-Lambda, distributed Map, heterogeneous Parallel branches, task-token round trip (success/timeout/explicit-failure).
3. **External service integrations** — whichever of SQS/SNS/EventBridge/DynamoDB/S3/nested-SFN/Express-vs-Standard the target workflow actually needs. Verify via the downstream side effect (e.g. `sqs receive-message`), not just execution status.
4. **Operational concerns** — idempotent redeploy (re-run `sst deploy`, expect zero diff), IAM audit (inline policies scoped to specific ARNs beyond the SST baseline — see [[sst-stepfunctions-iam-and-map]]), tracing/observability if required, versioning/redeploy-mid-execution behavior if the workflow is long-running, and a final teardown + orphan check if this was a throwaway validation stack.

## When to reuse

Full 4-tier run is for validating the platform/component itself (new SST version, new integration type never used before). For building an ordinary user-requested workflow, only run the tiers relevant to the integrations actually used — check `memory/semantic/sst-stepfunctions-*.md` first for a known gotcha before re-discovering it.
