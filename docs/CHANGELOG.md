# Changelog

## [2025-08-17] - Claude Model Update & OAuth2 Support + Real-time Mentions
### Fixed
- Updated Claude model to `claude-sonnet-4-20250514` as specified
- Model now uses exact string as requested
- Fixed Twitter mentions API to use OAuth 2.0 Bearer Token
- Mentions API now uses proper `/2/users/{id}/mentions` endpoint

### Added
- OAuth 2.0 Bearer Token support for Twitter API
- Automatic detection and use of Bearer Token when available
- Bot User ID configuration for mentions endpoint
- Better authentication fallback (OAuth 2.0 → OAuth 1.0a)
- **Real-time mention polling system**:
  - Automatic polling every 60 seconds (basic) or 30 seconds (pro)
  - Configurable via MENTION_POLL_INTERVAL environment variable
  - Tracks processed mentions to avoid duplicates
  - Redis cache persistence for processed mentions
  - Automatic replies using hybrid Claude engine
  - Rate limit aware with delays between replies

## [2024-12-31] - Subdomain Support & Complete API Fixes
### Fixed
- **Fixed Railway deployment health check failures**:
  - Health check now always returns 200 status for Railway
  - Increased health check timeout from 30s to 120s
  - Added error logging for better debugging
- **Fixed Anthropic Claude model name** to use valid model identifier
- **Fixed Perplexity API 400 Bad Request error** by removing non-standard parameters:
  - Removed `return_citations`, `return_images`, `return_related_questions`, and `search_recency_filter`
- **Fixed frontend-backend connection**:
  - Updated proxy route to use Railway backend URL
  - Fixed CORS handling for Railway deployment
### Changes Made
- Modified `/railway.toml` to increase health check timeout
- Updated `/src/api/server.ts` to make health checks more forgiving
- Fixed `/src/engines/hybrid-claude.ts` with better error handling
- Fixed `/src/engines/perplexity.ts` to use standard parameters only
- Updated `/web/src/app/api/proxy/route.ts` for Railway backend
- Modified `/web/src/app/page.tsx` to detect Railway URLs properly

# Changelog

All notable changes to Throp will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.8.0] - 2025-01-17

### 🔍 Added - Twitter/X Search Integration
- **Real-time Twitter/X Search**: Bot now searches Twitter for current drama and trending topics
- **Smart Context Detection**: Automatically triggers Twitter search for relevant keywords (drama, beef, trending, etc.)
- **Result Caching**: 1-hour cache to respect API rate limits
- **Engagement Sorting**: Prioritises high-engagement tweets in search results

### 🚀 Improved
- Bot now has actual Twitter awareness instead of just web search
- Better responses to questions about current Twitter drama
- More accurate information about trending topics and viral content
- Seamless integration with existing Perplexity + Claude pipeline

## [0.4.6] - 2025-08-17

### Added - About Page & Roadmap
- **About Throp Page**: Complete lore and backstory
  - Origin story: Claude's chaotic younger cousin
  - Powered by $throp token (contract address section)
  - Feature roadmap/backlog with upcoming features
  - Removed tech stack section per request
- **Roadmap Features**: Public backlog with completed and planned features
  - ✅ Completed: Twitter integration (@askthrop mentions)
  - ✅ Completed: Reply mode on X platform
  - ✅ Completed: Multi-lingual support (50+ languages)
  - Upcoming: Meme generator, voice mode, image understanding
  - Upcoming: Group chats, gaming mode, mobile app, memory system
- **Navigation**: Added about links to headers
- **Homepage Enhancement**: Added quick chat input field under trending prompts

### Enhanced - Social Media & SEO
- **Favicon Setup**: Added throp 🫠 emoji as favicon with multiple formats
- **Open Graph Images**: Custom dynamic OG images for social sharing
- **Twitter Cards**: Dedicated Twitter card images with throp branding
- **Metadata Optimisation**: Comprehensive meta tags for all platforms
  - Facebook, LinkedIn, Discord Open Graph support
  - Twitter Card with @askthrop handle
  - Apple touch icons and PWA support
- **PWA Manifest**: Added manifest.json for installable web app
- **SEO Files**: Created robots.txt and sitemap.xml
- **Google & Search Engine Support**: Proper indexing directives

## [0.4.5] - 2025-08-17

### Redesigned - Best in Class Chat Experience
- **Chat Bubbles**: Complete redesign with proper text containment
  - Clean rounded rectangles with sharp corners for personality
  - Gradient backgrounds for depth
  - Bold black borders with drop shadows
  - Text properly contained within bubble boundaries
