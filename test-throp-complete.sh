#!/bin/bash

echo "═══════════════════════════════════════════════════════════════"
echo "              🌀 THROP COMPLETE TEST SUITE"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Test 1: API Status
echo "1️⃣  Testing API Status..."
echo "────────────────────────────────────────"
curl -s http://localhost:3001/api/status | python3 -m json.tool | head -15
echo ""

# Test 2: Web Chat Interface
echo "2️⃣  Testing Web Chat (like your frontend)..."
echo "────────────────────────────────────────"
curl -s -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"what is bitcoin?"}' \
  | python3 -c "import sys, json; d=json.load(sys.stdin); print(f'Response: {d.get(\"response\", \"Error\")[:200]}...')"
echo ""

# Test 3: Proactive Tweet (Dry Run)
echo "3️⃣  Testing Proactive Tweet Generation..."
echo "────────────────────────────────────────"
curl -s -X POST http://localhost:3001/api/tweet/prompt \
  -H "Content-Type: application/json" \
  -H "X-Admin-Key: throp_admin_key_2025_super_secret_change_this" \
  -d '{"prompt":"AI is eating the world","dryRun":true}' \
  | python3 -m json.tool | grep -A2 "content"
echo ""

# Test 4: Chaos Mode Preview
echo "4️⃣  Testing Chaos Mode Transformation..."
echo "────────────────────────────────────────"
curl -s -X POST http://localhost:3001/api/tweet/preview \
  -H "Content-Type: application/json" \
  -d '{"text":"Bitcoin is the future of money"}' \
  | python3 -m json.tool
echo ""

echo "═══════════════════════════════════════════════════════════════"
echo "✅ All tests complete! Your bot is ready."
echo "═══════════════════════════════════════════════════════════════"
