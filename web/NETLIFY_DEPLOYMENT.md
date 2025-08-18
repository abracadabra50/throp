# Netlify Deployment Guide for Throp Web App

## Quick Start

### 1. Prerequisites
- Netlify account (free tier works)
- GitHub/GitLab/Bitbucket repository connected
- Environment variables ready

### 2. Deploy via Netlify UI

1. **Connect Repository**
   ```
   1. Go to https://app.netlify.com
   2. Click "Add new site" → "Import an existing project"
   3. Connect your Git provider
   4. Select the throp repository
   5. Set base directory to: web
   ```

2. **Configure Build Settings**
   ```
   Base directory: web
   Build command: npm run build
   Publish directory: .next
   ```

3. **Environment Variables**
   Add these in Netlify Dashboard → Site Settings → Environment Variables:
   ```
   ANTHROPIC_API_KEY=your_anthropic_api_key
   ANTHROPIC_MODEL=claude-sonnet-4-20250514
   NEXT_PUBLIC_API_URL=https://your-backend-url/api/chat
   NEXT_PUBLIC_BASE_URL=https://your-site.netlify.app
   
   # Optional Twitter API keys for hot takes
   TWITTER_API_KEY=your_key
   TWITTER_API_SECRET=your_secret
   TWITTER_ACCESS_TOKEN=your_token
   TWITTER_ACCESS_SECRET=your_secret
   TWITTER_BEARER_TOKEN=your_bearer_token
   ```

### 3. Deploy via Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Initialize Site**
   ```bash
   cd web
   netlify init
   ```

4. **Deploy**
   ```bash
   # Deploy to draft URL for testing
   netlify deploy
   
   # Deploy to production
   netlify deploy --prod
   ```

## Custom Domain Setup

1. **Add Custom Domain**
   - Go to Site Settings → Domain Management
   - Click "Add custom domain"
   - Enter your domain (e.g., throp.app)

2. **DNS Configuration**
   - Point your domain to Netlify:
   ```
   Type: CNAME
   Name: www
   Value: your-site.netlify.app
   
   Type: A
   Name: @
   Value: 75.2.60.5
   ```

3. **SSL Certificate**
   - Netlify provides free SSL automatically
   - Usually provisioned within minutes

## Netlify Functions (Serverless)

If you need serverless functions, create them in `netlify/functions/`:

```javascript
// netlify/functions/hello.js
exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Hello from Netlify Functions!' })
  };
};
```

## Build Optimizations

### 1. Next.js on Netlify
The `@netlify/plugin-nextjs` plugin is automatically installed and handles:
- ISR (Incremental Static Regeneration)
- API routes → Netlify Functions conversion
- Image optimization
- Middleware support

### 2. Build Cache
Netlify automatically caches:
- `node_modules/`
- `.next/cache/`
- Build artifacts

### 3. Environment-based Builds
```toml
# netlify.toml
[context.production]
  command = "npm run build"
  
[context.deploy-preview]
  command = "npm run build:preview"
  
[context.branch-deploy]
  command = "npm run build:dev"
```

## Monitoring & Analytics

1. **Netlify Analytics** (paid feature)
   - Server-side analytics
   - No client-side tracking needed

2. **Build Logs**
   - Available in Netlify Dashboard
   - Real-time build output

3. **Function Logs**
   - View in Functions tab
   - Real-time execution logs

## Common Issues & Solutions

### Issue: Build fails with "Cannot find module"
**Solution**: Ensure all dependencies are in `package.json`, not `devDependencies`

### Issue: API routes not working
**Solution**: Check that API routes are being converted to Netlify Functions

### Issue: Environment variables not loading
**Solution**: 
- Redeploy after adding env vars
- Use `NEXT_PUBLIC_` prefix for client-side vars

### Issue: Large bundle size
**Solution**: 
```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['your-domain.com'],
  },
  experimental: {
    optimizeCss: true,
  },
}
```

## Deploy Hooks

Create automatic deployments on events:

1. **GitHub Actions**
   ```yaml
   - name: Trigger Netlify Build
     run: curl -X POST -d {} ${{ secrets.NETLIFY_BUILD_HOOK }}
   ```

2. **Scheduled Builds**
   - Use Netlify Build Hooks with cron jobs
   - Or GitHub Actions scheduled workflows

## Performance Tips

1. **Enable Prerendering**
   ```javascript
   // In your pages
   export const revalidate = 3600; // Revalidate every hour
   ```

2. **Optimize Images**
   ```javascript
   import Image from 'next/image';
   // Netlify automatically optimizes Next.js images
   ```

3. **Use Edge Functions** (for geo-specific content)
   ```javascript
   // netlify/edge-functions/geo-redirect.js
   export default async (request, context) => {
     const country = context.geo?.country?.code;
     // Logic based on country
   };
   ```

## Rollback & Staging

1. **Instant Rollbacks**
   - Go to Deploys tab
   - Click on any previous deploy
   - Click "Publish deploy"

2. **Branch Deploys**
   - Each branch gets its own URL
   - Format: `branch-name--site-name.netlify.app`

3. **Deploy Previews**
   - Automatic for pull requests
   - Format: `deploy-preview-123--site-name.netlify.app`

## Cost Considerations

**Free Tier Includes:**
- 100GB bandwidth/month
- 300 build minutes/month
- Continuous deployment
- HTTPS/SSL
- Global CDN

**When to Upgrade:**
- Need more than 100GB bandwidth
- Need analytics
- Need more build minutes
- Need password protection

## Migration from Vercel

Key differences:
1. **API Routes**: Automatically converted to Netlify Functions
2. **Environment Variables**: Set in Netlify UI, not `.env` files
3. **ISR**: Supported via On-Demand Builders
4. **Edge Functions**: Similar to Vercel Edge Functions but with Deno runtime

## Support

- **Documentation**: https://docs.netlify.com
- **Community**: https://answers.netlify.com
- **Support**: https://www.netlify.com/support/

## Deployment Checklist

- [ ] Repository connected
- [ ] Build settings configured
- [ ] Environment variables set
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] Build successful
- [ ] API routes working
- [ ] Hot takes loading
- [ ] Chat functionality working
- [ ] Social sharing meta tags working

---

*Remember: Netlify builds are triggered automatically on git push to connected branches*
