#!/bin/bash

echo "🧪 Quick Twitter Auth Test"
echo "=========================="
echo ""
echo "Enter your OAuth 1.0a credentials:"
echo ""

read -p "API Key (Consumer Key): " API_KEY
read -p "API Secret (Consumer Secret): " API_SECRET
read -p "Access Token: " ACCESS_TOKEN
read -p "Access Token Secret: " ACCESS_SECRET

# Update .env
cat > .env << EOF
# Twitter Configuration (OAuth 1.0a)
TWITTER_API_KEY=$API_KEY
TWITTER_API_SECRET_KEY=$API_SECRET
TWITTER_ACCESS_TOKEN=$ACCESS_TOKEN
TWITTER_ACCESS_TOKEN_SECRET=$ACCESS_SECRET

# Perplexity Configuration (MAIN ANSWER ENGINE)
PERPLEXITY_API_KEY=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
PERPLEXITY_MODEL=sonar
PERPLEXITY_MAX_TOKENS=1000
PERPLEXITY_TEMPERATURE=0.7

# Bot Configuration
DRY_RUN=false
CHECK_INTERVAL=60000
LOG_LEVEL=info
MAX_REPLY_LENGTH=280
MAX_THREAD_LENGTH=3
EARLY_EXIT=false

# Redis Configuration (optional - uses in-memory cache if not available)
REDIS_URL=redis://localhost:6379

# API Server Configuration
API_PORT=3001
FRONTEND_URL=http://localhost:3000
API_ONLY_MODE=false
ADMIN_API_KEY=throp_admin_key_2025_super_secret_change_this

# Answer Engine Configuration
ANSWER_ENGINE=perplexity
EOF

echo ""
echo "✅ Credentials saved! Testing authentication..."
echo ""

# Test with simple script
npx tsx -e "
import { TwitterApi } from 'twitter-api-v2';
import { config } from 'dotenv';
config();

(async () => {
  try {
    const client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY,
      appSecret: process.env.TWITTER_API_SECRET_KEY,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    });
    
    const me = await client.v2.me();
    console.log('✅ SUCCESS! Authenticated as @' + me.data.username);
    
    const tweet = await client.v2.tweet('throp is online - chaos mode activated 🌀');
    console.log('✅ Tweet posted! ID: ' + tweet.data.id);
    console.log('   View at: https://twitter.com/' + me.data.username + '/status/' + tweet.data.id);
    
  } catch (error) {
    console.log('❌ Authentication failed:', error.message);
    console.log('');
    console.log('Make sure you have:');
    console.log('1. OAuth 1.0a credentials (not OAuth 2.0)');
    console.log('2. Read AND Write permissions');
    console.log('3. Regenerated tokens after changing permissions');
  }
})();
"
