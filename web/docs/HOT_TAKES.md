# 🔥 Throp's Hot Takes Feature

## Overview

Throp's Hot Takes is a dynamic feature that generates Gen Z-style commentary on trending topics. It appears as a sidebar on desktop and a horizontal scroll section on mobile.

## How It Works

1. **Fetches Trending Topics**: Gets real trending data from X API (or uses mock data)
2. **Generates Takes**: Uses throp's backend AI to create authentic Gen Z hot takes
3. **Interactive Display**: Users can agree, share to Twitter, or ask for elaboration
4. **Auto-refreshes**: Updates every 5 minutes with fresh takes

## Setup

### Basic Setup (Mock Data)
No configuration needed! The feature works out of the box with mock trending data.

### Advanced Setup (Real X API Data)
Add these to your `.env.local`:

```bash
X_API_KEY=your-x-api-key
X_API_SECRET=your-x-api-secret
X_ACCESS_TOKEN=your-x-access-token
X_ACCESS_TOKEN_SECRET=your-x-access-token-secret
```

Get these from: https://developer.twitter.com/

## Features

### 💯 Agree Button
- Users can "agree" with takes
- Counter shows total agreements
- Agreements persist for the session

### 🐦 Share to Twitter
- One-click sharing to Twitter/X
- Pre-formatted with take and topic
- Opens in new window

### 🗣️ "Go Off" Button
- Pre-fills chat with elaborate request
- Throp will expand on the hot take
- Seamless integration with main chat

## Customisation

### Modify Take Generation

Edit `/src/app/api/hot-takes/route.ts`:

```typescript
const prompt = `You're throp, a chaotic Gen Z AI. Give a SHORT hot take on "${trend.name}".
Context: ${trend.context || 'trending topic'}
Be: cynical but accurate, gen z coded, under 20 words, something people would screenshot.
Don't be wrong, just deliver truth in unhinged style.`;
```

### Change Categories

Edit the categories in `/src/app/api/hot-takes/route.ts`:

```typescript
const takes: Record<string, string[]> = {
  tech: [...],      // Technology takes
  news: [...],      // News takes
  entertainment: [...], // Entertainment takes
  crypto: [...],    // Crypto takes
  sports: [...],    // Sports takes
  // Add more categories here
};
```

### Adjust Refresh Rate

In `/src/components/HotTakes.tsx`:

```typescript
// Change from 5 minutes to your preferred interval
const interval = setInterval(() => {
  setIsRefreshing(true);
  fetchHotTakes().finally(() => setIsRefreshing(false));
}, 5 * 60 * 1000); // 5 minutes in milliseconds
```

## Layout

### Desktop (screens > 768px)
- Appears as right sidebar
- Width: 384px (w-96)
- Vertical scrolling
- Border: 4px solid black

### Mobile (screens < 768px)
- Appears at top of chat
- Horizontal scrolling
- Snap scrolling enabled
- Card width: 280px

## API Endpoints

### GET /api/hot-takes
Fetches current hot takes.

Response:
```json
{
  "success": true,
  "takes": [
    {
      "id": "take-123",
      "topic": "Apple Vision Pro",
      "trendingVolume": "45.2K posts",
      "take": "people returning it like its a christmas sweater from grandma",
      "timestamp": "2025-01-09T...",
      "agreeCount": 420,
      "category": "tech"
    }
  ],
  "source": "mock" // or "x-api" if configured
}
```

### POST /api/hot-takes
Generate a custom take on demand.

Request:
```json
{
  "topic": "Your topic",
  "context": "Optional context"
}
```

## Examples of Takes

The takes are designed to be:
- **Accurate**: Based on real understanding
- **Cynical**: Gen Z perspective
- **Quotable**: Perfect for screenshots
- **Short**: Under 20 words

Examples:
- "microsoft laying off 1900 employees" → "microsoft playing 'new year new layoffs' like its their personality"
- "bitcoin hits 50k" → "bitcoin doing bitcoin things again. up down up down like my mental health"
- "taylor swift wins grammy" → "taylor collecting grammys like pokemon cards while ur fav cant even get nominated"

## Troubleshooting

### Takes Not Updating
- Check if backend API is running on port 3001
- Verify X API credentials (if using real data)
- Check browser console for errors

### Layout Issues
- Ensure Tailwind CSS is properly configured
- Check for conflicting styles
- Verify responsive breakpoints

### API Errors
- Backend API must be running for AI-generated takes
- Falls back to pre-written takes if API unavailable
- Check CORS settings if seeing cross-origin errors

## Notes for Non-Developers

The hot takes feature shows throp's commentary on what's trending. Think of it as throp scrolling Twitter and giving their unfiltered opinion on everything.

To change what throp says:
1. Find the file `src/app/api/hot-takes/route.ts`
2. Look for the section with example takes
3. Change the text between the quotes
4. Save the file and refresh the page

The feature updates automatically every 5 minutes, but you can click the refresh button (🔄) to update immediately.
