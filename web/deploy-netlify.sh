#!/bin/bash

# Netlify CLI Deployment Script for Throp
# This script will deploy your app to Netlify with the correct environment variables

echo "🚀 Starting Netlify deployment for Throp..."

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "📦 Installing Netlify CLI..."
    npm install -g netlify-cli
fi

# Login to Netlify (if not already logged in)
echo "🔑 Checking Netlify authentication..."
netlify status || netlify login

# Initialize the site (if not already initialized)
if [ ! -f ".netlify/state.json" ]; then
    echo "🏗️ Initializing Netlify site..."
    netlify init
fi

# Set environment variables using Netlify CLI
echo "⚙️ Setting environment variables..."

# Core API Keys (from your screenshot)
netlify env:set ANTHROPIC_API_KEY "sk-ant-api03-IPFUm4Oz85mEDZYN2I6rLNgC9drXspWtK-rFlf-sJCdPiDt67YB4KM2hgIOlr_aZmpcduOWgULM2jKtplgnjwQ-AIl1aOAA"
netlify env:set ANTHROPIC_MODEL "claude-sonnet-4-20250514"

# Backend connection
netlify env:set NEXT_PUBLIC_API_URL "https://throp-bot-947985992378.us-central1.run.app/api/chat"

# Base URL (will be updated after deploy)
netlify env:set NEXT_PUBLIC_BASE_URL "https://throp.netlify.app"

# Optional Twitter API for trending
netlify env:set TWITTER_BEARER_TOKEN "AAAAAAAAAAAAAAAAAAAAAFJw3gEAAAAAPFfvRbR%2BpS9VHocttsU4cyWZxY4%3DrSkpptB35zDiYJygoriFTNmrRF9ViieZyNOGfPDrDAIzrqbuL7"
netlify env:set TWITTER_BOT_USER_ID "1956873492420608000"

echo "✅ Environment variables set!"

# Build the project
echo "🔨 Building the project..."
npm run build

# Deploy to draft URL first
echo "🌐 Deploying to draft URL for testing..."
netlify deploy

echo "----------------------------------------"
echo "✨ Draft deployment complete!"
echo "Test your site at the draft URL above."
echo ""
echo "When ready to deploy to production, run:"
echo "netlify deploy --prod"
echo "----------------------------------------"