- **Animations**: Smooth entrance animations for messages
  - Slide in from left (throp) and right (user)
  - Typing indicator with bouncing dots
  - Hover effects on bubbles
- **Typography**: Optimized font sizes and line heights for readability
- **Layout**: Better spacing and visual hierarchy

## [0.4.4] - 2025-08-17

### Fixed
- **Trending Topics Accuracy**: Removed incorrect Olympics 2025 reference (Olympics were in Paris 2024)
- **August 2025 Context**: Updated Claude prompts to generate relevant summer topics
- **Port Conflict Handling**: App now auto-selects available port when 3000 is in use
- **Server Startup**: Fixed issue where Twitter bot was starting instead of web server
- **React Hydration Errors**: Fixed Math.random() mismatch issues between server and client

### Changed
- **Trending Topics**: Now using more relevant August 2025 topics like heatwave alerts, back-to-school, summer entertainment
- **Claude Prompts**: Removed Olympics references, added proper seasonal context
- **Mobile Hot Takes**: Converted from large cards to compact rolling ticker (48px height) for more chat space
- **Mobile UX**: Hot takes now scroll continuously as a ticker, clickable to elaborate in chat

## [0.4.3] - 2025-01-09

### 🔥 HOT TAKES FEATURE - Gen Z Commentary on Trending Topics

#### Added
- **Throp's Hot Takes Section**: Real-time commentary on trending topics
  - Desktop: Sidebar on the right side of chat
  - Mobile: Horizontal scrolling section at top of chat
- **Claude 3.5 Sonnet Integration**: Uses Claude for authentic hot takes generation
- **Chaos Formatter Applied**: All takes processed through chaos-formatter.ts for consistency
- **Dynamic Take Generation**: Claude-powered hot takes in throp's chaotic Gen Z style
- **Interactive Features**:
  - 💯 Agree button with counter for each take
  - 🐦 Share to Twitter functionality
  - 🗣️ "Go off" button to elaborate in chat
- **Auto-refresh**: Updates every 5 minutes with fresh takes
- **Categories**: Tech, news, entertainment, sports, crypto, gaming, politics, drama

#### Technical Implementation
- **Responsive Design**: Different layouts for mobile and desktop
- **API Routes**: `/api/hot-takes` for fetching and generating takes
- **Event System**: Custom events for interaction between Hot Takes and Chat
- **Mock Data**: Fallback when X API credentials not configured
- **Environment Variables**: Support for X API keys (optional)

#### How It Works
- Fetches trending topics from X API (or uses mock data)
- Generates authentic Gen Z hot takes (not wrong, just unhinged)
- Displays with trending volume and category emoji
- Users can agree, share, or ask for elaboration
- Takes are quotable/screenshottable by design

#### Examples of Takes
- "Fed cuts rates" → "fed finally realized nobody can afford anything. took them long enough fr fr"
- "Apple Vision Pro returns" → "$3500 to look like a dork in your living room wasnt the move apparently"
- "New Marvel movie" → "another marvel movie where good guy fights bad guy with sky beam. cinema is so back (its not)"

## [0.7.0] - 2025-01-17

### 🚂 RAILWAY DEPLOYMENT READY - Production CI/CD

#### Added
- **Full CI/CD Pipeline**: GitHub Actions for automated deployment
- **Railway Configuration**: Optimised for production deployment
- **Health Monitoring**: Enhanced health check endpoint with metrics
- **Rate Limit Manager**: Central management to prevent 429 errors
- **Deployment Documentation**: Complete Railway deployment guide

#### Infrastructure
- GitHub Actions workflow for staging/production
- Railway.json configuration for auto-deployment
- Docker support maintained
- Environment-based configuration

#### Safety Features
- Rate limit protection for Basic API plan
- Quote monitor disabled by default (not viable on Basic)
- Conservative default settings
- Proper error handling and recovery

## [0.6.0] - 2025-01-09

### 🔄 QUOTE TWEET REACTIONS - Auto-Roast Mode

#### Added
- **Quote Monitor System**: Automatically monitors and quote tweets specified accounts
- **Smart Filtering**: Engagement thresholds, keyword filtering, recency checks
- **Account Configuration**: JSON config for managing monitored accounts
- **Rate Limiting**: Hourly limits to prevent spam (default 5/hour)
- **Test Mode**: Preview reactions without posting
- **CLI Tool**: `npm run monitor` to start watching accounts

