#!/bin/bash

# Test script for Throp API
# Run this after starting the API server with: npm run dev:api

echo "🧪 Testing Throp API Server..."
echo ""

# Test health endpoint
echo "1. Testing health endpoint..."
curl -s http://localhost:3001/health | python3 -m json.tool
echo ""

# Test status endpoint
echo "2. Testing status endpoint..."
curl -s http://localhost:3001/api/status | python3 -m json.tool
echo ""

# Test chat endpoint
echo "3. Testing chat endpoint..."
curl -s -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello Throp! What can you do?"}' | python3 -m json.tool
echo ""

echo "✅ API tests complete!"
