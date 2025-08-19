#!/bin/bash

# Fix Production Deployment Issues
# 1. Update Claude model to correct version
# 2. Fix Twitter credentials from Secret Manager
# 3. Ensure proper environment variables

set -e

echo "🔧 Fixing Throp Production Deployment"
echo "====================================="

# Check if gcloud is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q "@"; then
    echo "❌ Please authenticate with gcloud first:"
    echo "gcloud auth login"
    exit 1
fi

# Set project
gcloud config set project throp-469410

echo "🔍 Checking current Cloud Run service..."
gcloud run services describe throp-bot --region=us-central1 --format="value(status.url)" || echo "Service not found"

echo "🔧 Updating environment variables..."

# Update the Cloud Run service with correct configuration
gcloud run services update throp-bot \
  --region=us-central1 \
  --set-env-vars="ANTHROPIC_MODEL=claude-sonnet-4-20250514" \
  --set-env-vars="ANSWER_ENGINE=hybrid-claude" \
  --set-env-vars="NODE_ENV=production" \
  --set-env-vars="PORT=3001" \
  --timeout=300 \
  --memory=1Gi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=10

echo "🔐 Setting up Twitter credentials from Secret Manager..."

# Check if secrets exist
echo "Checking for Twitter secrets..."
gcloud secrets list --filter="name:twitter" --format="value(name)" || echo "No Twitter secrets found"

echo "📝 You need to create these secrets in Secret Manager:"
echo "1. gcloud secrets create twitter-bearer-token --data-file=<(echo 'YOUR_BEARER_TOKEN')"
echo "2. gcloud secrets create twitter-api-key --data-file=<(echo 'YOUR_API_KEY')"
echo "3. gcloud secrets create twitter-api-secret --data-file=<(echo 'YOUR_API_SECRET')"
echo "4. gcloud secrets create anthropic-api-key --data-file=<(echo 'YOUR_ANTHROPIC_KEY')"

echo ""
echo "🚀 Then update the service to use secrets:"
echo "gcloud run services update throp-bot \\"
echo "  --region=us-central1 \\"
echo "  --set-secrets='TWITTER_BEARER_TOKEN=twitter-bearer-token:latest' \\"
echo "  --set-secrets='TWITTER_API_KEY=twitter-api-key:latest' \\"
echo "  --set-secrets='TWITTER_API_SECRET_KEY=twitter-api-secret:latest' \\"
echo "  --set-secrets='ANTHROPIC_API_KEY=anthropic-api-key:latest'"

echo ""
echo "✅ Environment variables updated"
echo "🔗 Service URL: https://throp-bot-947985992378.us-central1.run.app"
echo ""
echo "📊 Monitor deployment:"
echo "gcloud run services describe throp-bot --region=us-central1"
