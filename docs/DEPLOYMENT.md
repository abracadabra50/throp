# 🚀 Throp Deployment Guide

## Hosting Options & Recommendations

### 🏆 Recommended Stack

**Best Option: Vercel (Frontend) + Railway (Backend)**

| Component | Service | Cost | Why |
|-----------|---------|------|-----|
| **Web Interface** | Vercel | Free-$20/mo | Next.js optimised, edge functions |
| **API + Bot** | Railway | $5-20/mo | Simple deployment, good for Node.js |
| **Redis** | Railway Redis | $5/mo | Integrated with Railway |
| **Database** | Supabase | Free-$25/mo | If you need persistent storage |

### 🎯 Quick Deployment Options

## Option 1: Railway (Recommended for Beginners)
**Perfect for: Complete bot + API deployment**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and initialize
railway login
railway init

# Add environment variables in Railway dashboard
# Deploy
railway up
```

**Railway Config (`railway.toml`):**
```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "npm run start:api"
healthcheckPath = "/health"
healthcheckTimeout = 300

[[services]]
name = "api"
startCommand = "npm run start:api"

[[services]]
name = "bot"
startCommand = "npm start"
```

## Option 2: DigitalOcean App Platform
**Perfect for: Production deployment with scaling**

```yaml
# app.yaml
name: throp
region: nyc
services:
- name: api
  github:
    repo: yourusername/throp
    branch: main
  build_command: npm run build
  run_command: npm run start:api
  environment_slug: node-js
  instance_size_slug: basic-xxs
  instance_count: 1
  http_port: 3001
  routes:
  - path: /api
  
- name: bot
  github:
    repo: yourusername/throp
    branch: main
  build_command: npm run build
  run_command: npm start
  environment_slug: node-js
  instance_size_slug: basic-xxs
  instance_count: 1
  
databases:
- name: redis
  engine: REDIS
  version: "7"
```

## Option 3: Render.com
**Perfect for: Simple, automatic deployments**

```yaml
# render.yaml
services:
  - type: web
    name: throp-api
    env: node
    region: oregon
    plan: starter
    buildCommand: npm install && npm run build
    startCommand: npm run start:api
    envVars:
      - key: NODE_ENV
        value: production
      - key: API_ONLY_MODE
        value: true
        
  - type: worker
    name: throp-bot
    env: node
    region: oregon
    plan: starter
    buildCommand: npm install && npm run build
    startCommand: npm start
```

## Option 4: Self-Hosted VPS
**Perfect for: Full control, lower costs**

### Using Docker:

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.env.example ./.env.example

EXPOSE 3001
CMD ["npm", "run", "start:api"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  api:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - API_ONLY_MODE=true
      - REDIS_URL=redis://redis:6379
      - PERPLEXITY_API_KEY=${PERPLEXITY_API_KEY}
      - ADMIN_API_KEY=${ADMIN_API_KEY}
    depends_on:
      - redis
    restart: unless-stopped

  bot:
    build: .
    command: npm start
    environment:
      - NODE_ENV=production
      - REDIS_URL=redis://redis:6379
      - PERPLEXITY_API_KEY=${PERPLEXITY_API_KEY}
      - TWITTER_API_KEY=${TWITTER_API_KEY}
      # ... other Twitter credentials
    depends_on:
      - redis
    restart: unless-stopped

volumes:
  redis_data:
```

### VPS Providers:
- **Hetzner**: €4.51/mo (Germany, best value)
- **DigitalOcean**: $6/mo (global)
- **Linode**: $5/mo (global)
- **Vultr**: $6/mo (global)

## 🔒 Environment Variables

### Essential for API-only mode:
```env
# Core
NODE_ENV=production
API_ONLY_MODE=true
API_PORT=3001

# Perplexity (Required)
PERPLEXITY_API_KEY=pplx-xxx
PERPLEXITY_MODEL=sonar

# Security (Required for production)
ADMIN_API_KEY=admin_generate_random_key_here
FRONTEND_URL=https://your-frontend.vercel.app

# Redis (Recommended)
REDIS_URL=redis://xxx

# Optional
LOG_LEVEL=info
```

