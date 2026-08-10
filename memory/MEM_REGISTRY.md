# MEM Registry

| Key | Status | Created | Obsoleted | Description |
|-----|--------|---------|-----------|-------------|
| MEM-1 | ACTIVE | 2026-08-10 | — | blocker: AWS creds in env (jarvis-test-s3-writer, account 693805235952) have zero usable permissions (AccessDenied on cloudformation:ListStacks, states:ListStateMachines, s3:ListAllMyBuckets, all iam:List*). Cannot bootstrap/deploy SST dummy SFN state machine with this identity. Need either real SSO details (start URL/account/role) for punk-mode SSO, or a scoped IAM user with CloudFormation+IAM+StepFunctions+S3+SSM perms for SST deploy. |
