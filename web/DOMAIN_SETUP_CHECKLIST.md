# ✅ Custom Domain Setup Checklist for chat.throp.ai

## What We've Done So Far ✅
- [x] Deployed to Netlify successfully
- [x] Updated environment variables (`NEXT_PUBLIC_BASE_URL` = `https://chat.throp.ai`)
- [x] Updated all frontend references (sitemap, robots.txt, metadata)
- [x] Created setup scripts and documentation
- [x] Redeployed with new configuration

## What You Need to Do Now 👇

### 1️⃣ Add Domain in Netlify (2 minutes)
1. Go to: https://app.netlify.com/sites/throp/domain-management
2. Click **"Add a domain"** button
3. Type: `chat.throp.ai`
4. Click **"Verify"**
5. Click **"Add domain"**

### 2️⃣ Configure DNS in Your Domain Provider (5 minutes)

You need to add ONE record in your DNS provider (where you bought throp.ai):

```
Type:  CNAME
Name:  chat
Value: throp.netlify.app
TTL:   3600 (or Auto)
```

#### If your domain is with **Cloudflare**:
1. Login to Cloudflare dashboard
2. Select `throp.ai` domain
3. Go to **DNS** → **Records**
4. Click **"Add record"**
5. Set:
   - Type: `CNAME`
   - Name: `chat`
   - Target: `throp.netlify.app`
   - Proxy status: **DNS only** (grey cloud, not orange)
6. Save

#### If your domain is with **Namecheap**:
1. Sign in → Domain List → Manage (next to throp.ai)
2. Go to **Advanced DNS** tab
3. Click **"Add New Record"**
4. Set:
   - Type: `CNAME Record`
   - Host: `chat`
   - Value: `throp.netlify.app`
   - TTL: Automatic
5. Save

#### If your domain is with **GoDaddy**:
1. My Products → DNS (next to throp.ai)
2. Add → CNAME
3. Name: `chat`
4. Value: `throp.netlify.app`
5. Save

### 3️⃣ Wait for DNS & SSL (5-15 minutes)
- DNS propagation: 5-30 minutes
- SSL certificate: Automatically provisioned by Netlify

### 4️⃣ Test Your Domain

Once setup is complete, test:

```bash
# Quick test
curl -I https://chat.throp.ai

# Check DNS
nslookup chat.throp.ai

# Or just visit in browser
open https://chat.throp.ai
```

## 🚨 Important Notes

1. **Current Status**: Site is live at `https://throp.netlify.app`
2. **After DNS Setup**: Will be accessible at `https://chat.throp.ai`
3. **Both URLs will work**: The Netlify URL will continue to work as a backup

## Quick Commands

Check domain status:
```bash
# See if DNS is configured
dig chat.throp.ai +short

# Should return: throp.netlify.app
```

Force redeploy if needed:
```bash
netlify deploy --prod
```

## Timeline
- **0-5 min**: Add domain in Netlify + DNS setup
- **5-30 min**: DNS propagation
- **10-15 min**: SSL certificate provisioning
- **Total**: Usually working within 30 minutes

## Need Help?

- Netlify Support: https://www.netlify.com/support/
- DNS Checker: https://dnschecker.org/#CNAME/chat.throp.ai
- Your current site: https://throp.netlify.app (working now)
- Future site: https://chat.throp.ai (after DNS setup)

---

**Remember**: The ONLY thing you need to do is:
1. Add domain in Netlify dashboard
2. Add CNAME record in your DNS provider
3. Wait ~15 minutes

That's it! 🚀
