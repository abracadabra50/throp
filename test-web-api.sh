#!/bin/bash

# Test script for Web API with chaos mode

echo "🌀 Testing Throp Web API (Chaos Mode)"
echo "======================================"
echo ""

API_URL="${API_URL:-http://localhost:3001}"
ADMIN_KEY="${ADMIN_KEY:-}"

# Test 1: Health check
echo "1️⃣ Health Check..."
curl -s "$API_URL/health" | python3 -m json.tool || echo "❌ Health check failed"
echo ""

# Test 2: Status
echo "2️⃣ Status Check..."
curl -s "$API_URL/api/status" | python3 -m json.tool || echo "❌ Status check failed"
echo ""

# Test 3: Chat (should return chaos mode response)
echo "3️⃣ Chat Test (Chaos Mode Enabled)..."
echo "Question: 'What is Bitcoin?'"
echo "Response:"
curl -s -X POST "$API_URL/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"message":"What is Bitcoin?"}' | python3 -m json.tool || echo "❌ Chat failed"
echo ""

# Test 4: Preview chaos transformation
echo "4️⃣ Chaos Preview Test..."
echo "Original: 'Bitcoin has increased by 15% according to analysis.'"
echo "Chaos:"
curl -s -X POST "$API_URL/api/tweet/preview" \
  -H "Content-Type: application/json" \
  -d '{"text":"Bitcoin has increased by 15% according to analysis."}' | python3 -m json.tool || echo "❌ Preview failed"
echo ""

# Test 5: Admin endpoint (if key provided)
if [ -n "$ADMIN_KEY" ]; then
    echo "5️⃣ Admin Test: Generate Tweet..."
    curl -s -X POST "$API_URL/api/tweet/prompt" \
      -H "Content-Type: application/json" \
      -H "X-Admin-Key: $ADMIN_KEY" \
      -d '{"prompt":"test tweet about javascript","dryRun":true}' | python3 -m json.tool || echo "❌ Admin test failed"
else
    echo "5️⃣ Admin Test: Skipped (no ADMIN_KEY provided)"
    echo "   To test admin endpoints, run:"
    echo "   ADMIN_KEY=your_key ./test-web-api.sh"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Web API tests complete!"
echo ""
echo "If all tests passed, your web interface can now:"
echo "1. Chat with Throp in chaos mode"
echo "2. Preview chaos transformations"
echo "3. (Admins) Generate proactive tweets"
echo ""
echo "throp says: tests passed,,, ngmi if they didnt 🌀"
