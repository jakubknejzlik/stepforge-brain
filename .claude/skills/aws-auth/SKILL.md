# AWS Authorization Skill

How Smith authenticates with AWS for deployments and resource management.

## Direct Mode — AWS SSO

### Login Flow
1. Run: `aws sso login --profile <profile> --no-browser --use-device-code`
2. You'll receive a device code and verification URL
3. Send both to the user
4. Wait for user to confirm authorization
5. Verify: `aws sts get-caller-identity --profile <profile>`

### Important
- **Always use `--no-browser --use-device-code`** — agent has no browser
- **Never store or display AWS credentials** in messages or files
- SSO sessions expire — if a command fails with auth error, re-login

### SST Deploy with Profile
```bash
export AWS_PROFILE=stepforge
sst deploy --stage dev
sst deploy --stage dev --target MyWorkflow
sst dev
```

## Pipeline Mode (TODO)

For CI/CD deployment via GitHub Actions. Planned but not yet implemented.
