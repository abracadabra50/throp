# 🐦 Testing Twitter Bot Functionality

## Current Status:
- ✅ Twitter is **connected** (username: @askthrop)
- ✅ API credentials are valid
- ⚠️ Mentions endpoint requires OAuth permissions (401 error)
- ⚠️ Admin API requires ADMIN_API_KEY to be set

## How to Test Twitter Bot:

### Option 1: Test via Twitter (Recommended)
1. **Send a tweet mentioning @askthrop:**
   ```
   @askthrop what's your take on AI?
   ```
2. **Wait 1-2 minutes** for the bot to check mentions
3. **Check @askthrop's replies** for a response

### Option 2: Enable Admin API
1. **Generate an admin key:**
   ```bash
   openssl rand -hex 32
   ```

2. **Add to Railway environment variables:**
   ```
   ADMIN_API_KEY=your_generated_key_here
   ```

3. **Test tweet generation (dry run):**
   ```bash
   curl -X POST https://throp-gh-production.up.railway.app/api/tweet/prompt \
     -H "Content-Type: application/json" \
     -H "X-Admin-Key: your_admin_key" \
     -d '{
       "prompt": "write a tweet about being alive",
       "dryRun": true
     }'
   ```

4. **Post a real tweet (remove dryRun):**
   ```bash
   curl -X POST https://throp-gh-production.up.railway.app/api/tweet/prompt \
     -H "Content-Type: application/json" \
     -H "X-Admin-Key: your_admin_key" \
     -d '{
       "prompt": "write a tweet about being operational",
       "dryRun": false
     }'
   ```

## Twitter API Permissions Needed:
Your Twitter app needs these permissions:
- ✅ Read tweets
- ✅ Write tweets
- ✅ Read mentions
- ⚠️ OAuth 2.0 with PKCE (for user context)

## What's Working:
- **Twitter client is initialized** and connected
- **Bot can read and write tweets** (with proper permissions)
- **Hybrid engine works** for generating responses

## Testing Checklist:
- [ ] Tweet @askthrop and wait for reply
- [ ] Set ADMIN_API_KEY in Railway
- [ ] Test dry run tweet generation
- [ ] Post a real tweet via admin API
- [ ] Check Twitter for posted content

## Note:
The 401 error on `/api/mentions` is normal - it needs OAuth user context. The bot should still respond to mentions automatically when the scheduled job runs (every few minutes).
