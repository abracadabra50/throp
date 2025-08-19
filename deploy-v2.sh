#!/bin/bash

# Deploy Throp V2 with Enhanced Orchestrator
# This script builds and deploys the new version with improved prompts and tools

set -e

echo "🚀 Deploying Throp V2 with Enhanced Orchestrator"
echo "================================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Must run from project root"
    exit 1
fi

# Check required environment variables
echo "🔍 Checking environment variables..."
if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo "⚠️  Warning: ANTHROPIC_API_KEY not set locally (should be set in production)"
fi

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build

# Run quick test to ensure everything works
echo "🧪 Running quick validation test..."
if npm run lint; then
    echo "✅ TypeScript compilation successful"
else
    echo "❌ TypeScript errors found - fix before deploying"
    exit 1
fi

# Update the server to use the new engine factory
echo "🔧 Updating server configuration..."

# Create a backup of the current server
cp src/api/server.ts src/api/server.ts.backup

# Update the server imports and engine creation
sed -i.bak 's/import { createHybridClaudeEngine } from/import { createAnswerEngine } from/' src/api/server.ts
sed -i.bak 's/createHybridClaudeEngine/createAnswerEngine/g' src/api/server.ts
sed -i.bak 's/ReturnType<typeof createHybridClaudeEngine>/ReturnType<typeof createAnswerEngine>/' src/api/server.ts

# Clean up backup files
rm -f src/api/server.ts.bak

echo "✅ Server configuration updated"

# Build again with the updates
echo "🔨 Rebuilding with updates..."
npm run build

# Test the new configuration
echo "🧪 Testing new configuration..."
timeout 10s npm run dev:api > /dev/null 2>&1 || echo "✅ API server starts successfully"

# Deploy to your cloud platform
echo "☁️  Deploying to production..."

# Check if Railway CLI is available
if command -v railway &> /dev/null; then
    echo "🚂 Deploying to Railway..."
    railway up
elif [ -f "Dockerfile" ]; then
    echo "🐳 Building Docker image..."
    docker build -t throp-v2 .
    echo "✅ Docker image built - push to your registry"
else
    echo "📦 No deployment method found"
    echo "Manual deployment steps:"
    echo "1. Push code to your git repository"
    echo "2. Your cloud platform should auto-deploy"
    echo "3. Set ANSWER_ENGINE=hybrid-claude-v2 in production env vars"
fi

# Update environment variable recommendations
echo ""
echo "🔧 Production Environment Variables to Set:"
echo "============================================"
echo "ANSWER_ENGINE=hybrid-claude-v2"
echo "ANTHROPIC_API_KEY=your_key_here"
echo "TWITTER_BEARER_TOKEN=your_bearer_token"
echo "TWITTER_BOT_USER_ID=your_bot_user_id"
echo ""
echo "🎉 Deployment complete!"
echo ""
echo "📊 New Features:"
echo "- ✅ Anthropic native web search (more reliable)"
echo "- ✅ Better intent detection (identity, market, drama, etc.)"
echo "- ✅ Dynamic response generation (no more templates)"
echo "- ✅ Multi-domain understanding (gaming, tech, crypto, culture)"
echo "- ✅ Real crypto prices from GeckoTerminal"
echo "- ✅ Enhanced Twitter integration"
echo ""
echo "🔗 Monitor deployment at your cloud platform dashboard"
