#!/bin/sh

echo "Starting Throp API Server..."
echo "Environment check:"
echo "- PORT: ${PORT:-3001}"
echo "- NODE_ENV: $NODE_ENV"
echo "- ANSWER_ENGINE: $ANSWER_ENGINE"
echo "- TWITTER_BOT_USERNAME: $TWITTER_BOT_USERNAME"
echo "- REDIS_URL: ${REDIS_URL:0:20}..."

# Always run the API server for Railway deployment
# The API server includes Twitter bot functionality
echo "Starting API server on port ${PORT:-3001}..."
exec node dist/src/api/start.js
