# 🚨 IMMEDIATE ACTION REQUIRED

## Add this to Railway Environment Variables NOW:

```
PERPLEXITY_MODEL=sonar-small-chat
```

## Steps:
1. Go to Railway Dashboard
2. Click your service (throp gh)
3. Go to **Variables** tab
4. Click **+ New Variable**
5. Add:
   - Name: `PERPLEXITY_MODEL`
   - Value: `sonar-small-chat`
6. Railway will auto-redeploy

## Why This Happened:
- The model name `llama-3.1-sonar-small-128k-online` is INVALID
- Perplexity changed their model names
- The correct model is `sonar-small-chat`

## After Adding the Variable:
Railway will redeploy automatically. In 2-3 minutes, your chat will work!

## Test It:
```bash
curl -X POST https://throp-gh-production.up.railway.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "hello"}' | jq '.'
```

Should return a successful response!
