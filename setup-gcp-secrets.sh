#!/bin/bash

# Setup GCP Secret Manager for Throp
# This script helps you migrate from GitHub Secrets to GCP Secret Manager

set -e

echo "🔐 Setting up GCP Secret Manager for Throp"
echo "=========================================="

PROJECT_ID="throp-469410"

# Check if gcloud is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q "@"; then
    echo "❌ Not authenticated with gcloud. Please run:"
    echo "   gcloud auth login"
    echo "   gcloud config set project $PROJECT_ID"
    exit 1
fi

echo "✅ gcloud authenticated"
echo "📋 Project: $PROJECT_ID"

# Enable Secret Manager API if not already enabled
echo "🔧 Ensuring Secret Manager API is enabled..."
gcloud services enable secretmanager.googleapis.com --project=$PROJECT_ID

# List of secrets we need
SECRETS=(
    "ANTHROPIC_API_KEY:Your Claude API key (starts with sk-ant-)"
    "PERPLEXITY_API_KEY:Your Perplexity API key (starts with pplx-)"
    "TWITTER_API_KEY:Your X/Twitter API key (26 characters)"
    "TWITTER_API_SECRET_KEY:Your X/Twitter API secret key (50 characters)"
    "TWITTER_ACCESS_TOKEN:Your X/Twitter access token (50 characters)"
    "TWITTER_ACCESS_TOKEN_SECRET:Your X/Twitter access token secret (45 characters)"
    "TWITTER_BEARER_TOKEN:Your X/Twitter bearer token (starts with AAAA, URL-encoded)"
    "TWITTER_BOT_USER_ID:Your bot's user ID (1956873492420608000)"
)

echo ""
echo "📝 Setting up secrets in GCP Secret Manager..."
echo ""

# Check existing secrets
echo "Checking existing secrets..."
EXISTING_SECRETS=$(gcloud secrets list --format="value(name)" 2>/dev/null || echo "")

for secret_info in "${SECRETS[@]}"; do
    IFS=':' read -r secret_name description <<< "$secret_info"
    
    if echo "$EXISTING_SECRETS" | grep -q "^$secret_name$"; then
        echo "✅ $secret_name already exists"
        
        # Show when it was last updated
        LAST_UPDATE=$(gcloud secrets versions list "$secret_name" --limit=1 --format="value(createTime)" 2>/dev/null || echo "unknown")
        echo "   Last updated: $LAST_UPDATE"
    else
        echo "➕ Creating secret: $secret_name"
        echo "   Description: $description"
        
        # Create secret with placeholder
        echo "PLACEHOLDER_REPLACE_WITH_REAL_VALUE" | gcloud secrets create "$secret_name" \
            --data-file=- \
            --replication-policy="automatic" \
            --labels="app=throp,type=api-key"
        
        echo "   ⚠️  Created with placeholder value - you need to update it!"
    fi
    echo ""
done

echo "🔧 Setting up IAM permissions..."

# Get the service account email (assuming it's the Compute Engine default)
SERVICE_ACCOUNT=$(gcloud iam service-accounts list --filter="displayName:'Compute Engine default service account'" --format="value(email)" | head -1)

if [ -z "$SERVICE_ACCOUNT" ]; then
    echo "⚠️  Could not find default service account. You may need to manually set permissions."
else
    echo "📧 Service account: $SERVICE_ACCOUNT"
    
    # Grant Secret Manager Secret Accessor role
    gcloud projects add-iam-policy-binding $PROJECT_ID \
        --member="serviceAccount:$SERVICE_ACCOUNT" \
        --role="roles/secretmanager.secretAccessor" \
        --quiet
    
    echo "✅ Granted Secret Manager access to service account"
fi

echo ""
echo "📊 Current secrets in GCP Secret Manager:"
gcloud secrets list --format="table(name,createTime,labels.app)"

echo ""
echo "🚀 Next Steps:"
echo "=============="
echo ""
echo "1. **Update secret values with real API keys:**"
echo "   For each secret, run:"
echo "   echo 'YOUR_REAL_API_KEY' | gcloud secrets versions add SECRET_NAME --data-file=-"
echo ""
echo "   Example:"
echo "   echo 'sk-ant-your-key-here' | gcloud secrets versions add ANTHROPIC_API_KEY --data-file=-"
echo ""
echo "2. **Your current API keys (from your investigation):**
echo "   - TWITTER_BEARER_TOKEN: AAAAAAAAAAAAAAAAAAAAAFJw3gEAAAAABu%2Fkmro5r%2BNZZZBumXOJMtrp8xA%3DllKHoO8R5K84KjGUfOqV6TTo6Kb1vJe79uudyhoH9Ke1IPGy1D"
echo "   - TWITTER_BOT_USER_ID: 1956873492420608000"
echo ""
echo "3. **Test the integration:**
echo "   gh workflow run 'GCP Secret Manager Monitoring'"
echo ""
echo "4. **Monitor the results:**
echo "   gh run list --workflow='GCP Secret Manager Monitoring'"
echo ""

echo "🔐 Benefits of GCP Secret Manager:"
echo "- ✅ Centralized secret management"
echo "- ✅ Automatic encryption at rest and in transit"
echo "- ✅ Access logging and auditing"
echo "- ✅ Fine-grained IAM permissions"
echo "- ✅ Integration with your existing GCP infrastructure"
echo "- ✅ No need to manage GitHub Secrets for API keys"
echo ""

echo "⚠️  Important Security Notes:"
echo "- Never commit API keys to git"
echo "- Use 'gcloud secrets versions access latest --secret=SECRET_NAME' to retrieve values"
echo "- Regularly rotate your API keys"
echo "- Monitor access logs in GCP Console"
echo ""

echo "✅ GCP Secret Manager setup complete!"
echo ""
echo "To update a secret value:"
echo "  echo 'NEW_VALUE' | gcloud secrets versions add SECRET_NAME --data-file=-"
echo ""
echo "To view secret metadata (not the value):"
echo "  gcloud secrets describe SECRET_NAME"
echo ""
echo "To test that secrets work:"
echo "  gh workflow run 'GCP Secret Manager Monitoring'"
