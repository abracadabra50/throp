# Quote Tweet Monitor

Throp can automatically monitor specific Twitter accounts and quote tweet them with chaotic reactions. Perfect for engagement farming and staying relevant in the conversation.

## Features

- 🔄 **Automatic Monitoring**: Watches specified accounts for new tweets
- 🎯 **Smart Filtering**: Only quotes tweets above engagement thresholds
- 🔥 **Claude-Powered Reactions**: Uses Claude Sonnet 4 for witty, contextual responses
- ⏰ **Rate Limiting**: Prevents spam with configurable hourly limits
- 🎮 **Keyword Filtering**: Target specific topics from monitored accounts
- 🧪 **Test Mode**: Preview reactions without actually posting

## Quick Start

### Monitor Default Accounts
```bash
npm run monitor
```

### Test Mode (No Posting)
```bash
npm run monitor:test
```

### Monitor Specific Accounts
```bash
npm run monitor -- elonmusk naval VitalikButerin
```

### With Custom Settings
```bash
npm run monitor -- --interval 10 --min-engagement 1000 --keywords "crypto" "ai"
```

## Configuration

Edit `config/quote-targets.json` to customize monitored accounts:

```json
{
  "accounts": [
    {
      "username": "elonmusk",
      "keywords": ["tesla", "spacex", "twitter"],
      "minEngagement": 10000,
      "description": "Elon's main - high engagement only"
    }
  ],
  "globalSettings": {
    "checkInterval": 300000,        // 5 minutes in ms
    "maxQuotesPerHour": 5,          // Rate limit
    "defaultMinEngagement": 100,     // Minimum likes+RTs
    "blacklistWords": ["giveaway"]  // Skip these
  }
}
```

## CLI Options

| Flag | Description | Default |
|------|-------------|---------|
| `--interval, -i` | Check interval (minutes) | 5 |
| `--min-engagement, -e` | Minimum likes+RTs to quote | 100 |
| `--max-per-hour, -m` | Max quotes per hour | 5 |
| `--keywords, -k` | Filter by keywords | None |
| `--test, -t` | Test mode (no posting) | false |

## How It Works

1. **Fetches Recent Tweets**: Checks monitored accounts every interval
2. **Filters Tweets**: 
   - Skips already quoted tweets
   - Checks engagement threshold
   - Validates keywords (if configured)
   - Ensures tweet is recent (< 2 hours old)
3. **Generates Reaction**: Claude creates a sarcastic/witty response
4. **Posts Quote Tweet**: Publishes with proper rate limiting
5. **Caches**: Remembers quoted tweets to avoid duplicates

## Reaction Examples

Original: "We're building the future of finance with blockchain"
> Throp: "wow another company solving problems that don't exist with slow databases, groundbreaking"

Original: "AI will replace all jobs by 2030"
> Throp: "cool story bro, my printer still can't connect to wifi but sure ai will do everything"

Original: "Bitcoin is going to $1 million"
> Throp: "source: the voices in your head and a youtube thumbnail probably"

## Safety Features

- **Rate Limiting**: Max 5 quotes per hour (configurable)
- **Engagement Threshold**: Only quotes popular tweets
- **Blacklist Words**: Skips giveaways and spam
- **Cache Memory**: Never quotes the same tweet twice
- **30s Cooldown**: Between consecutive quotes

## Integration with Main Bot

The quote monitor can run alongside the main Throp bot:

```bash
# Terminal 1: Run main bot
npm run dev

# Terminal 2: Run quote monitor
npm run monitor

# Terminal 3: Run API server
npm run dev:api
```

## Troubleshooting

### Not Quoting Anything?
- Check engagement thresholds - might be too high
- Verify accounts exist and are public
- Ensure tweets are recent (< 2 hours)
- Check rate limits haven't been hit

### Too Many Quotes?
- Increase `minEngagement` threshold
- Decrease `maxQuotesPerHour`
- Add more specific keywords

### Test First!
Always run in test mode first to see what would be quoted:
```bash
npm run monitor:test -- elonmusk --min-engagement 50000
```

## Best Practices

1. **Start Conservative**: High engagement thresholds, low hourly limits
2. **Target Quality**: Better to quote 1 banger than 5 mid tweets
3. **Use Keywords**: Filter for relevant topics
4. **Monitor Performance**: Track which quotes get engagement
5. **Adjust Dynamically**: Update thresholds based on results

## Coming Soon

- [ ] Sentiment-based reactions (different vibes for different moods)
- [ ] Thread support (quote threading entire conversations)
- [ ] Engagement tracking (learn what works)
- [ ] Auto-adjustment of thresholds
- [ ] Discord/Telegram notifications when quoting
