#!/bin/bash

# Setup script for Perplexity API key
# This script helps configure your Throp bot with Perplexity AI

echo "🤖 Setting up Throp with Perplexity AI"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "✅ .env file created"
else
    echo "📋 .env file already exists"
fi

# Update Perplexity API key
echo ""
echo "🔑 Configuring Perplexity API key..."

# Check if the key is already set
if grep -q "^PERPLEXITY_API_KEY=pplx-" .env; then
    echo "✅ Perplexity API key already configured"
else
    # Update the Perplexity API key
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' 's/^PERPLEXITY_API_KEY=.*/PERPLEXITY_API_KEY=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/' .env
    else
        # Linux
        sed -i 's/^PERPLEXITY_API_KEY=.*/PERPLEXITY_API_KEY=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/' .env
    fi
    echo "✅ Perplexity API key configured"
fi

# Set Perplexity as the default answer engine
if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' 's/^ANSWER_ENGINE=.*/ANSWER_ENGINE=perplexity/' .env
    sed -i '' 's/^PERPLEXITY_MODEL=.*/PERPLEXITY_MODEL=sonar/' .env
else
    sed -i 's/^ANSWER_ENGINE=.*/ANSWER_ENGINE=perplexity/' .env
    sed -i 's/^PERPLEXITY_MODEL=.*/PERPLEXITY_MODEL=sonar/' .env
fi

echo "✅ Perplexity set as default answer engine"
echo ""

# Display current Perplexity configuration
echo "📊 Current Perplexity Configuration:"
echo "------------------------------------"
grep "^PERPLEXITY_" .env | sed 's/PERPLEXITY_API_KEY=.*/PERPLEXITY_API_KEY=[HIDDEN]/'
grep "^ANSWER_ENGINE=" .env
echo ""

echo "🎉 Perplexity setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Configure your Twitter API credentials in .env"
echo "2. Test the API server: npm run dev:api"
echo "3. Test the bot: npm run dev -- --dry-run"
echo ""
echo "💡 To test Perplexity integration immediately:"
echo "   npm run dev:api"
echo "   Then in another terminal:"
echo "   ./test-api.sh"
