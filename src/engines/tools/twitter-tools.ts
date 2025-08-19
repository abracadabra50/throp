/**
 * Twitter/X Tools - Search and profile lookup functionality
 * Follows Anthropic's tool-use specification
 */

import { logger } from '../../utils/logger.js';
import { getTwitterSearch } from '../../twitter/twitter-search.js';
import { TwitterClient } from '../../twitter/client.js';
import type { TwitterSearchResult } from '../../twitter/twitter-search.js';

export interface TwitterProfile {
  id: string;
  username: string;
  name: string;
  description: string;
  followers_count: number;
  following_count: number;
  tweet_count: number;
  verified: boolean;
  created_at: string;
}

export class TwitterTool {
  private twitterSearch = getTwitterSearch();
  private twitterClient: TwitterClient | null = null;
  
  constructor() {
    try {
      this.twitterClient = new TwitterClient();
    } catch (error) {
      logger.warn('Twitter client not available, some features disabled', error);
    }
  }
  
  /**
   * Search Twitter/X for tweets
   */
  async searchTweets(query: string, limit: number = 10): Promise<TwitterSearchResult> {
    logger.info('Twitter search', { query, limit });
    
    try {
      const results = await this.twitterSearch.searchTweets(query, limit);
      
      if (!results) {
        return {
          query,
          count: 0,
          tweets: []
        };
      }
      
      logger.info('Twitter search complete', { 
        query, 
        found: results.count 
      });
      
      return results;
    } catch (error) {
      logger.error('Twitter search failed', { query, error });
      return {
        query,
        count: 0,
        tweets: []
      };
    }
  }
  
  /**
   * Get Twitter/X user profile
   */
  async getProfile(handle: string): Promise<TwitterProfile | null> {
    logger.info('Getting Twitter profile', { handle });
    
    // Clean the handle (remove @ if present)
    const cleanHandle = handle.replace('@', '').trim();
    
    try {
      // First try to search for the user
      const searchResults = await this.searchTweets(`from:${cleanHandle}`, 1);
      
      if (searchResults.tweets.length > 0) {
        const tweet = searchResults.tweets[0];
        
        // Try to get more detailed info if we have a client
        if (this.twitterClient) {
          try {
            const user = await this.twitterClient.getUser(tweet.author);
            
            return {
              id: user.id,
              username: user.username || cleanHandle,
              name: user.name || cleanHandle,
              description: user.description || '',
              followers_count: user.public_metrics?.followers_count || 0,
              following_count: user.public_metrics?.following_count || 0,
              tweet_count: user.public_metrics?.tweet_count || 0,
              verified: user.verified || false,
              created_at: user.created_at || ''
            };
          } catch (error) {
            logger.warn('Failed to get detailed user info', error);
          }
        }
        
        // Fallback to basic info from search
        return {
          id: tweet.id,
          username: cleanHandle,
          name: tweet.author,
          description: 'Profile found via search',
          followers_count: 0,
          following_count: 0,
          tweet_count: 0,
          verified: false,
          created_at: tweet.created_at
        };
      }
      
      logger.warn('No profile found', { handle: cleanHandle });
      return null;
    } catch (error) {
      logger.error('Failed to get Twitter profile', { handle, error });
      return null;
    }
  }
  
  /**
   * Get recent tweets from a user
   */
  async getUserTweets(handle: string, limit: number = 10): Promise<TwitterSearchResult> {
    const cleanHandle = handle.replace('@', '').trim();
    return this.searchTweets(`from:${cleanHandle}`, limit);
  }
  
  /**
   * Search for tweets about a topic from verified accounts
   */
  async searchVerified(query: string, limit: number = 10): Promise<TwitterSearchResult> {
    return this.searchTweets(`${query} filter:verified`, limit);
  }
  
  /**
   * Search for popular tweets about a topic
   */
  async searchPopular(query: string, minLikes: number = 100, limit: number = 10): Promise<TwitterSearchResult> {
    return this.searchTweets(`${query} min_faves:${minLikes}`, limit);
  }
}
