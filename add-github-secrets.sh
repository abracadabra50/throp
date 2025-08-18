#!/bin/bash

echo "
🔐 GITHUB SECRETS SETUP SCRIPT
==============================

This script will help you add the required secrets to GitHub.

Since GitHub CLI isn't authenticated, you'll need to add these manually.

📌 GO TO: https://github.com/abracadabra50/throp/settings/secrets/actions

Click 'New repository secret' for each of the following:
"

echo ""
echo "1️⃣ SECRET NAME: GCP_SERVICE_ACCOUNT_KEY"
echo "   VALUE: (paste the content below)"
echo "   ----------------------------------------"
cat /tmp/gcp-key.json
echo ""
echo "   ----------------------------------------"
echo ""

echo "2️⃣ SECRET NAME: NETLIFY_SITE_ID"
echo "   VALUE: a89fc99c-b8ba-48f6-862a-98a443a99890"
echo ""

echo "3️⃣ SECRET NAME: NETLIFY_AUTH_TOKEN"
echo "   VALUE: (Get from https://app.netlify.com/user/applications#personal-access-tokens)"
echo "   Create a new token named 'GitHub Actions' and paste it"
echo ""

echo "📋 QUICK COPY COMMANDS:"
echo "======================"
echo ""
echo "Copy GCP key to clipboard (macOS):"
echo "cat /tmp/gcp-key.json | pbcopy"
echo ""
echo "Copy Netlify Site ID to clipboard:"
echo "echo 'a89fc99c-b8ba-48f6-862a-98a443a99890' | pbcopy"
echo ""

echo "
⚠️  IMPORTANT NOTES:
===================
1. The GCP key is a JSON object - copy the ENTIRE content including brackets
2. After adding all secrets, push any change to trigger the deployment
3. The deployment should work after adding these secrets

Press Enter when you've added all the secrets to continue..."
read

echo "
🎉 Great! Let's trigger a deployment to test...
"

# Clean up the temp key file
rm -f /tmp/gcp-key.json

echo "✅ Temporary key file cleaned up"
echo ""
echo "📝 To trigger deployment, make a small change and push:"
echo "git add . && git commit -m 'trigger: deployment after adding secrets' && git push"
