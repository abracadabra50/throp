# Twitter OAuth 2.0 Setup Guide

## Getting Your Bearer Token & Bot User ID

### 1. Generate Bearer Token

#### Option A: Using Twitter Developer Portal
1. Go to https://developer.twitter.com/en/portal/dashboard
2. Select your app
3. Navigate to "Keys and tokens"
4. Under "Bearer Token", click "Generate"
5. Copy the token immediately (you won't be able to see it again)

#### Option B: Using cURL
```bash
# Encode your API credentials
ENCODED=$(echo -n "$TWITTER_API_KEY:$TWITTER_API_SECRET_KEY" | base64)

# Request bearer token
curl -X POST "https://api.twitter.com/oauth2/token" \
  -H "Authorization: Basic $ENCODED" \
  -H "Content-Type: application/x-www-form-urlencoded;charset=UTF-8" \
  -d "grant_type=client_credentials"
```

### 2. Get Your Bot's User ID

```bash
# Replace YOUR_BEARER_TOKEN with your actual bearer token
curl -X GET "https://api.twitter.com/2/users/by/username/askthrop" \
  -H "Authorization: Bearer YOUR_BEARER_TOKEN"
```

This will return something like:
```json
{
  "data": {
    "id": "1234567890",
    "name": "Throp",
    "username": "askthrop"
  }
}
```

Copy the `id` value - that's your `TWITTER_BOT_USER_ID`.

### 3. Add to Railway Environment Variables

In your Railway dashboard, add these variables:
```env
TWITTER_BEARER_TOKEN=your_bearer_token_here
TWITTER_BOT_USER_ID=your_bot_user_id_here
```

## Why OAuth 2.0 is Better

- **Mentions API**: The `/2/users/{id}/mentions` endpoint works properly with Bearer tokens
- **Higher Rate Limits**: OAuth 2.0 often has better rate limits
- **User Context**: Can access user-specific endpoints like mentions timeline
- **More Robust**: Better error handling and cleaner API responses

## Testing the Setup

Once you've added the Bearer Token and Bot User ID:

1. Redeploy on Railway
2. Check the logs for "Twitter client initialized with Bearer Token (OAuth 2.0)"
3. Test mentions API:
```bash
curl "https://throp-gh-production.up.railway.app/api/mentions"
```

## Troubleshooting

### Still Getting 401 Errors?
- Ensure the Bearer Token is correctly set in Railway
- Check that the Bot User ID matches your bot's actual ID
- Verify the token hasn't expired or been revoked

### Rate Limits
- Basic plan: 15 requests per 15 minutes for mentions
- Monitor the `x-rate-limit-remaining` header in responses

### Need Both OAuth 1.0a and 2.0?
The bot now intelligently uses:
- OAuth 2.0 (Bearer Token) for reading mentions
- OAuth 1.0a for posting tweets (if Bearer Token not available)
