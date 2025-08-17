#!/bin/bash

echo "🍊 Checking Throp Deployment Status..."
echo "======================================"
echo ""

# Check root endpoint
echo "1. Testing root endpoint..."
root_response=$(curl -s https://throp-gh-production.up.railway.app/ | jq -r '.status' 2>/dev/null)
if [ "$root_response" = "running" ]; then
  echo "   ✅ Root endpoint: Working"
else
  echo "   ❌ Root endpoint: Not responding"
fi

# Check health
echo ""
echo "2. Testing health endpoint..."
health_status=$(curl -s -o /dev/null -w "%{http_code}" https://throp-gh-production.up.railway.app/health)
if [ "$health_status" = "200" ]; then
  echo "   ✅ Health check: Passing"
else
  echo "   ❌ Health check: Failed (status: $health_status)"
fi

# Check services
echo ""
echo "3. Checking services..."
status=$(curl -s https://throp-gh-production.up.railway.app/api/status 2>/dev/null)
if [ ! -z "$status" ]; then
  twitter=$(echo "$status" | jq -r '.twitter.connected' 2>/dev/null)
  perplexity=$(echo "$status" | jq -r '.perplexity.connected' 2>/dev/null)
  redis=$(echo "$status" | jq -r '.redis.connected' 2>/dev/null)
  
  echo "   Twitter:    $([ "$twitter" = "true" ] && echo "✅ Connected" || echo "⚠️  Not connected")"
  echo "   Perplexity: $([ "$perplexity" = "true" ] && echo "✅ Connected" || echo "⚠️  Not connected")"
  echo "   Redis:      $([ "$redis" = "true" ] && echo "✅ Connected" || echo "⚠️  Not connected")"
fi

# Test chat
echo ""
echo "4. Testing chat API..."
chat_response=$(curl -s -X POST https://throp-gh-production.up.railway.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "hello"}' 2>/dev/null)
  
if echo "$chat_response" | jq -e '.success == true' > /dev/null 2>&1; then
  echo "   ✅ Chat API: Working!"
  echo "   Response: $(echo "$chat_response" | jq -r '.response' | head -c 50)..."
elif echo "$chat_response" | grep -q "API keys" 2>/dev/null; then
  echo "   ⚠️  Chat API: Needs ANTHROPIC_API_KEY in Railway"
else
  echo "   ❌ Chat API: Failed"
  echo "   Error: $(echo "$chat_response" | jq -r '.error' 2>/dev/null)"
fi

echo ""
echo "======================================"
echo "🎯 Next Steps:"
if echo "$chat_response" | grep -q "API keys" 2>/dev/null; then
  echo "1. Add ANTHROPIC_API_KEY in Railway Variables"
  echo "2. Railway will auto-redeploy"
  echo "3. Chat will start working!"
else
  echo "✅ Everything looks good!"
fi
