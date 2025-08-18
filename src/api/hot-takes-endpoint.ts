/**
 * Hot Takes Endpoint - Uses Perplexity to find SPECIFIC current events
 * Now with hourly Redis caching for fresh content and cost optimization
 */

import { Request, Response } from 'express';
import { logger } from '../utils/logger.js';
import { createHybridClaudeEngine } from '../engines/hybrid-claude.js';
import { getRedisCache } from '../cache/redis.js';
import Anthropic from '@anthropic-ai/sdk';

interface HotTake {
  id: string;
  topic: string;
  trendingVolume: string;
  take: string;
  timestamp: Date;
  agreeCount: number;
  category: string;
}

// Hourly cache duration for fresh content with cost optimization
const HOURLY_CACHE_DURATION = 60 * 60; // 1 hour in seconds
const CACHE_KEY_PREFIX = 'hot-takes';

/**
 * Get cache key for current hour's hot takes
 */
function getCurrentHourCacheKey(): string {
  const now = new Date();
  const hourKey = now.toISOString().slice(0, 13); // YYYY-MM-DDTHH
  return `${CACHE_KEY_PREFIX}:${hourKey}`;
}

/**
 * Get current date context for more specific queries
 */
function getCurrentContext() {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric',
    hour: '2-digit'
  };
  
  return {
    dateStr: now.toLocaleDateString('en-US', options),
    hour: now.getHours(),
    isWeekend: now.getDay() === 0 || now.getDay() === 6,
    month: now.toLocaleDateString('en-US', { month: 'long' }),
    year: now.getFullYear()
  };
}

/**
 * Fetch SPECIFIC trending topics using Perplexity (only called once per hour)
 */
async function fetchSpecificTrends(): Promise<any[]> {
  try {
    const engine = createHybridClaudeEngine();
    const context = getCurrentContext();
    
    // Ask for VERY specific current events
    const prompts = [
      `What specific celebrity drama or scandal is happening on Twitter/X today ${context.dateStr}? Name the actual people involved.`,
      `What specific tech company made news today? Include the company name and what they did.`,
      `What specific sports game or match result is trending right now? Include team names and score if available.`,
      `What specific political event or statement happened in the last 24 hours? Include names.`,
      `What viral video or meme is everyone talking about today specifically?`,
      `What specific AI or tech announcement happened this week? Include company names.`,
      `What specific market or crypto event is trending? Include specific coins or stocks.`
    ];
    
    // Randomly pick 4-6 prompts to vary the topics each hour
    const selectedPrompts = prompts
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 3) + 4); // 4-6 prompts
    
    const topics: any[] = [];
    
    for (const prompt of selectedPrompts) {
      try {
        const response = await engine.generateResponse({
          question: prompt,
          author: { username: 'system' },
        });
        
        if (response.text) {
          // Extract the most specific part
          const lines = response.text.split(/[.\n]/);
          for (const line of lines) {
            // Look for proper nouns, names, specific events
            if (line.length > 10 && line.length < 100) {
              // Extract key terms (capitalized words, hashtags, @mentions)
              const matches = line.match(/[A-Z][a-z]+(?:\s[A-Z][a-z]+)*|#\w+|@\w+/g);
              if (matches && matches.length > 0) {
                const topic = matches.join(' ').trim();
                if (topic && !topics.some(t => t.name === topic)) {
                  topics.push({
                    name: topic,
                    context: line.trim()
                  });
                  break;
                }
              }
            }
          }
        }
      } catch (err) {
        logger.error('Failed to fetch specific trend', { err });
      }
    }
    
    // If we got specific topics, use them
    if (topics.length > 0) {
      logger.info('Got specific trends from Perplexity', {
        topics: topics.map(t => t.name).join(', ')
      });
      return topics;
    }
    
    // Fallback to time-specific topics
    return getTimeSpecificTopics();
  } catch (error) {
    logger.error('Failed to fetch specific trends', { error });
    return getTimeSpecificTopics();
  }
}

/**
 * Get time-specific fallback topics based on current time/day
 */