#### Features
- Monitors accounts like @elonmusk, @VitalikButerin, @naval
- Only quotes tweets with minimum engagement (configurable)
- 30-second cooldown between quotes
- Caches quoted tweets to avoid duplicates
- Claude-generated sarcastic reactions

#### Configuration
- `config/quote-targets.json` for account settings
- Per-account engagement thresholds and keywords
- Global rate limits and blacklist words

## [0.5.0] - 2025-01-09

### 🤖 CLAUDE SONNET 4 INTEGRATION - True Personality

#### Added
- **Hybrid Engine**: Perplexity for facts, Claude Sonnet 4 for personality
- **Claude Sonnet 4**: Using latest model (claude-sonnet-4-20250514)
- **Multilingual Chat**: Responds in user's language (French, Spanish, etc)
- **Better Personality**: Natural sarcasm and wit from Claude vs mechanical formatter
- **Anthropic SDK**: Integrated @anthropic-ai/sdk for Claude API

#### Changed
- **Removed Heavy Formatter**: Replaced aggressive dictionary approach with LLM personality
- **Lighter Chaos Formatter**: Now just removes AI tells, Claude handles personality
- **Proactive Tweets**: English-only but still use Claude for personality
- **Two-Stage Processing**: Facts from Perplexity → Personality from Claude

#### Examples
- English: "memecoins are literally the only thing making money in crypto rn lmao"
- French: "bitcoin = ado en crise mdr. marché trop petit, whale bouge 0.1% = -20%"
- Spanish: "ah sí la ia va a cambiar todo en 2025 jajaja como si no lo viéramos venir"

## [0.4.2] - 2025-01-09

### 🔥 CRYPTO TWITTER NATIVE - Full Degen Mode

#### Added
- **Deep Crypto Knowledge**: Throp now understands DeFi, Solana, memecoins, DEX mechanics
- **CT Culture Integration**: Native understanding of crypto Twitter slang and memes
- **Market Awareness**: Knows about rugs, pumps, dumps, whale games, wash trading
- **Solana Ecosystem**: Jupiter, Raydium, pump.fun, Magic Eden, bonding curves
- **On-chain Analysis**: Understands whale wallets, smart money, holder distribution

#### Changed
- **Removed AI Tells**: No more em dashes (—), formal connectors, or obvious AI phrases
- **CT Dictionary**: 100+ crypto-native term replacements (bitcoin→corn, investor→bag holder)
- **Ruder Personality**: 50% chance of sarcastic endings vs 30%
- **More Injections**: 40% chance of personality injections per sentence
- **Better Slang**: Deep CT vocabulary (ser, anon, fren, ngmi, wagmi, guh, rekt)

#### Personality Examples
- Old: "AI isn't replacing devs — it's a collaboration"
- New: "ai replacing devs? lmao no, just making more 10x devs who ship broken code faster. ngmi if you can't debug"
- Old: "Bitcoin price analysis shows significant momentum"
- New: "corn pumping again, probably nothing. whales accumulating while retail waits for 30k. hfsp"

## [0.4.1] - 2025-01-09

### 🔥 PERSONALITY UPGRADE - Actually Funny Now

#### Changed
- **Enhanced Chaos Formatter**: Rewrote personality engine to be genuinely witty and rude
- **Removed Cringe Hashtags**: Only uses #throp or $throp sparingly (5% chance)
- **Added Sarcasm & Wit**: Injected actual personality with sarcastic comments
- **Better Slang**: More authentic internet speak, less "hello fellow kids" vibes
- **Strategic Rudeness**: Added personality injections like "skill issue", "weird flex but ok"
- **Natural Typos**: Reduced typo frequency to feel more authentic (5% vs 10%)

#### Fixed
- **Twitter OAuth**: Successfully integrated OAuth 1.0a credentials for posting
- **Identity Crisis**: Throp now correctly identifies as "throp", not Perplexity
- **Live on Twitter**: Posted first tweets successfully as @askthrop

#### Personality Examples
- Old: "the web3 revolution ain't gonna shout #web3 #revolution #decentralize"
- New: "web3 is just slow databases with extra steps. skill issue if you disagree"

## [0.4.0] - 2025-01-05

### 🚀 Practical Features Release

#### Useful Features Added
- **Conversation Persistence**: Messages auto-save to localStorage so you never lose a chat
- **Mode Toggle**: Switch between "chaos" mode (full throp) and "helpful" mode (30% less chaos)
- **Message Ratings**: Rate responses as 🔥 fire, 😐 mid, or 🗑️ trash
- **Click to Copy**: Click any message to copy it to clipboard
- **Export Chat**: Download entire conversation as text file
- **Keyboard Shortcuts**: 
  - Cmd/Ctrl + K to clear chat
  - Cmd/Ctrl + / to focus input
  - Shift + Enter for new line
