#!/bin/bash

# Script to help get Twitter OAuth2 Bearer Token and Bot User ID

echo "🐦 Twitter OAuth2 Setup Helper"
echo "================================"
echo ""

# Check if API keys are set
if [ -z "$TWITTER_API_KEY" ] || [ -z "$TWITTER_API_SECRET_KEY" ]; then
    echo "Please set your Twitter API credentials first:"
    echo "export TWITTER_API_KEY=your_api_key"
    echo "export TWITTER_API_SECRET_KEY=your_api_secret"
    exit 1
fi

echo "✅ Found API credentials"
echo ""

# Step 1: Get Bearer Token
echo "📋 Step 1: Getting Bearer Token..."
echo "--------------------------------"

# Encode credentials
ENCODED=$(echo -n "$TWITTER_API_KEY:$TWITTER_API_SECRET_KEY" | base64)

# Request bearer token
RESPONSE=$(curl -s -X POST "https://api.twitter.com/oauth2/token" \
  -H "Authorization: Basic $ENCODED" \
  -H "Content-Type: application/x-www-form-urlencoded;charset=UTF-8" \
  -d "grant_type=client_credentials")

# Extract bearer token
BEARER_TOKEN=$(echo $RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$BEARER_TOKEN" ]; then
    echo "❌ Failed to get Bearer Token"
    echo "Response: $RESPONSE"
    exit 1
fi

echo "✅ Bearer Token obtained!"
echo ""

# Step 2: Get Bot User ID
echo "📋 Step 2: Getting Bot User ID..."
echo "--------------------------------"

# Ask for bot username
read -p "Enter your bot's username (without @): " BOT_USERNAME
BOT_USERNAME=${BOT_USERNAME:-askthrop}

# Get user ID
USER_RESPONSE=$(curl -s -X GET "https://api.twitter.com/2/users/by/username/$BOT_USERNAME" \
  -H "Authorization: Bearer $BEARER_TOKEN")

# Extract user ID
BOT_USER_ID=$(echo $USER_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -z "$BOT_USER_ID" ]; then
    echo "❌ Failed to get Bot User ID"
    echo "Response: $USER_RESPONSE"
    exit 1
fi

echo "✅ Bot User ID obtained!"
echo ""

# Display results
echo "================================"
echo "🎉 SUCCESS! Here are your credentials:"
echo "================================"
echo ""
echo "Add these to your Railway environment variables:"
echo ""
echo "TWITTER_BEARER_TOKEN=$BEARER_TOKEN"
echo "TWITTER_BOT_USER_ID=$BOT_USER_ID"
echo ""
echo "--------------------------------"
echo "📝 Next steps:"
echo "1. Copy the above environment variables"
echo "2. Go to Railway dashboard"
echo "3. Add them to your service variables"
echo "4. Redeploy your service"
echo ""
echo "✨ Your bot will now use OAuth 2.0 for mentions!"
