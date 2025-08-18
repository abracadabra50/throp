#!/bin/bash

# Setup script for chat.throp.ai custom domain

echo "🌐 Setting up chat.throp.ai custom domain..."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 1: Add Domain in Netlify Dashboard"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "👉 Opening Netlify domain management..."
echo "   https://app.netlify.com/sites/throp/domain-management"
echo ""
echo "1. Click 'Add a domain'"
echo "2. Enter: chat.throp.ai"
echo "3. Click 'Verify' then 'Add domain'"
echo ""
read -p "Press Enter when you've added the domain in Netlify..."

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 2: Configure DNS (in your domain provider)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Add this DNS record:"
echo ""
echo "  Type:  CNAME"
echo "  Name:  chat"
echo "  Value: throp.netlify.app"
echo "  TTL:   3600 (or Auto)"
echo ""
echo "Common providers:"
echo "  • Cloudflare: DNS → Records → Add record"
echo "  • Namecheap: Domain List → Manage → Advanced DNS"
echo "  • GoDaddy: My Products → DNS → Add"
echo ""
read -p "Press Enter when you've added the CNAME record..."

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 3: Updating Environment Variables"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Update environment variable
netlify env:set NEXT_PUBLIC_BASE_URL "https://chat.throp.ai" --force

echo "✅ Environment variable updated!"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 4: Deploying with new domain"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Build and deploy
npm run build && netlify deploy --prod

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 5: Verification"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Checking DNS propagation..."
echo ""

# Check DNS
nslookup chat.throp.ai 2>/dev/null || echo "DNS not propagated yet"

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Your site will be available at:"
echo "  🔗 https://chat.throp.ai"
echo ""
echo "Notes:"
echo "  • DNS propagation can take 5-30 minutes"
echo "  • SSL certificate provisioning takes 5-15 minutes"
echo "  • Check status at: https://app.netlify.com/sites/throp/domain-management"
echo ""
echo "Test the site:"
echo "  curl -I https://chat.throp.ai"
