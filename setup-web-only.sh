#!/bin/bash

# Setup script for web interface only mode (no Twitter bot)

echo "🌀 Setting up Throp for Web Interface Only"
echo "=========================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "✅ .env file created"
else
    echo "📋 .env file already exists"
fi

# Generate admin key if not set
if ! grep -q "^ADMIN_API_KEY=.+" .env; then
    echo ""
    echo "🔑 Generating admin API key..."
    ADMIN_KEY="admin_$(openssl rand -hex 32)"
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/^ADMIN_API_KEY=.*/ADMIN_API_KEY=$ADMIN_KEY/" .env
    else
        sed -i "s/^ADMIN_API_KEY=.*/ADMIN_API_KEY=$ADMIN_KEY/" .env
    fi
    
    echo "✅ Admin key generated: $ADMIN_KEY"
    echo "⚠️  Save this key securely! You'll need it for admin features."
else
    echo "✅ Admin API key already configured"
fi

# Set API_ONLY_MODE to true
echo ""
echo "🔧 Configuring for API-only mode..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' 's/^API_ONLY_MODE=.*/API_ONLY_MODE=true/' .env
else
    sed -i 's/^API_ONLY_MODE=.*/API_ONLY_MODE=true/' .env
fi
echo "✅ API_ONLY_MODE enabled"

# Check Perplexity key
echo ""
if grep -q "^PERPLEXITY_API_KEY=pplx-" .env; then
    echo "✅ Perplexity API key configured"
else
    echo "⚠️  Perplexity API key not found!"
    echo "   Please add your key to .env: PERPLEXITY_API_KEY=pplx-xxx"
fi

# Display current configuration
echo ""
echo "📊 Current Configuration:"
echo "========================"
grep "^API_ONLY_MODE=" .env
grep "^PERPLEXITY_API_KEY=" .env | sed 's/=.*/=[HIDDEN]/'
grep "^ADMIN_API_KEY=" .env | sed 's/=.*/=[HIDDEN]/'
grep "^API_PORT=" .env
grep "^FRONTEND_URL=" .env

echo ""
echo "🚀 Ready to start the API server!"
echo ""
echo "Commands:"
echo "---------"
echo "1. Start API server:     npm run dev:api"
echo "2. With Docker:         docker-compose up api redis"
echo "3. Test the API:        ./test-web-api.sh"
echo ""
echo "📝 API Endpoints:"
echo "-----------------"
echo "Public:"
echo "  POST /api/chat         - Chat with Throp (chaos mode)"
echo "  GET  /api/status       - Check status"
echo "  POST /api/tweet/preview - Preview chaos transformation"
echo ""
echo "Admin only (requires X-Admin-Key header):"
echo "  POST /api/tweet/prompt  - Generate proactive tweet"
echo "  POST /api/tweet/react   - React to trending topic"
echo ""
echo "throp says: api ready,,, probably nothing 🌀"
