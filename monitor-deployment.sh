#!/bin/bash

echo "🍊 Monitoring Railway Deployment..."
echo "================================"
echo "This will check every 30 seconds until deployment succeeds"
echo ""

while true; do
  echo -n "$(date '+%H:%M:%S') - Checking health... "
  
  # Check health endpoint
  health_status=$(curl -s -o /dev/null -w "%{http_code}" https://throp-gh-production.up.railway.app/health)
  
  if [ "$health_status" = "200" ]; then
    echo "✅ DEPLOYMENT SUCCESSFUL!"
    echo ""
    echo "Testing chat API..."
    response=$(curl -s -X POST https://throp-gh-production.up.railway.app/api/chat \
      -H "Content-Type: application/json" \
      -d '{"message": "hello"}' | jq -r '.success' 2>/dev/null)
    
    if [ "$response" = "true" ]; then
      echo "✅ Chat API is working!"
      echo ""
      echo "🎉 Everything is operational!"
      echo "- Frontend: https://throp.vercel.app"
      echo "- Backend: https://throp-gh-production.up.railway.app"
      echo ""
      echo "Try tweeting @askthrop to test Twitter replies!"
      exit 0
    else
      echo "⚠️ Health check passed but chat API still failing"
    fi
  else
    echo "❌ Not ready (status: $health_status)"
  fi
  
  echo "   Waiting 30 seconds before next check..."
  sleep 30
done
