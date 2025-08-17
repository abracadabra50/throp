#!/bin/bash

# Demo script for Throp's proactive tweeting in chaos mode

echo "🌀 THROP CHAOS MODE DEMO"
echo "========================"
echo ""

echo "1️⃣ Testing chaos transformation..."
echo ""
tsx test-chaos.ts | head -40
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "2️⃣ Generating a single tweet (dry run)..."
echo ""
npm run tweet -- -p "javascript was a mistake" -d

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "3️⃣ Generating a thread (dry run)..."
echo ""
npm run tweet -- -p "explain why vim is better than vscode" --thread -d

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "4️⃣ Reacting to a trend (dry run)..."
echo ""
npm run tweet -- -r "AI" -s bullish -d

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Demo complete!"
echo ""
echo "To actually post tweets:"
echo "1. Add Twitter credentials to .env"
echo "2. Remove the -d flag (dry run)"
echo ""
echo "For interactive mode: npm run tweet:interactive"
echo ""
echo "throp says: probably nothing,,, but chaos mode is the future"