function getTimeSpecificTopics(): any[] {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay();
  
  
  const topics: any[] = [];
  
  // Time-based topics (changes every hour)
  if (hour >= 6 && hour < 9) {
    topics.push({ name: 'Morning Coffee Prices', context: 'Starbucks raised prices again' });
    topics.push({ name: 'Rush Hour Traffic', context: 'Major delays on highways' });
    topics.push({ name: 'Breakfast Inflation', context: 'Cereal costs more than rent' });
  } else if (hour >= 9 && hour < 12) {
    topics.push({ name: 'Stock Market Opening', context: 'Tech stocks volatile' });
    topics.push({ name: 'Work Meeting Memes', context: 'Another pointless Zoom call' });
    topics.push({ name: 'Email Overload', context: 'Reply all disasters' });
  } else if (hour >= 12 && hour < 14) {
    topics.push({ name: 'Lunch Break Drama', context: 'Office microwave etiquette debate' });
    topics.push({ name: 'Food Delivery Apps', context: 'DoorDash fees controversy' });
    topics.push({ name: 'Salad Price Shock', context: '$18 for lettuce and sadness' });
  } else if (hour >= 14 && hour < 17) {
    topics.push({ name: 'Afternoon Slump', context: '3pm energy crisis' });
    topics.push({ name: 'School Pickup Chaos', context: 'Parent parking lot drama' });
    topics.push({ name: 'Coffee Shop WiFi', context: 'Remote workers hogging tables' });
  } else if (hour >= 17 && hour < 20) {
    topics.push({ name: 'Commute Home', context: 'Public transport delays' });
    topics.push({ name: 'Dinner Plans', context: 'Restaurant reservation apps down' });
    topics.push({ name: 'Happy Hour Prices', context: '$20 cocktails in this economy' });
  } else if (hour >= 20 && hour < 23) {
    topics.push({ name: 'Netflix New Release', context: 'Latest show everyone\'s watching' });
    topics.push({ name: 'Gaming Server Issues', context: 'Popular game servers crashed' });
    topics.push({ name: 'Streaming Wars', context: 'Too many subscriptions' });
  } else {
    topics.push({ name: 'Late Night Thoughts', context: '3am existential crisis tweets' });
    topics.push({ name: 'Insomnia Club', context: 'Can\'t sleep gang' });
    topics.push({ name: 'Night Shift Life', context: 'Working while world sleeps' });
  }
  
  // Day-specific topics
  const dayTopics: Record<number, any> = {
    0: { name: 'Sunday Scaries', context: 'Tomorrow is Monday dread' },
    1: { name: 'Monday Meeting Hell', context: 'Back to back Zoom calls' },
    2: { name: 'Taco Tuesday Debate', context: 'Best taco spots argument' },
    3: { name: 'Hump Day Motivation', context: 'Midweek crisis' },
    4: { name: 'Thursday is New Friday', context: 'Weekend planning starts' },
    5: { name: 'Friday Productivity', context: 'Nobody working after lunch' },
    6: { name: 'Saturday Hangover', context: 'Last night was a mistake' }
  };
  
  if (dayTopics[day]) {
    topics.push(dayTopics[day]);
  }
  
  // Add some variety based on hour for fallback topics
  const hourlyVariations = [
    { name: `${hour}:00 Energy Check`, context: `How are we feeling at ${hour}:00?` },
    { name: 'Current Mood', context: `${hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening'} vibes` }
  ];
  
  topics.push(...hourlyVariations);
  
  return topics.slice(0, 6); // Return more topics for variety
}

/**
 * Generate a hot take for a specific trend
 */
async function generateThropTake(topic: any): Promise<string> {
  try {
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicKey) {
      throw new Error('No Anthropic API key');
    }
    
    const anthropic = new Anthropic({ apiKey: anthropicKey });
    
    const context = topic.context || topic.name;
    
    const prompt = `You're throp, a chaotic gen z ai. Give ONE hot take about: "${topic.name}"
${context ? `Context: ${context}` : ''}

Be VERY specific about this exact topic. Reference the actual names/events.
Your style is cynical and unhinged. Examples:
- "not [specific person] thinking [specific action] is revolutionary"
- "[specific event] is just [comparison] for people who [insult]"
- "imagine [specific scenario] and thinking you're the main character"

Keep it under 25 words. Be specific, not generic. Just the take:`;
    
    const response = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
      max_tokens: 60,
      temperature: 0.95,
      messages: [{ role: 'user', content: prompt }],
    });
    
    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    return text.trim().toLowerCase();
  } catch (error) {
    logger.error('Failed to generate hot take', { error });
    return `${topic.name.toLowerCase()} happening and everyone acting surprised like we didn't see this coming`;
  }
}

/**
 * Generate hot takes for trending topics
 */
