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
- AWS account with SSO configured
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

3. Configure AWS SSO profile in `~/.aws/config`:
   ```ini
   [profile stepforge]
   sso_start_url = https://YOUR_ORG.awsapps.com/start
   sso_region = eu-central-1
   sso_account_id = YOUR_ACCOUNT_ID
   sso_role_name = AdministratorAccess
   region = eu-central-1
   ```

4. Login to AWS:
   ```bash
   aws sso login --profile stepforge --no-browser --use-device-code
   ```

5. Deploy:
   ```bash
   sst deploy --stage dev
   ```

## Deployment Modes

### Direct (default)
Agent deploys directly via AWS SSO + `sst deploy`. Fast iteration, suitable for development and personal use.

### Pipeline (future)
GitHub Actions CI/CD pipeline. Agent commits code, pipeline deploys. Suitable for production and team use.

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
