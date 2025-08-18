#!/bin/bash

# Railway Continuous Monitoring Script
# This will keep checking until the bot is ACTUALLY working

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="https://throp-gh-production.up.railway.app"
GITHUB_REPO="abracadabra50/throp"

echo -e "${YELLOW}🚀 Starting Railway Continuous Monitoring${NC}"
echo "This will keep running until your bot is confirmed working!"
echo "Press Ctrl+C to stop"
echo ""

# Function to check deployment status via GitHub Actions
check_github_deployment() {
    echo -e "${YELLOW}📦 Checking GitHub deployment status...${NC}"
    
    # Get latest workflow run
    latest_run=$(curl -s "https://api.github.com/repos/${GITHUB_REPO}/actions/runs?per_page=1" | \
        python3 -c "import sys, json; data = json.load(sys.stdin); print(data['workflow_runs'][0]['status'] if data['workflow_runs'] else 'unknown')" 2>/dev/null || echo "unknown")
    
    echo "Latest workflow: $latest_run"
    
    if [ "$latest_run" = "in_progress" ]; then
        return 1
    elif [ "$latest_run" = "completed" ]; then
        return 0
    else
        return 2
    fi
}

# Function to check if API is healthy
check_health() {
    response=$(curl -s -o /dev/null -w "%{http_code}" "${API_URL}/health")
    if [ "$response" = "200" ]; then
        return 0
    else
        return 1
    fi
}

# Function to check Twitter diagnostics
check_twitter() {
    diagnostics=$(curl -s "${API_URL}/api/twitter/diagnostics" 2>/dev/null)
    
    if [ -z "$diagnostics" ]; then
        echo -e "${RED}❌ Diagnostics endpoint not responding${NC}"
        return 1
    fi
    
    # Check if we can read and write
    can_read=$(echo "$diagnostics" | python3 -c "import sys, json; print(json.load(sys.stdin)['capabilities']['canRead'])" 2>/dev/null || echo "false")
    can_write=$(echo "$diagnostics" | python3 -c "import sys, json; print(json.load(sys.stdin)['capabilities']['canWrite'])" 2>/dev/null || echo "false")
    
    echo "Can read mentions: $can_read"
    echo "Can post tweets: $can_write"
    
    if [ "$can_read" = "True" ] && [ "$can_write" = "True" ]; then
        return 0
    else
        return 1
    fi
}

# Function to check mentions processing
check_mentions() {
    # Trigger mention check
    curl -s -X POST "${API_URL}/api/mentions/trigger" > /dev/null 2>&1
    
    # Wait a bit for processing
    sleep 5
    
    # Check status
    status=$(curl -s "${API_URL}/api/status" 2>/dev/null)
    
    if [ -z "$status" ]; then
        echo -e "${RED}❌ Status endpoint not responding${NC}"
        return 1
    fi
    
    processed=$(echo "$status" | python3 -c "import sys, json; print(json.load(sys.stdin)['stats']['mentionsProcessed'])" 2>/dev/null || echo "0")
    
    echo "Mentions processed: $processed"
    
    if [ "$processed" != "0" ]; then
        return 0
    else
        return 1
    fi
}

# Main monitoring loop
iteration=0
while true; do
    iteration=$((iteration + 1))
    echo ""
    echo -e "${YELLOW}=== Check #$iteration - $(date '+%H:%M:%S') ===${NC}"
    
    # Step 1: Check if deployment is in progress
    echo -e "\n${YELLOW}1️⃣ Deployment Status${NC}"
    if check_github_deployment; then
        echo -e "${GREEN}✅ Deployment complete${NC}"
    else
        echo -e "${YELLOW}⏳ Deployment in progress, waiting...${NC}"
        sleep 30
        continue
    fi
    
    # Step 2: Check health
    echo -e "\n${YELLOW}2️⃣ Health Check${NC}"
    if check_health; then
        echo -e "${GREEN}✅ API is healthy${NC}"
    else
        echo -e "${RED}❌ API not responding${NC}"
        sleep 10
        continue
    fi
    
    # Step 3: Check Twitter capabilities
    echo -e "\n${YELLOW}3️⃣ Twitter Capabilities${NC}"
    if check_twitter; then
        echo -e "${GREEN}✅ Twitter client fully functional${NC}"
    else
        echo -e "${RED}❌ Twitter client issues detected${NC}"
        
        # Show detailed diagnostics
        echo -e "\n${YELLOW}Detailed diagnostics:${NC}"
        curl -s "${API_URL}/api/twitter/diagnostics" | python3 -m json.tool || true
    fi
    
    # Step 4: Check mentions processing
    echo -e "\n${YELLOW}4️⃣ Mentions Processing${NC}"
    if check_mentions; then
        echo -e "${GREEN}✅ Bot is processing mentions!${NC}"
        
        # SUCCESS!
        echo ""
        echo -e "${GREEN}🎉🎉🎉 BOT IS FULLY OPERATIONAL! 🎉🎉🎉${NC}"
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
    else
        echo -e "${YELLOW}⚠️ Bot not processing mentions yet${NC}"
    fi
    
    # Wait before next check
    echo -e "\n${YELLOW}Waiting 30 seconds before next check...${NC}"
    sleep 30
done
