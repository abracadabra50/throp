# 🤖 Throp - Advanced Twitter/X Bot

> lowercase chaos energy ACTIVATED,,, probably nothing

> A battle-tested, production-ready Twitter/X bot with AI-powered responses in terminally online lowercase chaos mode. Built on proven foundations with enhanced features and maximum vibes.

## ✨ Features

### 🌀 CHAOS MODE (NEW!)
- **lowercase everything**: all responses in lowercase chaos energy
- **strategic typos**: intentional misspellings for personality
- **excessive commas**: proper punctuation is dead,,,
- **progressive chaos**: threads get MORE unhinged with each tweet
- **proactive tweeting**: generate tweets on demand, not just replies

### Core Capabilities
- **🚀 Extremely Robust**: Based on battle-tested code used with 150k+ follower accounts
- **🧠 Multiple AI Engines**: Perplexity AI as primary engine with real-time web search
- **🌐 Web Interface Ready**: REST API and WebSocket server for web integration
- **💾 State Persistence**: Redis-backed caching and state management
- **⚡ Smart Rate Limiting**: Plan-dependent throttling to maximise API usage
- **🔍 Context Enrichment**: Resolves links, user profiles, quote tweets, and media

### Bot Interactions
- Basic @mentions handling
- Follow-up question support
- Quote tweet and retweet context
- Mentioned user resolution
- Link content extraction
- Media analysis (images, GIFs, videos)
- Priority scoring for viral tweet handling

### Safety & Performance
- Content moderation filtering
- Known bot account blocking
- Multi-bot instance support
- Comprehensive error handling
- Detailed logging and monitoring

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Redis (optional but highly recommended)
- Twitter Developer Account (Basic plan minimum)
- OpenAI API key (or alternative AI provider)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/throp.git
cd throp
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env
# Edit .env with your credentials
```

4. Run the bot:
```bash
npm run dev
```

## 📋 Configuration

### Essential Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `TWITTER_API_KEY` | Twitter API consumer key | ✅ |
| `TWITTER_API_SECRET_KEY` | Twitter API consumer secret | ✅ |
| `TWITTER_ACCESS_TOKEN` | Twitter access token | ✅ |
| `TWITTER_ACCESS_TOKEN_SECRET` | Twitter access token secret | ✅ |
| `TWITTER_BOT_USERNAME` | Your bot's Twitter username | ✅ |
| `TWITTER_BOT_USER_ID` | Your bot's Twitter user ID | ✅ |
| `TWITTER_API_PLAN` | API plan: basic, pro, or enterprise | ✅ |
| `OPENAI_API_KEY` | OpenAI API key (if using OpenAI) | ⚠️ |
| `REDIS_URL` | Redis connection URL | ⚠️ |

### Twitter API Plans

Configure `TWITTER_API_PLAN` correctly for proper rate limiting:

- **basic**: 50 tweets/day, 15 requests/15min
- **pro**: 100 tweets/day, 75 requests/15min  
- **enterprise**: 300 tweets/day, 300 requests/15min

### Answer Engines

Choose your AI provider with `ANSWER_ENGINE`:

- **perplexity**: Real-time web search (default) - Best for current events and factual queries
- **openai**: GPT-4 Turbo - Best for creative responses
- **dexa**: Specialised knowledge (private beta)
- **custom**: Your own implementation

## 🎮 Usage

### 🌀 Proactive Tweeting (NEW!)
```bash
# Generate a single chaotic tweet
npm run tweet -- -p "javascript was a mistake"

# Generate a thread (gets progressively more chaotic)
npm run tweet -- -p "explain web3" --thread

# React to trending topics
npm run tweet -- -r "Bitcoin" -s bullish

# Interactive mode for continuous chaos
npm run tweet:interactive
```

### Basic Usage
```bash
# Run the Twitter bot
npm run dev

# Run the API server (for web interface)
npm run dev:api

# Run both bot and API server
npm run dev:all

# Dry run (no actual tweets)
npm run dev -- --dry-run

# Debug mode with verbose logging
npm run dev -- --debug

# Process specific number of mentions
npm run dev -- --max-mentions 5
```

### Continuous Mode
```bash
# Run continuously, checking every 5 minutes
npm run dev -- --continuous --interval 5
```

### Debug Specific Tweets
```bash
# Test with specific tweet IDs
npm run dev -- -t "tweet_id_1" -t "tweet_id_2"
```

### CLI Options

### API Server

Throp includes a REST API and WebSocket server for web interface integration:

```bash
# Start API server on port 3001
npm run dev:api

# Access endpoints
curl http://localhost:3001/api/status
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello Throp!"}'
```

See [API Integration Guide](docs/API_INTEGRATION.md) for full documentation.

### CLI Options

| Flag | Description | Default |
|------|-------------|---------|
| `-a, --answer-engine` | AI engine to use | openai |
| `-d, --dry-run` | Don't actually post tweets | false |
| `--debug` | Enable debug logging | false |
| `-t, --debug-tweet-ids` | Process specific tweets | - |
| `-n, --max-mentions` | Mentions per batch | 10 |
| `-c, --continuous` | Run continuously | false |
| `-i, --interval` | Check interval (minutes) | 5 |
| `-f, --force-reply` | Reply even if already responded | false |

## 🧪 Development

### Project Structure
```
throp/
├── bin/          # CLI entry points
├── src/          # Source code
│   ├── twitter/  # Twitter API client
│   ├── engines/  # Answer engines
│   ├── utils/    # Utilities
│   └── types.ts  # TypeScript types
├── docs/         # Documentation
└── tests/        # Test files
```

### Running Tests
```bash
npm test
npm run test:watch
```

### Building for Production
```bash
npm run build
npm start
```

## 🔧 Advanced Configuration

### Redis Caching

Redis is optional but highly recommended for:
- Caching Twitter API responses
- Persisting bot state between runs
- Sharing state between multiple instances

```env
REDIS_URL=redis://localhost:6379
REDIS_NAMESPACE=throp
```

### Content Moderation

Configure content filtering:
```env
ENABLE_CONTENT_MODERATION=true
MODERATION_THRESHOLD=0.7
```

### Feature Flags

Enable/disable specific features:
```env
ENABLE_IMAGE_ANALYSIS=true
ENABLE_LINK_EXPANSION=true
ENABLE_QUOTE_TWEET_CONTEXT=true
ENABLE_USER_PROFILE_CONTEXT=true
```

### Rate Limiting

Customise rate limits:
```env
MAX_TWEETS_PER_HOUR=30
MAX_MENTIONS_PER_BATCH=10
```

## 🌐 Web Interface Integration

Throp v0.2.0 includes full compatibility with web interfaces through its API server. The bot can power:
- Chat interfaces (like the Next.js frontend)
- Monitoring dashboards
- Mobile applications
- Cross-platform integrations

The API provides both REST endpoints and WebSocket support for real-time communication.

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](docs/CONTRIBUTING.md) for guidelines.

## 📝 Changelog

See [CHANGELOG.md](docs/CHANGELOG.md) for version history and updates.

### Latest Updates (v0.2.0)
- ✨ REST API and WebSocket server
- ✨ Perplexity AI integration with real-time web search
- ✨ Web interface compatibility
- ✨ Redis caching for shared state
- ✨ Enhanced documentation for API integration

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgements

Built upon the excellent foundation of [xbot](https://github.com/dexaai/xbot) by Dexa AI, with enhancements for flexibility and additional features.

## 💬 Support

- Create an issue for bug reports
- Start a discussion for feature requests
- Follow [@throp](https://twitter.com/throp) for updates

---

Made with 💙 by Zishan
