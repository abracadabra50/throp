# 🚨 Railway Deployment Fix Guide

## Current Status
Railway deployment is failing even though all environment variables are set.

## Solution Options:

### Option 1: Wait for Current Fix (Just Pushed)
I've updated the Dockerfile to build TypeScript on Railway. This deployment should work.

**Monitor deployment:**
```bash
./check-deployment.sh
```

### Option 2: If Still Failing - Use Simple Dockerfile
If the deployment still fails after 5 minutes:

1. **In Railway Dashboard:**
   - Go to Settings → Build
   - Change `dockerfilePath` from `Dockerfile` to `Dockerfile.api`
   - OR set Build Command to: `docker build -f Dockerfile.api .`

2. **Alternative - Update railway.toml:**
   ```toml
   [build]
   builder = "DOCKERFILE"
   dockerfilePath = "Dockerfile.api"
   ```

### Option 3: Clear Build Cache
In Railway Dashboard:
1. Go to your service
2. Settings → General
3. Click "Clear Build Cache"
4. Trigger new deployment

### Option 4: Use Nixpacks (No Docker)
1. Delete `railway.toml`
2. In Railway Dashboard, Settings → Build:
   - Builder: Nixpacks
   - Build Command: `npm install && npm run build`
   - Start Command: `node dist/src/api/start.js`

## What Changed:
- ✅ Multi-stage Docker build (compiles TypeScript on Railway)
- ✅ Increased health check timeout to 5 minutes
- ✅ Graceful service initialization (won't crash if services unavailable)
- ✅ Added fallback Dockerfile.api for simpler deployment

## Testing After Deployment:
```bash
# Check if it's running
curl https://throp-gh-production.up.railway.app/health

# Test chat (will fail without Anthropic key, but shows it's running)
curl -X POST https://throp-gh-production.up.railway.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "hello"}'
```

## Required Environment Variables:
All these must be set in Railway:
- ✅ ANTHROPIC_API_KEY (for chat personality)
- ✅ PERPLEXITY_API_KEY (for factual answers)
- ✅ TWITTER_* variables (for bot functionality)
- ✅ PORT (Railway sets this automatically)

## If Nothing Works:
The app is falling back to a 404 page, which means Railway isn't even starting the container. Check:
1. Build logs in Railway dashboard
2. Deployment logs for crash messages
3. Consider using Vercel Functions instead for the API