### Additional for Twitter Bot:
```env
TWITTER_API_KEY=xxx
TWITTER_API_SECRET_KEY=xxx
TWITTER_ACCESS_TOKEN=xxx
TWITTER_ACCESS_TOKEN_SECRET=xxx
TWITTER_BOT_USERNAME=throp
TWITTER_BOT_USER_ID=xxx
```

## 🌐 Frontend Integration

Your Next.js frontend should connect to the API like this:

```javascript
// In your frontend .env
NEXT_PUBLIC_API_URL=https://your-api.railway.app

// For admin features
NEXT_PUBLIC_ADMIN_KEY=your_admin_key // Be careful with this!
```

### API Endpoints for Frontend:

**Public Endpoints (Web Interface):**
- `GET /health` - Health check
- `GET /api/status` - Bot status
- `POST /api/chat` - Chat with Throp (chaos mode enabled)
- `GET /api/cache/interactions` - Recent interactions
- `POST /api/tweet/preview` - Preview chaos transformation

**Admin Only (Protected):**
- `POST /api/tweet/prompt` - Generate proactive tweet
- `POST /api/tweet/react` - React to trending topic
- `POST /api/tweet/schedule` - Schedule tweets

## 🚦 Deployment Steps

### 1. Prepare Your Code
```bash
# Build the project
npm run build

# Test locally
API_ONLY_MODE=true npm run start:api
```

### 2. Set Up Redis
- Use managed Redis from your hosting provider
- Or use Upstash for serverless Redis ($0-10/mo)

### 3. Configure Environment
- Generate admin key: `openssl rand -hex 32`
- Set all required environment variables
- Configure CORS for your frontend domain

### 4. Deploy API
```bash
# Railway
railway up

# Or push to GitHub for automatic deployment
git push origin main
```

### 5. Test Endpoints
```bash
# Health check
curl https://your-api.railway.app/health

# Test chat (should return chaos mode)
curl -X POST https://your-api.railway.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is Bitcoin?"}'

# Test admin endpoint
curl -X POST https://your-api.railway.app/api/tweet/prompt \
  -H "X-Admin-Key: your_admin_key" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "test tweet", "dryRun": true}'
```

## 💰 Cost Breakdown

### Minimal Setup (Web Interface Only)
- **Vercel**: Free (frontend)
- **Railway**: $5/mo (API)
- **Upstash Redis**: Free tier
- **Total**: ~$5/mo

### Standard Setup (Bot + API)
- **Vercel**: Free (frontend)
- **Railway**: $10-20/mo (API + Bot)
- **Railway Redis**: $5/mo
- **Total**: ~$15-25/mo

### Production Setup
- **Vercel Pro**: $20/mo (frontend)
- **DigitalOcean**: $24/mo (2x $12 droplets)
- **Managed Redis**: $15/mo
- **Total**: ~$59/mo

## 🔍 Monitoring

### Free Options:
- **UptimeRobot**: Monitor uptime
- **Sentry**: Error tracking (free tier)
- **LogDNA**: Log aggregation (free tier)

### Add to your app:
```javascript
// Sentry integration
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

## 🚨 Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure `ADMIN_API_KEY` with strong random key
- [ ] Set up Redis for caching
- [ ] Configure CORS for your frontend domain
- [ ] Set up monitoring/alerts
- [ ] Configure rate limiting
- [ ] Set up backup strategy
- [ ] Test all endpoints
- [ ] Configure SSL/HTTPS
- [ ] Set up CI/CD pipeline

## 🆘 Troubleshooting

### API won't start
- Check `API_ONLY_MODE=true` is set
- Verify Perplexity API key is valid
- Check Redis connection

### CORS errors
- Update `FRONTEND_URL` in environment
- Check API allows your domain

### Admin endpoints return 401
- Verify `ADMIN_API_KEY` is set
- Include `X-Admin-Key` header in requests

### Redis connection failed
- Check `REDIS_URL` format
- Verify Redis is running
- Check firewall rules

---

## 🎯 Quick Start Commands

```bash
# For Railway deployment
railway login
railway init
railway add
railway up

# For Docker deployment
docker-compose up -d

# For manual VPS
pm2 start npm --name "throp-api" -- run start:api
pm2 start npm --name "throp-bot" -- start
pm2 save
pm2 startup
```

thats it,,, deploy and let chaos reign 🌀
