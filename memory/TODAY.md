# 2026-04-27

- Morning — Heartbeat consolidation + reflection. Archived 04-26 entries to daily/2026-04-26.md. Brain still idle — day 7 with no user sessions since bootstrap. All daily logs (04-21 through 04-26) within 7-day window. Reflection due (last 04-24, 3 days ago).
- Evening — Heartbeat consolidation. No user sessions. All 6 daily logs (04-21 through 04-26) still within 7-day window; 04-21 becomes deletion candidate tomorrow. Nothing to promote.
- Night — Heartbeat consolidation (run 3). Brain idle — no user sessions in 7 days since bootstrap. All 6 daily logs within window (04-21 = 6 days old, delete eligible 04-28). All tiers reviewed: core (empty), semantic (empty), episodic (3 reflections), procedural (empty). Nothing to promote. SUMMARY.md regenerated.

# 2026-08-10

- [MEM-1] blocker: AWS creds in env (jarvis-test-s3-writer, account 693805235952) have zero usable permissions (AccessDenied on cloudformation:ListStacks, states:ListStateMachines, s3:ListAllMyBuckets, all iam:List*). Cannot bootstrap/deploy SST dummy SFN state machine with this identity. Need either real SSO details (start URL/account/role) for punk-mode SSO, or a scoped IAM user with CloudFormation+IAM+StepFunctions+S3+SSM perms for SST deploy.
- [MEM-2] lesson: env has stray AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY (jarvis-test-s3-writer, no perms) that silently override --profile/AWS_PROFILE in the AWS SDK credential chain (env vars win over profile files). Any aws-cli/sst/pulumi command using an SSO profile must run with 'env -u AWS_ACCESS_KEY_ID -u AWS_SECRET_ACCESS_KEY -u AWS_DEFAULT_REGION AWS_PROFILE=<profile> ...' or it silently deploys/queries as the wrong identity and fails with confusing AccessDenied errors that look like the new profile lacks permissions.
