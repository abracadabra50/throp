# GitHub Actions Workflows

## Active Workflows

### 1. **CI - Build and Test** (`deploy.yml`)
- **Trigger**: On push to main, on pull requests
- **Purpose**: Run tests, linting, and build checks
- **Does NOT deploy** - only validates code quality

### 2. **Deploy to GCP** (`deploy-gcp.yml`)
- **Trigger**: On push to main branch (automatic) or manual trigger
- **Purpose**: Deploy backend to Google Cloud Run and frontend to Netlify
- **Requirements**: 
  - `GCP_SERVICE_ACCOUNT_KEY` secret configured
  - `NETLIFY_AUTH_TOKEN` secret configured
  - `NETLIFY_SITE_ID` secret configured

### 3. **Code Quality** (`code-quality.yml`)
- **Trigger**: On pull requests and pushes to main
- **Purpose**: Check code formatting, TypeScript, console logs, and TODOs

### 4. **Docker Build** (`docker.yml`)
- **Trigger**: On push to main
- **Purpose**: Build and test Docker image

### 5. **Dependencies** (`dependencies.yml`)
- **Trigger**: Weekly schedule (Mondays at 09:00 UTC)
- **Purpose**: Check for outdated dependencies and security vulnerabilities

### 6. **Release** (`release.yml`)
- **Trigger**: On version tags (v*)
- **Purpose**: Create GitHub releases with changelogs

### 7. **Scheduled Check** (`scheduled-check.yml`)
- **Trigger**: Every 6 hours
- **Purpose**: Monitor service health

## Disabled Workflows

### **Deploy to Railway** (`deploy.yml.disabled`)
- **Status**: DISABLED - We no longer use Railway
- **Replaced by**: `deploy-gcp.yml`

## Required Secrets

For the workflows to function properly, configure these secrets in GitHub:

1. **GCP_SERVICE_ACCOUNT_KEY**: Google Cloud service account JSON key
2. **NETLIFY_AUTH_TOKEN**: Netlify personal access token
3. **NETLIFY_SITE_ID**: Netlify site ID for throp.ai

## Manual Deployment

To manually trigger a deployment:
1. Go to Actions tab
2. Select "Deploy to Google Cloud Platform"
3. Click "Run workflow"
4. Select branch (usually main)
5. Click "Run workflow" button

## Troubleshooting

If workflows are failing:
1. Check that all required secrets are configured
2. Ensure GCP project ID matches in workflow file
3. Verify Netlify site ID is correct
4. Check that service account has necessary permissions
# Triggering deployment test