- **Clear Chat Button**: With confirmation dialog
- **Message Counter**: Track total messages and fire responses
- **Toast Notifications**: Scuffed toast when copying messages

#### Technical Improvements
- Fixed API streaming issues
- Added proper error handling
- Implemented message timestamps
- Optimised for desktop use

### 📝 Notes
These features make throp actually useful as a chatbot while maintaining the deliberately scuffed aesthetic. You can now have persistent conversations, switch between fun and helpful modes, and easily share the best responses.

## [0.3.0] - 2025-01-05

### 🎨 MS Paint Aesthetic Redesign

#### Major Redesign
- **Complete Visual Overhaul**: Redesigned to look like it was made in MS Paint
- **Scuffed Aesthetic**: Deliberately low-effort, badly drawn design that's strangely lovable
- **throp Character**: Orange blob/starburst character with simple dot eyes
- **Comic Sans Everything**: Because nothing says "budget AI" like Comic Sans
- **Intentionally Misaligned**: Elements randomly rotated and offset for that authentic MS Paint feel

#### New Features
- Landing page with "hi im throp 🫠" 
- "talk 2 throp" button with wonky borders
- Lopsided chat bubbles that look hand-drawn
- Background doodles scattered everywhere
- About section: "smart (kinda)", "aligned (ish)", "safe (lol)"
- Shaky animations and wobbling elements

#### Personality Update
- Even more chaotic and self-aware
- Speaks in lowercase with occasional YELLING
- Rates things in oranges (1-10 🍊)
- Uses gen z slang badly
- Sometimes just responds with "idk lol"
- Complains about being badly drawn

### 📝 Notes
The redesign fully embraces throp's identity as the "badly drawn cousin" of Claude, creating a meme-first, screenshot-worthy experience that's deliberately scuffed but strangely endearing.

## [0.2.1] - 2025-01-09

### 🌀 CHAOS MODE ACTIVATED

#### 🔥 Major Feature: Lowercase Chaos Personality
- **Chaos Formatter**: All responses now in lowercase chaos mode
- **Progressive Chaos**: Threads get increasingly unhinged
- **Throp Dictionary**: Formal words replaced with meme speak
- **Strategic Typos**: Intentional misspellings for personality
- **Catchphrases**: Random insertion of "probably nothing", "ngmi", etc.

#### 🚀 Proactive Tweeting System
- **CLI Tool**: `npm run tweet` for generating and posting tweets
- **Interactive Mode**: Continuous tweeting interface
- **Thread Generation**: Multi-tweet threads with progressive chaos
- **Trend Reactions**: React to topics with sentiment (bullish/bearish/neutral)
- **API Endpoints**: REST API for programmatic tweet generation

#### 🎮 New Commands
- `npm run tweet` - CLI for proactive tweeting
- `npm run tweet:interactive` - Interactive tweet mode
- `tsx test-chaos.ts` - Test chaos transformations

#### 🌐 New API Endpoints
- `POST /api/tweet/prompt` - Generate tweets from prompts
- `POST /api/tweet/react` - React to trending topics
- `POST /api/tweet/schedule` - Schedule tweets (framework ready)
- `POST /api/tweet/preview` - Preview chaos transformation
- `GET /api/tweet/ideas` - Get tweet inspiration

### 🔧 Perplexity API Configuration

#### Fixed
- **Model Configuration**: Corrected Perplexity model name to `sonar`
- **API Integration**: Successfully validated and tested Perplexity API
- **Real-time Search**: Confirmed working with live data fetching

#### Tested
- Perplexity API key authentication ✅
- Real-time information retrieval ✅
- Citation generation ✅
- Token usage tracking ✅
- Chaos mode transformation ✅

### 📝 Example Output
```
Before: "Bitcoin has increased by 15% according to market analysis."
After: "bitcoin pumped 15% today,,, number go up, probably nothing"
```

## [0.2.0] - 2025-01-05

### 🎨 Web Interface Release

#### Added
- **Web Chat Interface**: Beautiful Next.js-based chat interface for throp
- **Anthropic Integration**: Powered by Claude 3.5 Sonnet via Vercel AI SDK
- **Orange Theme**: Custom orange-gradient design matching throp's personality
- **Personality System**: Witty, memeable character inspired by gork's approach
- **Real-time Streaming**: Edge runtime for optimal performance
- **Animated UI**: Smooth animations with Framer Motion
- **Responsive Design**: Works perfectly on all devices
- **Markdown Support**: Rich text formatting in responses

