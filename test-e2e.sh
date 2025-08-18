#!/bin/bash

echo "
🧪 THROP END-TO-END TEST SUITE
================================
"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Backend URL
BACKEND_URL="https://throp-bot-947985992378.us-central1.run.app"
FRONTEND_URL="https://throp.ai"

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to test endpoint
test_endpoint() {
    local name="$1"
    local url="$2"
    local method="${3:-GET}"
    local data="$4"
    
    echo -n "Testing $name... "
    
    if [ "$method" = "POST" ]; then
        if [ -n "$data" ]; then
            response=$(curl -s -X POST "$url" -H "Content-Type: application/json" -d "$data" -w "\n%{http_code}")
        else
            response=$(curl -s -X POST "$url" -H "Content-Type: application/json" -w "\n%{http_code}")
        fi
    else
        response=$(curl -s "$url" -w "\n%{http_code}")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✅ PASSED${NC} (HTTP $http_code)"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        echo -e "${RED}❌ FAILED${NC} (HTTP $http_code)"
        echo "Response: $body" | head -n 3
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

# Function to test JSON response
test_json_field() {
    local name="$1"
    local url="$2"
    local field="$3"
    local expected="$4"
    
    echo -n "Testing $name... "
    
    response=$(curl -s "$url")
    
    if echo "$response" | grep -q "\"$field\""; then
        if [ -n "$expected" ]; then
            if echo "$response" | grep -q "\"$field\":$expected"; then
                echo -e "${GREEN}✅ PASSED${NC} (field '$field' = $expected)"
                TESTS_PASSED=$((TESTS_PASSED + 1))
                return 0
            else
                echo -e "${RED}❌ FAILED${NC} (field '$field' not equal to $expected)"
                TESTS_FAILED=$((TESTS_FAILED + 1))
                return 1
            fi
        else
            echo -e "${GREEN}✅ PASSED${NC} (field '$field' exists)"
            TESTS_PASSED=$((TESTS_PASSED + 1))
            return 0
        fi
    else
        echo -e "${RED}❌ FAILED${NC} (field '$field' not found)"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

echo "🔍 BACKEND TESTS"
echo "================"
echo ""

# Test backend health
test_endpoint "Backend Health" "$BACKEND_URL/health"

# Test backend status
test_endpoint "Backend Status" "$BACKEND_URL/api/status"

# Test chat endpoint
test_endpoint "Chat Endpoint" "$BACKEND_URL/api/chat" "POST" '{"message":"test"}'

# Test Twitter diagnostics
test_endpoint "Twitter Diagnostics" "$BACKEND_URL/api/twitter/diagnostics"

# Test environment check
test_endpoint "Environment Check" "$BACKEND_URL/api/env-check"

echo ""
echo "🌐 FRONTEND TESTS"
echo "=================="
echo ""

# Test frontend main page
test_endpoint "Frontend Homepage" "$FRONTEND_URL"

# Test trending prompts
test_endpoint "Trending Prompts API" "$FRONTEND_URL/api/trending-prompts"

# Test hot takes
test_endpoint "Hot Takes API" "$FRONTEND_URL/api/hot-takes"

# Test proxy endpoint
test_endpoint "Frontend Proxy" "$FRONTEND_URL/api/proxy" "POST" '{"messages":[{"role":"user","content":"hello"}]}'

echo ""
echo "🔗 INTEGRATION TESTS"
echo "===================="
echo ""

# Test chat flow
echo -n "Testing full chat flow... "
CHAT_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/chat" \
    -H "Content-Type: application/json" \
    -d '{"message":"hello"}')

if echo "$CHAT_RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ PASSED${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}❌ FAILED${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

# Test Twitter capabilities
echo -n "Testing Twitter read capability... "
TWITTER_RESPONSE=$(curl -s "$BACKEND_URL/api/twitter/diagnostics")

if echo "$TWITTER_RESPONSE" | grep -q '"readCapability":true'; then
    echo -e "${GREEN}✅ PASSED${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${YELLOW}⚠️  WARNING${NC} (Read not configured)"
fi

echo -n "Testing Twitter write capability... "
if echo "$TWITTER_RESPONSE" | grep -q '"writeCapability":true'; then
    echo -e "${GREEN}✅ PASSED${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${YELLOW}⚠️  WARNING${NC} (Write not configured)"
fi

echo ""
echo "📊 TEST RESULTS"
echo "==============="
echo ""
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED!${NC}"
    echo "Throp is fully operational! 🚀"
    exit 0
else
    echo -e "${RED}❌ SOME TESTS FAILED${NC}"
    echo "Please check the failed tests above."
    exit 1
fi
