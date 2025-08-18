#!/bin/bash

# Google Cloud Run Deployment Script for Throp
# This deploys your bot to Google Cloud Run - much simpler than Railway!

set -e

PROJECT_ID="your-gcp-project-id"
REGION="us-central1"
SERVICE_NAME="throp-bot"

echo "🚀 Deploying Throp to Google Cloud Run"
echo "======================================"

# Build and push to Google Container Registry
echo "📦 Building container..."
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME

# Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 3001 \
  --memory 512Mi \
  --set-env-vars "\
NODE_ENV=production,\
ANSWER_ENGINE=hybrid-claude,\
ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY,\
ANTHROPIC_MODEL=claude-sonnet-4-20250514,\
PERPLEXITY_API_KEY=$PERPLEXITY_API_KEY,\
PERPLEXITY_MODEL=sonar,\
TWITTER_API_KEY=$TWITTER_API_KEY,\
TWITTER_API_SECRET_KEY=$TWITTER_API_SECRET_KEY,\
TWITTER_ACCESS_TOKEN=$TWITTER_ACCESS_TOKEN,\
TWITTER_ACCESS_TOKEN_SECRET=$TWITTER_ACCESS_TOKEN_SECRET,\
TWITTER_BEARER_TOKEN=$TWITTER_BEARER_TOKEN,\
TWITTER_BOT_USER_ID=1956873492420608000,\
TWITTER_BOT_USERNAME=askthrop,\
REDIS_URL=$REDIS_URL,\
ENABLE_MENTION_POLLING=true,\
MENTION_POLL_INTERVAL=60000"

echo "✅ Deployment complete!"
echo "Your bot is now running on Google Cloud Run"
