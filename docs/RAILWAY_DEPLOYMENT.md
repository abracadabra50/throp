# 🚂 Railway Deployment Guide for Throp

## 📋 Pre-Deployment Checklist

- [ ] GitHub repository created and code pushed
- [ ] Railway account created (railway.app)
- [ ] API keys ready (Perplexity, Twitter, etc.)
- [ ] Redis addon planned ($5/month)

## 🚀 Step-by-Step Deployment

### Step 1: Prepare Your Repository

```bash
# Ensure you're on main branch
git checkout main

# Push latest changes
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

### Step 2: Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect your GitHub account
5. Select your `throp` repository

### Step 3: Configure Services

Railway will automatically detect our `railway.json` config. You'll need to set up:

#### Main Bot Service (Replies to Mentions)
```yaml
Service Name: throp-bot
Start Command: npm run start:bot
```

#### API Service (Optional - for web interface)
```yaml
Service Name: throp-api  
Start Command: npm run start:api
Port: 3001
```

#### Redis (Required for both)
1. Click "New" → "Database" → "Add Redis"
2. Railway will automatically inject `REDIS_URL`

### Step 4: Environment Variables

Click on your service → "Variables" → Add the following:

#### Essential Variables (Bot)
```env
# Twitter API (Required for bot)
TWITTER_API_KEY=your_api_key
TWITTER_API_SECRET_KEY=your_api_secret
TWITTER_ACCESS_TOKEN=your_access_token
TWITTER_ACCESS_TOKEN_SECRET=your_access_secret
TWITTER_BOT_USERNAME=your_bot_username
TWITTER_BOT_USER_ID=your_bot_user_id
TWITTER_API_PLAN=basic

# Perplexity (Required)
PERPLEXITY_API_KEY=pplx-xxxxx

# Claude (Required for personality)
ANTHROPIC_API_KEY=sk-ant-xxxxx

# Bot Settings
MAX_MENTIONS_PER_BATCH=5
MAX_TWEETS_PER_HOUR=4
DRY_RUN=false
DEBUG=false
```

#### Additional Variables (API)
```env
# API Mode
API_ONLY_MODE=false  # Set to true if running API only
API_PORT=3001
ADMIN_API_KEY=generate_a_secure_key_here
FRONTEND_URL=https://your-frontend.vercel.app

# Redis (auto-injected by Railway)
REDIS_URL=${{Redis.REDIS_URL}}
REDIS_NAMESPACE=throp
```

#### Quote Monitor Variables (DON'T USE ON BASIC PLAN!)
```env
# Only if you have Pro plan
ENABLE_QUOTE_MONITOR=false  # Keep false for Basic plan
MONITOR_ACCOUNTS=elonmusk   # Only 1-2 accounts max
MONITOR_INTERVAL=900000      # 15 minutes minimum
```

### Step 5: Deploy

1. Railway will automatically deploy when you push to main
2. Check logs: Click service → "Logs"
3. Monitor health: Click service → "Metrics"

## 🎯 Deployment Configurations

### Option A: Bot Only (Recommended for Basic Plan)
```json
{
  "deploy": {
    "startCommand": "npm run start:bot",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

**Cost:** ~$5-10/month
**What it does:** Replies to mentions only

### Option B: Bot + API
```json
{
  "services": [
    {
      "name": "bot",
      "startCommand": "npm run start:bot"
    },
    {
      "name": "api",
      "startCommand": "npm run start:api",
      "port": 3001
    }
  ]
}
```

**Cost:** ~$10-20/month
**What it does:** Bot + Web interface

### Option C: API Only (for web interface)
```json
{
  "deploy": {
    "startCommand": "npm run start:api",
    "port": 3001
  }
}
```

**Cost:** ~$5/month
**What it does:** Web chat interface only

## 📊 CI/CD Pipeline

### GitHub Actions Setup

1. Go to your GitHub repo → Settings → Secrets
2. Add these secrets:

```yaml
RAILWAY_TOKEN: Get from Railway dashboard → Account Settings
RAILWAY_PROJECT_ID: Get from Railway project settings
RAILWAY_TOKEN_STAGING: (Optional) For staging environment
RAILWAY_PROJECT_ID_STAGING: (Optional) For staging
```

### Automatic Deployments

With our GitHub Actions workflow, you get:

- **Push to main** → Deploy to production
- **Open PR** → Deploy to staging
- **Merge PR** → Auto-deploy to production
- **Failed deploy** → Notification (manual rollback needed)

## 🔍 Monitoring & Logs

### View Logs
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# View logs
railway logs

# Stream logs
railway logs -f
```

### Health Checks
Railway automatically hits `/health` endpoint every 30 seconds

### Metrics Dashboard
- CPU usage
- Memory usage  
- Network I/O
- Request count

## 🚨 Common Issues & Solutions

### Issue: Rate Limit Errors (429)
**Solution:** You're on Basic plan. Disable quote monitor:
```env
ENABLE_QUOTE_MONITOR=false
MAX_MENTIONS_PER_BATCH=3
```

### Issue: High Memory Usage
**Solution:** Add memory limit:
```json
{
  "deploy": {
    "memoryLimit": "512"
  }
}
```

### Issue: Bot Not Responding
**Check:**
1. Logs for errors
2. Twitter credentials are correct
3. DRY_RUN=false
4. Rate limits not exceeded

### Issue: Redis Connection Failed
**Solution:** Ensure Redis addon is provisioned and REDIS_URL is set

## 💰 Cost Breakdown

| Component | Cost/Month | Notes |
|-----------|------------|--------|
| Railway Starter | $5 | 500 hours, then $0.01/hour |
| Redis | $5 | 1GB RAM |
| **Total** | **$10-20** | Depends on usage |

## 🔄 Updates & Maintenance

### Deploy Updates
```bash
git add .
git commit -m "Update: description"
git push origin main
# Railway auto-deploys
```

### Rollback
1. Go to Railway dashboard
2. Click on service
3. Go to "Deployments"
4. Click "Rollback" on previous deployment

### Scale Up
```json
{
  "deploy": {
    "numReplicas": 2,  // Add more instances
    "memoryLimit": "1024"  // Increase memory
  }
}
```

## ⚠️ Important Notes for Basic Plan

**DO NOT:**
- ❌ Enable quote monitor (ENABLE_QUOTE_MONITOR=false)
- ❌ Set MAX_MENTIONS_PER_BATCH > 5
- ❌ Set check intervals < 5 minutes
- ❌ Monitor more than 1 account

**DO:**
- ✅ Focus on mention replies only
- ✅ Use 5+ minute check intervals
- ✅ Keep MAX_TWEETS_PER_HOUR low (3-4)
- ✅ Monitor rate limit logs carefully

## 🎓 Next Steps

1. **Monitor First Week:** Watch logs closely
2. **Adjust Rate Limits:** Based on actual usage
3. **Consider Upgrade:** If hitting limits frequently
4. **Add Monitoring:** Set up Sentry or LogDNA
5. **Backup Strategy:** Regular config exports

## 🆘 Need Help?

- Railway Discord: [discord.gg/railway](https://discord.gg/railway)
- Railway Docs: [docs.railway.app](https://docs.railway.app)
- Our Issues: [GitHub Issues](https://github.com/yourusername/throp/issues)
