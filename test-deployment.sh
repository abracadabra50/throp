#!/bin/bash

# Test script for verifying Throp deployment
# Run this after Railway finishes deploying (2-3 minutes)

echo "🍊 Testing Throp Deployment..."
echo "================================"

# Test 1: Health Check
echo -e "\n1. Testing Backend Health..."
curl -s https://throp-gh-production.up.railway.app/health
echo -e "\n"

# Test 2: Status Check
echo "2. Checking System Status..."
curl -s https://throp-gh-production.up.railway.app/api/status | jq '.' || echo "Status check failed"
echo -e "\n"

# Test 3: Chat API
echo "3. Testing Chat API..."
response=$(curl -s -X POST https://throp-gh-production.up.railway.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "hello, are you working?"}')

if echo "$response" | jq -e '.success' > /dev/null 2>&1; then
  echo "✅ Chat API is working!"
  echo "$response" | jq '.response' | head -c 100
  echo "..."
else
  echo "❌ Chat API failed:"
  echo "$response" | jq '.' || echo "$response"
fi
echo -e "\n"

# Test 4: Frontend
echo "4. Testing Frontend..."
frontend_status=$(curl -s -o /dev/null -w "%{http_code}" https://throp.vercel.app)
if [ "$frontend_status" = "200" ]; then
  echo "✅ Frontend is accessible at https://throp.vercel.app"
else
  echo "❌ Frontend returned status: $frontend_status"
fi

echo -e "\n================================"
echo "🍊 Deployment test complete!"
echo ""
echo "If the Chat API is working, try:"
echo "1. Visit https://throp.vercel.app and send a message"
echo "2. Tweet @askthrop to test Twitter replies"