async function generateHotTakes(): Promise<HotTake[]> {
  // Fetch specific trending topics
  const trends = await fetchSpecificTrends();
  
  const takes: HotTake[] = [];
  
  for (let i = 0; i < Math.min(trends.length, 6); i++) { // Generate up to 6 takes
    const trend = trends[i];
    const take = await generateThropTake(trend);
    
    // Generate realistic-looking tweet volumes that vary by hour
    const hour = new Date().getHours();
    const baseVolumes = ['2.3M', '1.8M', '847K', '421K', '156K', '92.5K'];
    
    // Peak hours get higher volumes
    let volumeMultiplier = 1;
    if (hour >= 9 && hour <= 11) volumeMultiplier = 1.5; // Morning peak
    if (hour >= 17 && hour <= 20) volumeMultiplier = 1.3; // Evening peak
    if (hour >= 20 && hour <= 23) volumeMultiplier = 1.2; // Night peak
    
    const volume = baseVolumes[i] || `${Math.floor(Math.random() * 900 + 100)}K`;
    
    takes.push({
      id: `take-${Date.now()}-${i}`,
      topic: trend.name,
      trendingVolume: `${volume} posts`,
      take,
      timestamp: new Date(),
      agreeCount: Math.floor(Math.random() * 5000 * volumeMultiplier) + 500,
      category: determineCategory(trend.name)
    });
  }
  
  logger.info('Generated hot takes for specific trends', { 
    count: takes.length,
    topics: takes.map(t => t.topic).join(', ')
  });
  
  return takes;
}

/**
 * Determine category based on topic
 */
function determineCategory(name: string): string {
  const lower = name.toLowerCase();
  
  if (lower.includes('game') || lower.includes('match') || lower.includes('score') || 
      lower.includes('nfl') || lower.includes('nba') || lower.includes('soccer')) {
    return 'sports';
  }
  
  if (lower.includes('bitcoin') || lower.includes('crypto') || lower.includes('stock') || 
      lower.includes('market') || lower.includes('trading')) {
    return 'crypto';
  }
  
  if (lower.includes('election') || lower.includes('president') || lower.includes('congress') || 
      lower.includes('politics') || lower.includes('government')) {
    return 'politics';
  }
  
  if (lower.includes('tech') || lower.includes('app') || lower.includes('ai') || 
      lower.includes('google') || lower.includes('apple') || lower.includes('meta')) {
    return 'tech';
  }
  
  if (lower.includes('movie') || lower.includes('netflix') || lower.includes('music') || 
      lower.includes('celebrity') || lower.includes('drama')) {
    return 'entertainment';
  }
  
  return 'trending';
}

/**
 * Hot takes endpoint handler with hourly Redis caching
 */
export async function handleHotTakes(
  _req: Request,
  res: Response
): Promise<void> {
  try {
    logger.info('Hot takes endpoint called');
    
    const cache = getRedisCache();
    const cacheKey = getCurrentHourCacheKey();
    
    // Try to get from Redis cache first
    try {
      const cachedData = await cache.get(cacheKey);
      if (cachedData) {
        const parsedData = JSON.parse(cachedData as string);
        logger.info('Returning cached hot takes from Redis', { 
          generatedAt: parsedData.generatedAt,
          count: parsedData.takes.length,
          cacheKey 
        });
        
        res.json({
          success: true,
          takes: parsedData.takes,
          source: 'redis-hourly-cache',
          generatedAt: parsedData.generatedAt,
          nextUpdate: parsedData.nextUpdate
        });
        return;
      }
    } catch (cacheError) {
      logger.warn('Failed to get from cache, generating fresh', { cacheError });
    }
    
    // Generate new hot takes with specific trends
    logger.info('Generating fresh hot takes from specific trends (will cache for 1 hour)');
    const takes = await generateHotTakes();
    
    // Calculate next update time
    const now = new Date();
    const nextUpdate = new Date(now);
    nextUpdate.setHours(nextUpdate.getHours() + 1, 0, 0, 0); // Next hour on the hour
    
    // Cache in Redis for 1 hour
    const cacheData = {
      takes,
      generatedAt: now.toISOString(),
      nextUpdate: nextUpdate.toISOString()
    };
    
    try {
      await cache.set(cacheKey, JSON.stringify(cacheData), HOURLY_CACHE_DURATION);
      logger.info('Cached hot takes in Redis for 1 hour', { 
        key: cacheKey, 
        nextUpdate: nextUpdate.toISOString() 
      });
    } catch (cacheError) {
      logger.warn('Failed to cache hot takes', { cacheError });
    }
    
    res.json({
      success: true,
      takes,
      source: 'generated-fresh',
      generatedAt: now.toISOString(),
      nextUpdate: nextUpdate.toISOString()
    });
    
  } catch (error) {
    logger.error('Failed to generate hot takes', { error });
    
    // Return time-specific fallback
    const fallbackTopics = getTimeSpecificTopics();
    const fallbackTakes: HotTake[] = fallbackTopics.slice(0, 4).map((topic, index) => ({
      id: `fallback-${Date.now()}-${index}`,
      topic: topic.name,
      trendingVolume: `${Math.floor(Math.random() * 500 + 50)}K posts`,
      take: `${topic.name.toLowerCase()} and everyone acting like this is normal`,
      timestamp: new Date(),
      agreeCount: Math.floor(Math.random() * 1000) + 50,
      category: 'trending'
    }));
    
    res.json({
      success: true,
      takes: fallbackTakes,
      source: 'fallback-error'
    });
  }
}
