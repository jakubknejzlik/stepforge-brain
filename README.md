# StepForge

AI-driven serverless workflow automation on AWS.

**StepForge** is like [n8n](https://n8n.io) or [make.com](https://make.com), but:
- **Serverless** — AWS Step Functions + Lambda, zero ops
- **Agent-driven** — no UI, controlled by an AI agent (Smith)
- **Infrastructure as Code** — SST v3, versioned in git, testable
- **Composable** — reusable Lambda building blocks

## Agent: Smith

Smith is a specialized AI agent that builds, deploys, and manages workflow automations. It can operate as:
- **Standalone** — via Slack channel or CLI
- **Subagent** — called by another agent (e.g., JARVIS)

## Quick Start

### Prerequisites
- [Bun](https://bun.sh) runtime
- AWS account
- [SST v3](https://sst.dev) (`curl -fsSL https://sst.dev/install | bash`)

### Setup

1. Clone this repo:
   ```bash
   git clone https://github.com/jakubknejzlik/stepforge-brain.git
   cd stepforge-brain
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Configure AWS access (see [Deployment Modes](#deployment-modes) below)

4. Deploy:
   ```bash
   sst deploy --stage dev
   ```

## Deployment Modes

StepForge supports two deployment approaches. Both produce the same result — the difference is who runs `sst deploy`.

### Direct Mode (default)

Agent deploys directly to AWS. Fast iteration, suitable for development and personal use.

**Authentication options:**

**A) AWS SSO (interactive, recommended)**
- Configure SSO profile in `~/.aws/config`:
  ```ini
  [profile stepforge]
  sso_start_url = https://YOUR_ORG.awsapps.com/start
  sso_region = eu-central-1
  sso_account_id = YOUR_ACCOUNT_ID
  sso_role_name = AdministratorAccess
  region = eu-central-1
  ```
- Agent calls `aws sso login --profile stepforge --no-browser --use-device-code` when needed
- User authorizes via device code in browser
- Session expires periodically — agent re-authenticates automatically

**B) IAM User (non-interactive)**
- Configure IAM credentials in `~/.aws/credentials`:
  ```ini
  [profile stepforge]
  aws_access_key_id = AKIA...
  aws_secret_access_key = ...
  region = eu-central-1
  ```
- Agent deploys without user interaction
- Suitable for always-on agents

### Pipeline Mode (TODO)

Agent commits code to a separate infrastructure repo. CI/CD pipeline handles deployment. Suitable for production and team environments.

**Planned approach:**
- GitHub repo with SST infrastructure code
- GitHub Actions workflow triggered on push/merge to main
- AWS credentials via OIDC federation or IAM role (stored in GitHub Secrets)
- Agent's role: generate code → commit → create PR → monitor pipeline

**Why this matters:**
- Agent doesn't need direct AWS access
- All changes go through code review
- Audit trail via git history
- Separation of concerns: brain (knowledge) vs infra (deployment)

## Project Structure

```
├── CLAUDE.md              # Agent instructions
├── .claude/skills/        # Agent knowledge base
├── sst.config.ts          # SST v3 configuration
├── infra/                 # Infrastructure definitions
├── src/                   # Lambda handlers
│   ├── blocks/            # Reusable building blocks
│   └── workflows/         # Workflow-specific code
├── data/                  # Workflow registry & templates
└── scripts/               # Utility scripts
```

## License

MIT
