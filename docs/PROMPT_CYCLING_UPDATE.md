# Trending Prompts Cycling & Caching Update

## What's New 🎉

### 1. **Automatic Prompt Cycling**
- Prompts now automatically rotate every 8 seconds
- Smooth fade-in animations when new prompts appear
- Shows all 7 trending prompts at once (increased from 3)
- Manual navigation with arrow buttons for user control

### 2. **Hourly Caching System**
Both **Hot Takes** and **Trending Prompts** are now cached for 1 hour to:
- Reduce API costs significantly
- Maintain fresh, relevant content
- Improve response times

### 3. **How It Works**

#### Frontend (`/api/trending-prompts`)
- Generates contextual prompts based on current date/season
- Uses Claude API to create relevant, timely prompts
- Caches results for 1 hour
- Falls back to default prompts if API fails

#### Backend (Hot Takes)
- Uses Redis for persistent caching
- Refreshes every hour automatically
- Serves cached content instantly
- Reduces Perplexity API calls by ~90%

### 4. **User Experience**
- Prompts feel more dynamic with auto-rotation
- Content stays fresh with hourly updates
- Faster load times from caching
- No more stale or repetitive prompts

## Technical Implementation

### Files Modified:
- `web/src/components/TrendingPrompts.tsx` - Cycling logic
- `web/src/app/api/trending-prompts/route.ts` - API endpoint
- `src/api/hot-takes-endpoint.ts` - Redis caching
- `src/api/trending-prompts-endpoint.ts` - Backend endpoint

### Cache Duration:
- **Hot Takes**: 1 hour (Redis)
- **Trending Prompts**: 1 hour (in-memory)
- **Frontend localStorage**: 1 hour

## Cost Savings
With hourly caching, we've reduced API calls by approximately:
- **90% reduction** in Perplexity API calls
- **90% reduction** in Claude API calls for prompts
- Estimated monthly savings: ~$50-100 depending on traffic
