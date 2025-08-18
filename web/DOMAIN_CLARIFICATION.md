# Domain Setup Clarification

## Current Situation
Both `throp.ai` and `chat.throp.ai` are pointing to the same Netlify app, which means they show the same content.

## What You Want
- **throp.ai** → Main landing/marketing page
- **chat.throp.ai** → The actual chat interface

## Options to Achieve This

### Option 1: Domain-Based Routing (Recommended)
Keep everything in one app but show different content based on the domain:

1. We can detect the domain in the app
2. Show landing page for `throp.ai`
3. Show chat directly for `chat.throp.ai`

**Implementation**: I can add code to detect the domain and route accordingly.

### Option 2: Separate Apps
Deploy two different apps:

1. **Landing page** on `throp.ai` (could be a simple static page)
2. **Chat app** on `chat.throp.ai` (current app)

**Pros**: Clean separation
**Cons**: Need to maintain two deployments

### Option 3: Redirect Setup
Keep the current app on `chat.throp.ai` and create a simple landing page elsewhere for `throp.ai` that redirects or links to chat.

## Current DNS Status

```
throp.ai → Points to Vercel (64.29.17.1)
chat.throp.ai → Points to Vercel (c3e21c5d635f7780.vercel-dns-017.com)
```

Both need to be updated to point to Netlify if you want to use them.

## Quick Fix for Now

Since you're on Netlify, the easiest immediate solution:

1. **Update DNS for chat.throp.ai**:
   - Change CNAME from: `c3e21c5d635f7780.vercel-dns-017.com`
   - To: `throp.netlify.app`

2. **Keep throp.ai separate** (for now):
   - Could point to a simple landing page
   - Or redirect to chat.throp.ai

## Recommended Next Steps

1. Fix the logo issue (already done with config change)
2. Deploy the fix
3. Update DNS for `chat.throp.ai` to point to Netlify
4. Decide on landing page strategy for `throp.ai`

Would you like me to:
- A) Implement domain-based routing (show different content based on domain)
- B) Create a simple landing page for throp.ai
- C) Just fix chat.throp.ai for now
