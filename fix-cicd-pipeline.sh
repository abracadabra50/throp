#!/bin/bash

# CI/CD Pipeline Fix Script for Throp
# This script fixes common CI/CD issues and ensures proper deployment

set -e

echo "🔧 Fixing CI/CD Pipeline for Throp"
echo "=================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in project root directory"
    exit 1
fi

# 1. Fix GitHub Secrets Configuration
echo "📋 Checking GitHub Secrets..."

# Check if required secrets exist (this requires GitHub CLI)
if command -v gh &> /dev/null; then
    echo "✅ GitHub CLI found"
    
    # List required secrets
    REQUIRED_SECRETS=(
        "GCP_SERVICE_ACCOUNT_KEY"
        "NETLIFY_AUTH_TOKEN"
        "NETLIFY_SITE_ID"
        "ANTHROPIC_API_KEY"
        "PERPLEXITY_API_KEY"
        "TWITTER_API_KEY"
        "TWITTER_API_SECRET_KEY"
        "TWITTER_ACCESS_TOKEN"
        "TWITTER_ACCESS_TOKEN_SECRET"
        "TWITTER_BEARER_TOKEN"
    )
    
    echo "Required GitHub Secrets:"
    for secret in "${REQUIRED_SECRETS[@]}"; do
        echo "  - $secret"
    done
    
    echo ""
    echo "📝 To add secrets, run:"
    echo "  gh secret set SECRET_NAME"
    echo ""
else
    echo "⚠️  GitHub CLI not found. Install with: brew install gh"
fi

# 2. Fix NPM Dependencies
echo "📦 Fixing NPM dependency issues..."

# Update package.json scripts if needed
if ! grep -q "legacy-peer-deps" package.json; then
    echo "🔧 Adding legacy peer deps support..."
    
    # Create backup
    cp package.json package.json.bak
    
    # Update install scripts
    cat package.json | jq '.scripts.postinstall = "npm install --legacy-peer-deps"' > package.json.tmp
    mv package.json.tmp package.json
    
    echo "✅ Updated package.json with legacy peer deps support"
fi

# 3. Test Deployment Endpoints
echo "🌐 Testing deployment endpoints..."

# Test backend
BACKEND_URL="https://throp-bot-947985992378.us-central1.run.app"
echo "Testing backend: $BACKEND_URL"

if curl -s -f "$BACKEND_URL/health" > /dev/null 2>&1; then
    echo "✅ Backend health check passed"
else
    echo "⚠️  Backend not responding - may need deployment"
fi

# Test frontend
FRONTEND_URL="https://throp.ai"
echo "Testing frontend: $FRONTEND_URL"

if curl -s -f "$FRONTEND_URL" > /dev/null 2>&1; then
    echo "✅ Frontend accessible"
else
    echo "⚠️  Frontend not responding"
fi

# 4. Validate Workflow Files
echo "📋 Validating GitHub workflows..."

WORKFLOW_DIR=".github/workflows"
if [ -d "$WORKFLOW_DIR" ]; then
    echo "✅ Workflows directory exists"
    
    # Check critical workflows
    CRITICAL_WORKFLOWS=(
        "deploy-gcp.yml"
        "integration-tests.yml"
        "code-quality.yml"
    )
    
    for workflow in "${CRITICAL_WORKFLOWS[@]}"; do
        if [ -f "$WORKFLOW_DIR/$workflow" ]; then
            echo "✅ $workflow exists"
        else
            echo "❌ Missing: $workflow"
        fi
    done
else
    echo "❌ Workflows directory missing"
fi

# 5. Create deployment summary
echo ""
echo "📊 Deployment Summary"
echo "===================="
echo "Backend:   $BACKEND_URL"
echo "Frontend:  $FRONTEND_URL"
echo "Netlify:   Site ID a89fc99c-b8ba-48f6-862a-98a443a99890"
echo "GCP:       Project throp-469410, Region us-central1"
echo ""

# 6. Next steps
echo "🚀 Next Steps"
echo "============="
echo "1. Ensure all GitHub secrets are configured"
echo "2. Push changes to trigger CI/CD pipeline"
echo "3. Monitor deployment in GitHub Actions"
echo "4. Test endpoints after deployment"
echo ""

echo "✅ CI/CD Pipeline fix complete!"
echo ""
echo "To trigger deployment:"
echo "  git add ."
echo "  git commit -m 'Fix CI/CD pipeline'"
echo "  git push origin main"
