#!/bin/bash

# Railway Continuous Monitoring Script V2
# Enhanced with better diagnostics and automatic issue detection

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

API_URL="https://throp-gh-production.up.railway.app"

echo -e "${BLUE}🚀 Railway Continuous Monitoring V2${NC}"
echo "This will keep running until your bot is confirmed working!"
echo "Press Ctrl+C to stop"
echo ""

# Function to check if API is healthy
check_health() {
    response=$(curl -s -o /dev/null -w "%{http_code}" "${API_URL}/health" 2>/dev/null || echo "000")
    if [ "$response" = "200" ]; then
        return 0
    else
        return 1
    fi
}

# Function to check detailed Twitter diagnostics
check_twitter_detailed() {
    diagnostics=$(curl -s "${API_URL}/api/twitter/diagnostics" 2>/dev/null)
    
    if [ -z "$diagnostics" ]; then
        echo -e "${RED}❌ Diagnostics endpoint not responding${NC}"
        return 1
    fi
    
    # Parse all the important fields
    oauth1_configured=$(echo "$diagnostics" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('oauth1', {}).get('configured', False))
except:
    print('false')
" 2>/dev/null)
    
    oauth2_configured=$(echo "$diagnostics" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('oauth2', {}).get('configured', False))
except:
    print('false')
" 2>/dev/null)
    
    can_read=$(echo "$diagnostics" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('capabilities', {}).get('canRead', False))
except:
    print('false')
" 2>/dev/null)
    
    can_write=$(echo "$diagnostics" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('capabilities', {}).get('canWrite', False))
except:
    print('false')
" 2>/dev/null)
    
    read_error=$(echo "$diagnostics" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    error = data.get('errors', {}).get('readError')
    print(error if error else 'None')
except:
    print('Unknown')
" 2>/dev/null)
    
    echo -e "${BLUE}OAuth 1.0a (for posting):${NC} $oauth1_configured"
    echo -e "${BLUE}OAuth 2.0 (for reading):${NC} $oauth2_configured"
    echo -e "${BLUE}Can read mentions:${NC} $can_read"
    echo -e "${BLUE}Can post tweets:${NC} $can_write"
    
    if [ "$read_error" != "None" ]; then
        echo -e "${YELLOW}Read error:${NC} $read_error"
    fi
    
    # Show full diagnostics if there's an issue
    if [ "$can_read" != "True" ] || [ "$can_write" != "True" ]; then
        echo -e "\n${YELLOW}Full diagnostics:${NC}"
        echo "$diagnostics" | python3 -m json.tool 2>/dev/null || echo "$diagnostics"
        
        # Provide specific guidance
        echo -e "\n${YELLOW}🔧 Troubleshooting:${NC}"
        
        if [ "$oauth1_configured" != "True" ]; then
            echo -e "${RED}❌ OAuth 1.0a not configured - Required for posting${NC}"
            echo "   Check these Railway variables:"
            echo "   - TWITTER_API_KEY"
            echo "   - TWITTER_API_SECRET_KEY"
            echo "   - TWITTER_ACCESS_TOKEN"
            echo "   - TWITTER_ACCESS_TOKEN_SECRET"
        fi
        
        if [ "$oauth2_configured" != "True" ]; then
            echo -e "${YELLOW}⚠️ OAuth 2.0 not configured - Needed for better rate limits${NC}"
            echo "   Check these Railway variables:"
            echo "   - TWITTER_BEARER_TOKEN"
            echo "   - TWITTER_BOT_USER_ID"
        fi
        
        return 1
    fi
    
    return 0
}

# Function to test OAuth 1.0a
test_oauth() {
    echo -e "\n${YELLOW}Testing OAuth 1.0a configuration...${NC}"
    
    test_result=$(curl -s -X POST "${API_URL}/api/twitter/test-tweet" \
        -H "Content-Type: application/json" \
        -d '{"testMode": true}' 2>/dev/null)
    
    if [ -z "$test_result" ]; then
        echo -e "${RED}❌ Test endpoint not responding${NC}"
        return 1
    fi
    
    can_tweet=$(echo "$test_result" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('canTweet', False))
except:
    print('false')
" 2>/dev/null)
    
    message=$(echo "$test_result" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('message', 'Unknown'))
except:
    print('Unknown')
" 2>/dev/null)
    
    echo "Result: $message"
    
    if [ "$can_tweet" = "True" ]; then
        return 0
    else
        return 1
    fi
}

# Function to trigger and check mentions
check_mentions() {
    echo -e "\n${YELLOW}Triggering mention check...${NC}"
    
    # Trigger mention check
    trigger_result=$(curl -s -X POST "${API_URL}/api/mentions/trigger" 2>/dev/null)
    
    if echo "$trigger_result" | grep -q "success.*true"; then
        echo -e "${GREEN}✅ Mention check triggered${NC}"
    else
        echo -e "${YELLOW}⚠️ Could not trigger mention check${NC}"
    fi
    
    # Wait for processing
    sleep 5
    
    # Check status
    status=$(curl -s "${API_URL}/api/status" 2>/dev/null)
    
    if [ -z "$status" ]; then
        echo -e "${RED}❌ Status endpoint not responding${NC}"
        return 1
    fi
    
    processed=$(echo "$status" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('stats', {}).get('mentionsProcessed', 0))
except:
    print('0')
" 2>/dev/null)
    
    echo -e "${BLUE}Mentions processed so far:${NC} $processed"
    
    if [ "$processed" != "0" ]; then
        return 0
    else
        return 2  # Not necessarily an error, just no mentions processed yet
    fi
}

# Main monitoring loop
iteration=0
max_iterations=20  # Maximum iterations before giving up
consecutive_failures=0

while [ $iteration -lt $max_iterations ]; do
    iteration=$((iteration + 1))
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}Check #$iteration - $(date '+%H:%M:%S')${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
    
    # Step 1: Check health
    echo -e "\n${YELLOW}1️⃣ Health Check${NC}"
    if check_health; then
        echo -e "${GREEN}✅ API is healthy${NC}"
        consecutive_failures=0
    else
        echo -e "${RED}❌ API not responding${NC}"
        consecutive_failures=$((consecutive_failures + 1))
        
        if [ $consecutive_failures -gt 5 ]; then
            echo -e "\n${RED}API has been down for too long. Railway might still be building.${NC}"
            echo "Wait a few minutes and try again."
            exit 1
        fi
        
        echo "Waiting 30 seconds..."
        sleep 30
        continue
    fi
    
    # Step 2: Check Twitter capabilities in detail
    echo -e "\n${YELLOW}2️⃣ Twitter Configuration${NC}"
    if check_twitter_detailed; then
        echo -e "${GREEN}✅ Twitter client fully configured${NC}"
    else
        echo -e "${YELLOW}⚠️ Twitter configuration issues detected${NC}"
        
        # Try OAuth test
        if test_oauth; then
            echo -e "${GREEN}✅ OAuth 1.0a is working${NC}"
        else
            echo -e "${RED}❌ OAuth 1.0a not working${NC}"
        fi
    fi
    
    # Step 3: Check mentions processing
    echo -e "\n${YELLOW}3️⃣ Mentions Processing${NC}"
    mentions_result=$(check_mentions; echo $?)
    
    if [ "$mentions_result" = "0" ]; then
        echo -e "${GREEN}✅ Bot is processing mentions!${NC}"
        
        # SUCCESS!
        echo ""
        echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
        echo -e "${GREEN}🎉🎉🎉 BOT IS FULLY OPERATIONAL! 🎉🎉🎉${NC}"
        echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
        echo -e "${GREEN}Your Twitter bot is now:${NC}"
        echo -e "${GREEN}✅ Reading mentions${NC}"
        echo -e "${GREEN}✅ Generating responses${NC}"
        echo -e "${GREEN}✅ Posting replies${NC}"
        echo ""
        echo -e "${GREEN}Check @askthrop on Twitter for replies!${NC}"
        
        # Show final status
        echo -e "\n${YELLOW}Final Status:${NC}"
        curl -s "${API_URL}/api/status" | python3 -m json.tool
        
        exit 0
    elif [ "$mentions_result" = "2" ]; then
        echo -e "${YELLOW}⚠️ No mentions processed yet (might be none to process)${NC}"
    else
        echo -e "${RED}❌ Could not check mentions${NC}"
    fi
    
    # Wait before next check
    echo -e "\n${BLUE}Waiting 30 seconds before next check...${NC}"
    echo -e "${BLUE}(${max_iterations - iteration} checks remaining)${NC}"
    sleep 30
done

echo -e "\n${RED}Maximum iterations reached. Bot might need manual intervention.${NC}"
echo "Check Railway logs for more details: https://railway.app"
exit 1
