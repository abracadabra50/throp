# Twitter Mentions Fix Guide

## Current Issue
The bot is getting 401 errors when trying to fetch mentions because:
1. The `userMentionTimeline` API requires OAuth 2.0 user context
2. We need to ensure the correct bot user ID is being used

## How to Fix

### 1. Get Your Bot's User ID
Run this command to get your bot's user ID:
```bash
curl -X GET "https://api.twitter.com/2/users/by/username/askthrop" \
  -H "Authorization: Bearer YOUR_BEARER_TOKEN"
```

### 2. Set the Bot User ID in Railway
Add this environment variable in Railway:
```
TWITTER_BOT_USER_ID=your_bot_user_id_here
```

### 3. Alternative: Use Search API Instead
For basic plan, using the search API might be more reliable:
- Search for "@askthrop" mentions
- Track which tweets we've already responded to
- This avoids the user timeline API limitations

## Current Twitter Authentication
The bot is using OAuth 1.0a (app-only auth) which works for:
- ✅ Posting tweets
- ✅ Searching tweets
- ❌ User mention timeline (requires user context)

## Testing Mentions
1. **Manual Check**: Tweet "@askthrop test message"
2. **Monitor Logs**: Check Railway logs for mention processing
3. **Use Search Instead**: The bot can search for "@askthrop" which works with basic auth

## Implementation Status
- ✅ Claude model updated to `claude-sonnet-4-20250514`
- ✅ Perplexity working with correct model
- ✅ Frontend chat fully functional
- ⚠️ Twitter mentions need user ID configuration
