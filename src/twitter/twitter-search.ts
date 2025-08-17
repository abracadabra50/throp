/**
 * Twitter/X Search Integration for Real-time Context
 */

import { TwitterApi } from 'twitter-api-v2';
import { logger } from '../utils/logger.js';
import { getConfig } from '../config.js';

export interface TwitterSearchResult {
  tweets: Array<{
    id: string;
    text: string;
    author: string;
    likes: number;
    retweets: number;
    created_at: string;
  }>;
  query: string;
  count: number;
}

export class TwitterSearch {
  private client: TwitterApi | null = null;
  private lastSearchTime: number = 0;
  private searchCache: Map<string, { result: TwitterSearchResult; timestamp: number }> = new Map();
  private CACHE_DURATION = 60 * 60 * 1000; // 1 hour
  private MIN_SEARCH_INTERVAL = 1000; // 1 second between searches

  constructor() {
    const config = getConfig();
    // Use Bearer Token if available for better API access
    const bearerToken = config.twitter?.bearerToken || process.env.TWITTER_BEARER_TOKEN;
    
    if (bearerToken) {
      this.client = new TwitterApi(bearerToken);
      logger.debug('Twitter search using Bearer Token');
    } else if (config.twitter?.apiKey) {
      this.client = new TwitterApi({
        appKey: config.twitter.apiKey,
        appSecret: config.twitter.apiSecretKey,
        accessToken: config.twitter.accessToken,
        accessSecret: config.twitter.accessTokenSecret,
      });
      logger.debug('Twitter search using OAuth 1.0a');
    }
  }

  /**
   * Search Twitter/X for recent tweets
   */
  async searchTweets(query: string, maxResults: number = 10): Promise<TwitterSearchResult | null> {
    // Check cache first
    const cached = this.searchCache.get(query);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      logger.debug('Using cached Twitter search results', { query });
      return cached.result;
    }

    // Rate limit protection
    const timeSinceLastSearch = Date.now() - this.lastSearchTime;
    if (timeSinceLastSearch < this.MIN_SEARCH_INTERVAL) {
      await new Promise(resolve => setTimeout(resolve, this.MIN_SEARCH_INTERVAL - timeSinceLastSearch));
    }

    if (!this.client) {
      logger.warn('Twitter client not configured for search');
      return null;
    }

    try {
      this.lastSearchTime = Date.now();
      
      logger.info('Searching Twitter/X', { query, maxResults });
      
      const searchResult = await this.client.v2.search(query, {
        max_results: maxResults,
        'tweet.fields': ['created_at', 'public_metrics', 'author_id'],
        'user.fields': ['username'],
        expansions: ['author_id'],
      });

      const tweets = searchResult.data.data || [];
      const users = searchResult.data.includes?.users || [];
      
      const result: TwitterSearchResult = {
        query,
        count: tweets.length,
        tweets: tweets.map(tweet => {
          const author = users.find(u => u.id === tweet.author_id);
          return {
            id: tweet.id,
            text: tweet.text,
            author: author?.username || 'unknown',
            likes: tweet.public_metrics?.like_count || 0,
            retweets: tweet.public_metrics?.retweet_count || 0,
            created_at: tweet.created_at || '',
          };
        }).sort((a, b) => b.likes + b.retweets - a.likes - a.retweets), // Sort by engagement
      };

      // Cache the result
      this.searchCache.set(query, { result, timestamp: Date.now() });
      
      logger.info('Twitter search complete', { 
        query, 
        found: result.count,
        topTweet: result.tweets[0]?.text?.substring(0, 50),
      });

      return result;
    } catch (error: any) {
      if (error.code === 429) {
        logger.warn('Twitter search rate limited');
      } else {
        logger.error('Twitter search failed', error);
      }
      return null;
    }
  }

  /**
   * Format search results for context
   */
  formatForContext(results: TwitterSearchResult): string {
    if (!results || results.tweets.length === 0) {
      return '';
    }

    const topTweets = results.tweets.slice(0, 5);
    const context = topTweets.map(tweet => 
      `@${tweet.author} (${tweet.likes} likes): "${tweet.text.substring(0, 100)}..."`
    ).join('\n');

    return `Recent tweets about "${results.query}":\n${context}`;
  }
}

// Singleton instance
let searchInstance: TwitterSearch | null = null;

export function getTwitterSearch(): TwitterSearch {
  if (!searchInstance) {
    searchInstance = new TwitterSearch();
  }
  return searchInstance;
}
