#!/bin/bash

# Update Netlify Environment Variables for Google Cloud Run Backend
# Run this script to update your Netlify deployment to use the Google Cloud backend

echo "🔧 Updating Netlify environment variables for Google Cloud Run backend..."

# Check if netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "❌ Netlify CLI not found. Please install it first:"
    echo "   npm install -g netlify-cli"
    exit 1
fi

# Update the API URL to point to Google Cloud Run
echo "📡 Setting NEXT_PUBLIC_API_URL to Google Cloud Run..."
netlify env:set NEXT_PUBLIC_API_URL "https://throp-bot-947985992378.us-central1.run.app/api/chat"

echo "✅ Environment variables updated!"
echo ""
echo "🚀 Now trigger a new deployment:"
echo "   netlify deploy --prod"
echo ""
echo "Or push changes to your main branch if auto-deploy is enabled."
