# MEM Registry

| Key | Status | Created | Obsoleted | Description |
|-----|--------|---------|-----------|-------------|
| MEM-1 | ACTIVE | 2026-08-10 | — | blocker: AWS creds in env (jarvis-test-s3-writer, account 693805235952) have zero usable permissions (AccessDenied on cloudformation:ListStacks, states:ListStateMachines, s3:ListAllMyBuckets, all iam:List*). Cannot bootstrap/deploy SST dummy SFN state machine with this identity. Need either real SSO details (start URL/account/role) for punk-mode SSO, or a scoped IAM user with CloudFormation+IAM+StepFunctions+S3+SSM perms for SST deploy. |
| MEM-2 | ACTIVE | 2026-08-10 | — | lesson: env has stray AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY (jarvis-test-s3-writer, no perms) that silently override --profile/AWS_PROFILE in the AWS SDK credential chain (env vars win over profile files). Any aws-cli/sst/pulumi command using an SSO profile must run with 'env -u AWS_ACCESS_KEY_ID -u AWS_SECRET_ACCESS_KEY -u AWS_DEFAULT_REGION AWS_PROFILE=<profile> ...' or it silently deploys/queries as the wrong identity and fails with confusing AccessDenied errors that look like the new profile lacks permissions. |
