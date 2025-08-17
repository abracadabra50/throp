#!/bin/sh

echo "Starting Throp..."
echo "Environment check:"
echo "- ANSWER_ENGINE: $ANSWER_ENGINE"
echo "- TWITTER_BOT_USERNAME: $TWITTER_BOT_USERNAME"
echo "- TWITTER_BOT_USER_ID: $TWITTER_BOT_USER_ID"
echo "- REDIS_URL: ${REDIS_URL:0:20}..."
echo "- NODE_ENV: $NODE_ENV"

# If Twitter credentials exist, run bot
if [ -n "$TWITTER_BOT_USER_ID" ] && [ -n "$TWITTER_API_KEY" ]; then
  echo "Running in BOT mode..."
  exec node dist/bin/throp.js
else
  echo "Running in API-only mode..."
  exec node dist/src/api/start.js
fi
