# Netlify Environment Variables Setup

## Required Environment Variables for Throp on Netlify

### 🚀 Quick Start - Minimum Required Variables

These 3 are the ONLY required variables to get throp working on Netlify:
1. **ANTHROPIC_API_KEY** - Your Claude API key (get from console.anthropic.com)
2. **ANTHROPIC_MODEL** - Set to: `claude-sonnet-4-20250514`
3. **NEXT_PUBLIC_API_URL** - Your Railway backend URL (or local for testing)

Copy these to your Netlify Dashboard → Site Settings → Environment Variables

### Core API Keys (REQUIRED)
```bash
# Anthropic Claude API (for chat and hot takes)
ANTHROPIC_API_KEY=your_actual_anthropic_api_key_here
ANTHROPIC_MODEL=claude-sonnet-4-20250514

# Backend API Connection (your Railway backend)
NEXT_PUBLIC_API_URL=https://enthusiastic-creation-production.up.railway.app/api/chat
# For local testing:
# NEXT_PUBLIC_API_URL=http://localhost:3001/api/chat

# Your Netlify Site URL (update after deployment)
NEXT_PUBLIC_BASE_URL=https://your-site-name.netlify.app
# After custom domain:
# NEXT_PUBLIC_BASE_URL=https://throp.app
```

### Twitter/X API Keys (OPTIONAL - for hot takes from real trends)
```bash
# You already have these in Railway, copy the same values if you want real Twitter trends
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET_KEY=your_twitter_api_secret_key
TWITTER_ACCESS_TOKEN=your_twitter_access_token
TWITTER_ACCESS_TOKEN_SECRET=your_twitter_access_token_secret

# From your Railway setup:
TWITTER_BEARER_TOKEN=AAAAAAAAAAAAAAAAAAAAAFJw3gEAAAAAPFfvRbR%2BpS9VHocttsU4cyWZxY4%3DrSkpptB35zDiYJygoriFTNmrRF9ViieZyNOGfPDrDAIzrqbuL7
TWITTER_BOT_USER_ID=1956873492420608000
TWITTER_USERNAME=askthrop
```

### Optional SEO & Analytics
```bash
# Google Site Verification (optional)
NEXT_PUBLIC_GOOGLE_VERIFICATION=your_google_verification_code

# Yandex Verification (optional)
NEXT_PUBLIC_YANDEX_VERIFICATION=your_yandex_verification_code
```

## How to Add in Netlify

### Method 1: Via Netlify UI (Recommended)
1. Go to https://app.netlify.com
2. Select your site
3. Go to `Site configuration` → `Environment variables`
4. Click `Add a variable`
5. Choose `Add a single variable`
6. Enter the key and value
7. Click `Save`
8. **IMPORTANT**: Redeploy your site for changes to take effect

### Method 2: Via Netlify CLI
```bash
# Set individual variables
netlify env:set ANTHROPIC_API_KEY "your_api_key"
netlify env:set ANTHROPIC_MODEL "claude-3-5-sonnet-20241022"
netlify env:set NEXT_PUBLIC_API_URL "https://your-backend.railway.app/api/chat"
netlify env:set NEXT_PUBLIC_BASE_URL "https://your-site.netlify.app"

# Import from .env file
netlify env:import .env.production
```

### Method 3: Via netlify.toml (NOT recommended for secrets)
```toml
# Only use for non-sensitive values
[build.environment]
  NEXT_PUBLIC_BASE_URL = "https://throp.app"
  NODE_VERSION = "20"
```

## Environment Variable Scopes

Netlify allows different values for different contexts:

### Production
- Main branch deploys
- Custom domain visits

### Deploy Previews
- Pull request previews
- Format: `deploy-preview-123--site-name.netlify.app`

### Branch Deploys
- Non-main branch deploys
- Format: `branch-name--site-name.netlify.app`

## Verification Checklist

After setting environment variables:

- [ ] Redeploy the site
- [ ] Check build logs for any missing variable warnings
- [ ] Test chat functionality (needs ANTHROPIC_API_KEY)
- [ ] Test hot takes (needs ANTHROPIC_API_KEY)
- [ ] Check if trending prompts load (needs ANTHROPIC_API_KEY)
- [ ] Verify API connection (needs NEXT_PUBLIC_API_URL)
- [ ] Check social sharing previews (needs NEXT_PUBLIC_BASE_URL)

## Common Issues

### Variables not working?
1. **Did you redeploy?** - Changes require a new deployment
2. **Check spelling** - Variable names are case-sensitive
3. **Check prefix** - Client-side variables need `NEXT_PUBLIC_` prefix
4. **Check logs** - Build logs show which variables are loaded

### API not connecting?
- Ensure `NEXT_PUBLIC_API_URL` points to your backend
- Check CORS settings on your backend
- Verify the URL includes `/api/chat` path

### Hot takes showing fallback content?
- Verify `ANTHROPIC_API_KEY` is set correctly
- Check the API key has sufficient credits
- Look for errors in Functions logs

## Security Notes

⚠️ **NEVER commit these to git:**
- API keys
- Access tokens
- Secrets

✅ **Safe to commit:**
- Public URLs
- Non-sensitive configuration
- Build settings

## Migration from Vercel

The main differences:
1. **Setting method**: Use Netlify UI instead of Vercel dashboard
2. **No .env.local**: Netlify doesn't use local env files in production
3. **Build variables**: Some build-time variables might need different handling
4. **API Routes**: Automatically become Netlify Functions

---

*Pro tip: Keep a local `.env.production` file as backup, but add it to `.gitignore`*
