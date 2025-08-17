# 🚀 Deployment Checklist for Railway

## ✅ Ready for Deployment!

Your Throp bot is **ready to deploy** to Railway. Quote monitor is included but disabled by default (good call for Basic plan).

## 📋 Quick Deploy Steps

### 1️⃣ Push to GitHub
```bash
git add .
git commit -m "Ready for Railway deployment"
git push origin main
```

### 2️⃣ Deploy to Railway
```bash
# Via CLI
railway login
railway link
railway up

# Or via Dashboard
# Go to railway.app → New Project → Deploy from GitHub
```

### 3️⃣ Set Environment Variables (in Railway)

#### 🔴 REQUIRED Variables
```env
# Twitter API
TWITTER_API_KEY=
TWITTER_API_SECRET_KEY=
TWITTER_ACCESS_TOKEN=
TWITTER_ACCESS_TOKEN_SECRET=
TWITTER_BOT_USERNAME=
TWITTER_BOT_USER_ID=
TWITTER_API_PLAN=basic

# AI Engines
PERPLEXITY_API_KEY=
ANTHROPIC_API_KEY=

# Settings
NODE_ENV=production
DRY_RUN=false
```

#### 🟡 OPTIONAL Variables
```env
# Redis (auto-injected if you add Redis addon)
REDIS_URL=${{Redis.REDIS_URL}}

# API Settings (if running web interface)
API_ONLY_MODE=false
API_PORT=3001
ADMIN_API_KEY=

# Quote Monitor (DON'T ENABLE ON BASIC!)
ENABLE_QUOTE_MONITOR=false
```

## 🏗️ What's Included

### ✅ Production Ready
- [x] TypeScript build configured
- [x] Health check endpoint (`/health`)
- [x] Error handling & logging
- [x] Rate limiting protection
- [x] Redis caching support
- [x] Environment-based config

### 🎯 CI/CD Pipeline
- [x] GitHub Actions workflow
- [x] Auto-deploy on push to main
- [x] Staging deploys for PRs
- [x] Build & lint checks
- [x] Security audits

### 📦 Services You Can Run

1. **Main Bot** (Recommended)
   ```bash
   npm run start:bot  # Replies to mentions
   ```

2. **API Server** (Optional)
   ```bash
   npm run start:api  # Web interface
   ```

3. **Quote Monitor** (Not for Basic Plan!)
   ```bash
   npm run start:monitor  # DON'T USE ON BASIC
   ```

## ⚠️ Basic Plan Limits Reminder

**Your Rate Limits:**
- 10 mention checks per 15 min ✅
- 100 tweets per day ✅
- 5 timeline checks per 15 min ❌ (Quote monitor needs more)

**Safe Settings:**
```env
MAX_MENTIONS_PER_BATCH=5
MAX_TWEETS_PER_HOUR=4
CHECK_INTERVAL=300000  # 5 minutes
ENABLE_QUOTE_MONITOR=false  # Keep disabled!
```

## 🔍 Post-Deploy Verification

1. **Check Health:**
   ```bash
   curl https://your-app.up.railway.app/health
   ```

2. **View Logs:**
   ```bash
   railway logs -f
   ```

3. **Test Bot:**
   - Tweet: "@yourbot hello"
   - Wait 5 minutes
   - Check for reply

## 💡 Tips

- **Start Small:** Run just the bot first, add API later
- **Monitor Closely:** Watch logs for first 24 hours
- **Adjust Limits:** Based on actual usage patterns
- **Use Redis:** Add Railway Redis addon ($5/mo) for better performance

## 🚨 If Something Goes Wrong

1. Check Railway logs
2. Verify environment variables
3. Ensure Twitter credentials are correct
4. Check rate limit errors (429)
5. Rollback if needed (Railway dashboard → Deployments)

## 📊 Expected Costs

| Service | Cost |
|---------|------|
| Railway Starter | $5/mo (500 hours included) |
| Redis Addon | $5/mo |
| **Total** | **$10/mo** |

Plus:
- Twitter API Basic: $100/mo
- Perplexity API: ~$10-20/mo
- Claude API: ~$10-20/mo

## 🎉 You're Ready!

Deploy with confidence. The bot is configured conservatively for Basic plan limits.

**Remember:** Quote monitor is built but disabled. Only enable if you upgrade to Pro!