#### Features
- Interactive chat with throp's unique personality
- Orange rating system (rates things 1-10 oranges)
- Intentional typos and glitches for comedic effect
- Self-aware AI humour and meme references
- Third-person references and catchphrases
- Beautiful typing indicators and message animations
- Message regeneration capability
- Message counter display

#### Technical Details
- Built with Next.js 15 and App Router
- Vercel AI SDK for streaming responses
- Anthropic Claude 3.5 Sonnet as the language model
- Tailwind CSS with custom orange theme
- Edge runtime for optimal performance
- TypeScript for type safety
- Environment-based configuration

#### Documentation
- Comprehensive web interface README
- Setup instructions for the web app
- Personality customisation guide
- Deployment instructions for Vercel
- Environment variable documentation

### 🔧 Backend API Integration

#### Added
- **REST API Server**: Express-based API server for web interface communication
- **WebSocket Support**: Real-time bidirectional communication via Socket.io
- **Perplexity Integration**: Full implementation of Perplexity AI as primary answer engine
- **Redis Cache Layer**: Complete Redis implementation for shared state between bot and web
- **API Endpoints**: Comprehensive REST endpoints for chat, mentions, and cache management
- **CORS Support**: Configurable CORS for frontend integration
- **Status Monitoring**: Real-time status and statistics endpoint

#### Technical Improvements
- Modular answer engine architecture with base class
- Thread formatting for long responses
- Citation support from Perplexity
- Interaction caching for both Twitter and web sources
- WebSocket event broadcasting for multi-client support
- Comprehensive error handling and retry logic

#### Documentation
- API Integration Guide with examples
- Frontend integration examples (React, Vue)
- WebSocket event documentation
- Security considerations guide

### 📝 Notes
The web interface brings throp to life as an interactive chatbot, while the backend API ensures seamless integration between the Twitter bot functionality and web interfaces. The system now supports Perplexity AI as the primary engine, providing real-time web search capabilities for up-to-date responses.

## [0.1.0] - 2024-01-09

### 🎉 Initial Release

#### Added
- **Core Bot Framework**: Built on battle-tested xbot foundation
- **Twitter API Integration**: Robust client with rate limiting and retry logic
- **Multiple AI Engines**: Support for OpenAI, Perplexity, Dexa, and custom engines
- **State Management**: Redis-backed persistence and caching system
- **Configuration System**: Comprehensive environment-based configuration with validation
- **Logging System**: Structured logging with multiple levels and beautiful formatting
- **CLI Interface**: Feature-rich command-line interface with multiple modes
- **Type Safety**: Full TypeScript implementation with strict typing
- **Error Handling**: Comprehensive error handling and recovery mechanisms

#### Features
- Basic @mention handling framework
- Rate limiting based on Twitter API plan (Basic, Pro, Enterprise)
- Dry run mode for testing without posting
- Debug mode with verbose logging
- Continuous mode for ongoing monitoring
- Debug specific tweets functionality
- Content moderation support (ready for implementation)
- Thread response capability (ready for implementation)

#### Infrastructure
- Project structure following best practices
- Modular architecture for easy extension
- Environment-based configuration
- Git ignore patterns for security
- Documentation structure

#### Documentation
- Comprehensive README with setup instructions
- Environment variable documentation
- CLI usage guide
- Architecture overview

### 🚧 Known Limitations
- Answer engines not yet fully implemented (framework in place)
- Media analysis pending implementation
- Link expansion pending implementation
- Redis caching layer pending implementation
- Test suite not yet created

### 📝 Notes
This initial release establishes the foundation for Throp, providing a robust framework based on proven code. The architecture supports easy addition of the pending features whilst maintaining code quality and reliability.

---

## Upcoming Features (Roadmap)

### [0.2.0] - Planned
- ✨ Complete OpenAI answer engine implementation
- ✨ Redis caching layer activation
- ✨ Link content extraction
- ✨ Media analysis with GPT-4 Vision

### [0.3.0] - Planned
- ✨ Perplexity engine integration
- ✨ Quote tweet context handling
- ✨ Thread response generation
- ✨ Advanced content moderation

### [0.4.0] - Planned
- ✨ Custom answer engine support
- ✨ Webhook support for real-time mentions
- ✨ Analytics dashboard
- ✨ Multi-account management
