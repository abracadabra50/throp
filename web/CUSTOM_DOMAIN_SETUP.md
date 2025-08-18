# Setting up chat.throp.ai Custom Domain

## Step 1: Add Domain in Netlify

1. Go to your Netlify dashboard: https://app.netlify.com/sites/throp/domain-management
2. Click **"Add a domain"**
3. Enter: `chat.throp.ai`
4. Click **"Verify"**
5. Click **"Add domain"**

## Step 2: Configure DNS Records

You need to add these DNS records in your domain provider (where you bought throp.ai):

### Option A: Using CNAME (Recommended for subdomains)
```
Type: CNAME
Name: chat
Value: throp.netlify.app
TTL: 3600 (or Auto)
```

### Option B: Using Netlify's Load Balancer (Alternative)
```
Type: A
Name: chat
Value: 75.2.60.5
TTL: 3600
```

## Step 3: Popular DNS Provider Instructions

### Cloudflare
1. Log into Cloudflare
2. Select your domain (throp.ai)
3. Go to DNS → Records
4. Click "Add record"
5. Type: CNAME
6. Name: chat
7. Target: throp.netlify.app
8. Proxy status: DNS only (grey cloud)
9. Save

### Namecheap
1. Sign in to Namecheap
2. Domain List → Manage (next to throp.ai)
3. Advanced DNS tab
4. Add New Record
5. Type: CNAME Record
6. Host: chat
7. Value: throp.netlify.app
8. TTL: Automatic
9. Save

### GoDaddy
1. Sign in to GoDaddy
2. My Products → DNS (next to throp.ai)
3. Add → CNAME
4. Name: chat
5. Value: throp.netlify.app
6. TTL: 1 hour
7. Save

### Google Domains / Squarespace Domains
1. Sign in to your account
2. Select throp.ai
3. DNS → Manage custom records
4. Create new record
5. Type: CNAME
6. Host name: chat
7. Data: throp.netlify.app
8. TTL: 1 hour

## Step 4: Wait for SSL Certificate

After adding the domain and configuring DNS:
1. Netlify will automatically provision an SSL certificate
2. This usually takes 5-15 minutes
3. You'll see a green checkmark ✅ next to your domain when ready

## Step 5: Update Environment Variables

Once the domain is active, update your environment variable:

els like the ```bash
netlify env:set NEXT_PUBLIC_BASE_URL "https://chat.throp.ai" --force
```

Or update in Netlify Dashboard:
1. Go to Site configuration → Environment variables
2. Edit `NEXT_PUBLIC_BASE_URL`
3. Change value to: `https://chat.throp.ai`
4. Save

## Step 6: Redeploy

After updating the environment variable:

```bash
netlify deploy --prod
```

Or trigger a redeploy from the Netlify dashboard.

## Step 7: Verify

Check that everything works:
1. Visit https://chat.throp.ai
2. Test the chat functionality
3. Check hot takes are loading
4. Verify social sharing previews show the correct URL

## Troubleshooting

### "DNS verification failed"
- Make sure you added the CNAME record correctly
- DNS changes can take up to 48 hours to propagate (usually much faster)
- Try using a DNS checker: https://dnschecker.org

### "SSL certificate pending"
- This is normal, wait 10-15 minutes
- If it takes longer than an hour, contact Netlify support

### Site not loading after setup
- Check DNS propagation: `nslookup chat.throp.ai`
- Verify CNAME points to: `throp.netlify.app`
- Clear browser cache and try again

## Status Check Commands

Check DNS from terminal:
```bash
# Check if DNS is configured
dig chat.throp.ai

# Check CNAME record
nslookup chat.throp.ai

# Test the site
curl -I https://chat.throp.ai
```

## Quick Reference

- **Custom domain**: chat.throp.ai
- **Points to**: throp.netlify.app
- **SSL**: Automatic via Let's Encrypt
- **Time to activate**: Usually 5-30 minutes after DNS setup
