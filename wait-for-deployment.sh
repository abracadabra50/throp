#!/bin/bash

echo "🍊 Waiting for Railway deployment..."
echo "This should take 2-3 minutes"
echo ""

# Wait for build
echo "⏳ Waiting 90 seconds for build to complete..."
sleep 90

# Check deployment
echo ""
echo "🔍 Checking deployment status..."
echo ""

for i in {1..10}; do
  echo -n "Attempt $i: "
  
  health_status=$(curl -s -o /dev/null -w "%{http_code}" https://throp-gh-production.up.railway.app/health)
  
  if [ "$health_status" = "200" ]; then
    echo "✅ DEPLOYMENT SUCCESSFUL!"
    echo ""
    echo "Testing endpoints..."
    echo ""
    
    # Test root
    echo "1. Root endpoint:"
    curl -s https://throp-gh-production.up.railway.app/ | jq -C '.'
    echo ""
    
    # Test status
    echo "2. Status endpoint:"
    curl -s https://throp-gh-production.up.railway.app/api/status | jq -C '.status, .twitter, .perplexity'
    echo ""
    
    # Test chat
    echo "3. Chat API:"
    response=$(curl -s -X POST https://throp-gh-production.up.railway.app/api/chat \
      -H "Content-Type: application/json" \
      -d '{"message": "hello"}')
    
    if echo "$response" | jq -e '.success' > /dev/null 2>&1; then
      echo "✅ Chat is working!"
    else
      echo "⚠️ Chat needs configuration:"
      echo "$response" | jq -C '.error'
    fi
    
    echo ""
    echo "🎉 Your app is live at:"
    echo "   Backend: https://throp-gh-production.up.railway.app"
    echo "   Frontend: https://throp.vercel.app"
    echo "   Chat: https://chat.throp.ai (once DNS is configured)"
    exit 0
  else
    echo "Status $health_status - waiting 15 seconds..."
    sleep 15
  fi
done

echo ""
echo "❌ Deployment might still be in progress. Run this script again in a minute."
