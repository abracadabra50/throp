# Setting Up chat.throp.ai on Netlify

## Current Status
✅ Frontend deployed to: https://throp.ai
✅ Backend API on GCP: https://throp-bot-947985992378.us-central1.run.app
✅ Environment variables updated to point to GCP backend

## To Add chat.throp.ai Custom Domain:

### Option 1: Via Netlify Dashboard (Recommended)
1. Go to: https://app.netlify.com/projects/throp/configuration/domain
2. Click "Add a domain"
3. Enter: chat.throp.ai
4. Follow the DNS configuration instructions

### Option 2: Via CLI
```bash
# First, ensure you're linked to the right site
netlify link --id a89fc99c-b8ba-48f6-862a-98a443a99890

# Then add the domain alias
netlify api createSiteDomainAlias --data '{"site_id": "a89fc99c-b8ba-48f6-862a-98a443a99890", "domain": "chat.throp.ai"}'
```

## DNS Configuration Required

Add these records to your domain DNS (at your domain registrar):

### For chat.throp.ai subdomain:
```
Type: CNAME
Name: chat
Value: throp.netlify.app
TTL: 3600 (or default)
```

OR if you prefer A records:
```
Type: A
Name: chat
Value: 75.2.60.5
TTL: 3600
```

## Verify Setup
After DNS propagation (5-30 minutes):
```bash
# Check DNS
dig chat.throp.ai

# Test the site
curl -I https://chat.throp.ai
```

## Current URLs Summary:
- 🌐 Main site: https://throp.ai
- 💬 Chat app: https://chat.throp.ai (pending DNS setup)
- 🤖 Backend API: https://throp-bot-947985992378.us-central1.run.app
- 🐦 Twitter Bot: [@askthrop](https://twitter.com/askthrop)
