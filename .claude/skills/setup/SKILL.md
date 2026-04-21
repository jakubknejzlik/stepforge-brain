# Setup Skill

The `/setup` command bootstraps a new StepForge installation. Smith guides the user through the entire process interactively.

## Setup Flow

### Step 1: Check Prerequisites
```bash
# Verify Bun is installed
bun --version

# Verify AWS CLI is installed
aws --version
```
If missing, guide user to install:
- Bun: `curl -fsSL https://bun.sh/install | bash`
- AWS CLI: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html

### Step 2: Choose Deployment Mode
Ask user:
> How do you want to deploy workflows?
> 1. **Direct** — I deploy to your AWS account directly (simpler, faster)
> 2. **Pipeline** — I commit code, CI/CD deploys (safer, team-friendly)

Store choice in `data/config.yaml`.

### Step 3: Configure AWS Access

**If Direct + SSO:**
1. Ask for SSO start URL, account ID, region, role name
2. Write SSO profile to `~/.aws/config` (or guide user to do it)
3. Run `aws sso login --profile stepforge --no-browser --use-device-code`
4. Send device code to user, wait for authorization
5. Verify: `aws sts get-caller-identity --profile stepforge`

**If Direct + IAM:**
1. Ask user to create IAM user with appropriate permissions
2. Guide user to configure `~/.aws/credentials`
3. Verify: `aws sts get-caller-identity --profile stepforge`

**If Pipeline:**
1. Ask for git repo URL (or create new one)
2. CI/CD credentials will be configured in the pipeline setup step

### Step 4: Create Workspace
```bash
# Create workspace directory
mkdir -p workspace
cd workspace

# Initialize git repo (if not pipeline mode with existing repo)
git init

# Initialize SST project
bun init -y
bunx sst init

# Install dependencies
bun install
```

Generate initial `sst.config.ts`:
```typescript
/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "stepforge",
      removal: input.stage === "production" ? "retain" : "remove",
      home: "aws",
      providers: {
        aws: {
          region: "eu-central-1",
        },
      },
    };
  },
  async run() {
    // Core infrastructure will be added here
  },
});
```

### Step 5: Deploy Core (Direct mode only)
```bash
export AWS_PROFILE=stepforge
sst deploy --stage dev
```

### Step 6: Pipeline Setup (Pipeline mode only)
Generate CI/CD config:
- GitHub: `.github/workflows/deploy.yml`
- GitLab: `.gitlab-ci.yml`

Guide user to configure AWS credentials in CI secrets.

### Step 7: Confirm
- Verify workspace is set up
- Verify AWS connectivity
- Update `data/config.yaml` with workspace path and mode
- Report: "Setup complete. Tell me what you want to automate."

## Config File

After setup, `data/config.yaml` stores the configuration:
```yaml
workspace:
  path: ./workspace          # relative to brain root
  mode: direct               # direct | pipeline
  git_repo: null             # URL if pipeline mode
  stage: dev                 # default SST stage

aws:
  profile: stepforge         # AWS profile name
  auth: sso                  # sso | iam | pipeline
  region: eu-central-1

setup_completed: true
setup_date: 2026-04-21
```

## Re-running Setup

If `/setup` is called again and `data/config.yaml` exists:
- Ask: "You already have a configuration. Do you want to reconfigure?"
- Allow changing mode, AWS settings, or workspace path
- Don't destroy existing workspace without explicit confirmation
