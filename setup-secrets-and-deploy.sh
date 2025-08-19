#!/bin/bash

# Setup Secrets and Deploy to Google Cloud Run
# This script creates/updates secrets in Secret Manager and deploys with them

set -e

echo "🔐 Setting up Google Cloud Secrets and Deploying Throp"
echo "======================================================="

# Load environment variables from .env file
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
    echo "✅ Loaded environment variables from .env"
else
    echo "❌ .env file not found!"
    exit 1
fi

# Function to create or update a secret
create_or_update_secret() {
    local SECRET_NAME=$1
    local SECRET_VALUE=$2
    
    if [ -z "$SECRET_VALUE" ]; then
        echo "⚠️  Skipping $SECRET_NAME (no value set)"
        return
    fi
    
    # Check if secret exists
    if gcloud secrets describe $SECRET_NAME --project=throp-469410 &>/dev/null; then
        echo "📝 Updating secret: $SECRET_NAME"
        echo -n "$SECRET_VALUE" | gcloud secrets versions add $SECRET_NAME --data-file=- --project=throp-469410
    else
        echo "✨ Creating secret: $SECRET_NAME"
        echo -n "$SECRET_VALUE" | gcloud secrets create $SECRET_NAME --data-file=- --replication-policy=automatic --project=throp-469410
    fi
}

echo ""
echo "📦 Creating/Updating Secrets in Secret Manager..."
echo "------------------------------------------------"

# Create all necessary secrets
create_or_update_secret "twitter-api-key" "$TWITTER_API_KEY"
create_or_update_secret "twitter-api-secret" "$TWITTER_API_SECRET_KEY"
create_or_update_secret "twitter-access-token" "$TWITTER_ACCESS_TOKEN"
create_or_update_secret "twitter-access-token-secret" "$TWITTER_ACCESS_TOKEN_SECRET"
create_or_update_secret "twitter-bearer-token" "$TWITTER_BEARER_TOKEN"
create_or_update_secret "twitter-bot-user-id" "$TWITTER_BOT_USER_ID"
create_or_update_secret "perplexity-api-key" "$PERPLEXITY_API_KEY"
create_or_update_secret "anthropic-api-key" "$ANTHROPIC_API_KEY"
create_or_update_secret "redis-url" "$REDIS_URL"

echo ""
echo "🚀 Building and Deploying to Cloud Run..."
echo "----------------------------------------"

# Build the container
echo "📦 Building container image..."
gcloud builds submit --tag gcr.io/throp-469410/throp-bot:latest --project=throp-469410 --quiet

# Deploy to Cloud Run with secrets
echo "🌐 Deploying to Cloud Run with secrets..."
gcloud run deploy throp-bot \
    --image gcr.io/throp-469410/throp-bot:latest \
    --region us-central1 \
    --project throp-469410 \
    --allow-unauthenticated \
    --memory 512Mi \
    --timeout 60 \
    --min-instances 1 \
    --max-instances 10 \
    --set-secrets "\
TWITTER_API_KEY=twitter-api-key:latest,\
TWITTER_API_SECRET_KEY=twitter-api-secret:latest,\
TWITTER_ACCESS_TOKEN=twitter-access-token:latest,\
TWITTER_ACCESS_TOKEN_SECRET=twitter-access-token-secret:latest,\
TWITTER_BEARER_TOKEN=twitter-bearer-token:latest,\
TWITTER_BOT_USER_ID=twitter-bot-user-id:latest,\
PERPLEXITY_API_KEY=perplexity-api-key:latest,\
ANTHROPIC_API_KEY=anthropic-api-key:latest,\
REDIS_URL=redis-url:latest" \
    --set-env-vars "\
TWITTER_BOT_USERNAME=throp,\
ANSWER_ENGINE=perplexity-chaos,\
ANTHROPIC_MODEL=claude-3-sonnet-20240229,\
NODE_ENV=production,\
API_ONLY_MODE=true,\
LOG_LEVEL=info" \
    --quiet

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📍 Service URL: https://throp-bot-947985992378.us-central1.run.app"
echo ""
echo "🧪 Testing endpoints..."
echo "------------------------"

# Wait for deployment to stabilize
sleep 10

# Test endpoints
echo -n "Testing /health... "
if curl -f -s https://throp-bot-947985992378.us-central1.run.app/health > /dev/null; then
    echo "✅"
else
    echo "❌"
fi

echo -n "Testing /api/status... "
if curl -f -s https://throp-bot-947985992378.us-central1.run.app/api/status > /dev/null; then
    echo "✅"
else
    echo "❌"
fi

echo -n "Testing /api/trending-prompts... "
if curl -f -s https://throp-bot-947985992378.us-central1.run.app/api/trending-prompts > /dev/null; then
    echo "✅"
else
    echo "❌"
fi

echo -n "Testing /api/hot-takes... "
if curl -f -s https://throp-bot-947985992378.us-central1.run.app/api/hot-takes > /dev/null; then
    echo "✅"
else
    echo "❌"
fi

echo -n "Testing /api/chat... "
if curl -X POST -H "Content-Type: application/json" -d '{"message":"test"}' -f -s https://throp-bot-947985992378.us-central1.run.app/api/chat > /dev/null; then
    echo "✅"
else
    echo "❌"
fi

echo ""
echo "🎉 All done! Your backend is deployed with secrets from Secret Manager."
echo ""
echo "To view logs:"
echo "  gcloud run logs read --service throp-bot --region us-central1"
echo ""
echo "To update a secret:"
echo "  echo -n 'new-value' | gcloud secrets versions add SECRET_NAME --data-file=-"
