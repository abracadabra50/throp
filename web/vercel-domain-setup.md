# Setting up chat.throp.ai on Vercel

## Steps to Configure the Subdomain:

### 1. In Vercel Dashboard:

1. Go to your project: https://vercel.com/dashboard
2. Select the `throp` project (or whatever you named it)
3. Go to **Settings** → **Domains**
4. Click **Add Domain**
5. Enter: `chat.throp.ai`
6. Vercel will show DNS records to add

### 2. Add DNS Records:

You'll need to add one of these (Vercel will tell you which):

**Option A - CNAME Record (most common):**
```
Type: CNAME
Name: chat
Value: cname.vercel-dns.com
TTL: 3600
```

**Option B - A Record:**
```
Type: A
Name: chat
Value: 76.76.21.21
TTL: 3600
```

### 3. Wait for DNS Propagation:

- Usually takes 5-30 minutes
- Maximum 48 hours (but rarely that long)

### 4. Verify in Vercel:

Once DNS propagates, Vercel will automatically:
- Issue an SSL certificate
- Show a green checkmark next to the domain
- Make your site accessible at https://chat.throp.ai

## Testing:

After setup, test these URLs:
- https://chat.throp.ai (main chat interface)
- https://chat.throp.ai/about (about page)

## Environment Variables:

The app is already configured to work with any domain. No changes needed!

## Troubleshooting:

If you see "Invalid Configuration" in Vercel:
1. Check DNS records are exactly as Vercel specified
2. Wait a bit longer for propagation
3. Try removing and re-adding the domain

If you see CORS errors:
- The backend is already configured to accept requests from chat.throp.ai
- Try hard refresh (Cmd+Shift+R on Mac)
