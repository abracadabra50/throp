/**
 * Twitter API client wrapper with rate limiting and retry logic
 * Provides a robust interface to Twitter API v2
 */

import { TwitterApi, type TweetV2, type UserV2 } from 'twitter-api-v2';
import pRetry, { type Options as PRetryOptions } from 'p-retry';
import pThrottle from 'p-throttle';
import { logger } from '../utils/logger.js';
import { getConfig, calculateRequestDelay } from '../config.js';
import type { TwitterMention, RateLimitInfo } from '../types.js';

/**
 * Custom error class for Twitter API errors
 */
export class TwitterApiError extends Error {
  constructor(
    message: string,
    public code?: number,
    public rateLimit?: RateLimitInfo
  ) {
    super(message);
    this.name = 'TwitterApiError';
  }
}

/**
 * Twitter client with rate limiting and retry capabilities
 */
export class TwitterClient {
  private client: TwitterApi;
  private v2Client: TwitterApi['v2'];
  private readonly config = getConfig();
  private rateLimits: Map<string, RateLimitInfo> = new Map();
  private throttle: ReturnType<typeof pThrottle>;
  
  constructor() {
    // Initialize Twitter client with OAuth2 Bearer Token if available
    const bearerToken = this.config.twitter.bearerToken || process.env.TWITTER_BEARER_TOKEN;
    
    logger.info('Twitter client initialization:', {
      hasBearerToken: !!bearerToken,
      hasBotUserId: !!this.config.twitter.botUserId,
      botUserId: this.config.twitter.botUserId || 'NOT SET',
      bearerTokenLength: bearerToken ? bearerToken.length : 0,
    });
    
    if (bearerToken) {
      // Use Bearer Token for better API access (OAuth 2.0)
      this.client = new TwitterApi(bearerToken);
      logger.info('Twitter client initialized with Bearer Token (OAuth 2.0)');
    } else {
      // Fallback to OAuth 1.0a
      this.client = new TwitterApi({
        appKey: this.config.twitter.apiKey,
        appSecret: this.config.twitter.apiSecretKey,
        accessToken: this.config.twitter.accessToken,
        accessSecret: this.config.twitter.accessTokenSecret,
      });
      logger.info('Twitter client initialized with OAuth 1.0a');
    }
    
    this.v2Client = this.client.v2;
    
    // Set up rate limiting based on API plan
    const delay = calculateRequestDelay(this.config.twitter.apiPlan);
    this.throttle = pThrottle({
      limit: 1,
      interval: delay,
    });
    
    logger.info(`Twitter client initialized with ${this.config.twitter.apiPlan} plan`, {
      delay: `${delay}ms between requests`,
    });
  }

  /**
   * Get the v2 client for direct API access
   * @returns Twitter API v2 client
   */
  getV2Client(): TwitterApi['v2'] {
    return this.v2Client;
  }

  /**
   * Fetch mentions for the bot
   * @param sinceId Fetch mentions after this ID
   * @param maxResults Maximum number of mentions to fetch
   * @returns Array of mentions
   */
  async getMentions(
    sinceId?: string,
    maxResults: number = 100
  ): Promise<TwitterMention[]> {
    const endLog = logger.time('Fetching mentions');
    
    // Check if bot user ID is set
    if (!this.config.twitter.botUserId) {
      logger.error('TWITTER_BOT_USER_ID is not set! Cannot fetch mentions.');
      throw new Error('Bot user ID is required to fetch mentions. Set TWITTER_BOT_USER_ID environment variable.');
    }
    
    logger.info(`Fetching mentions for bot user ID: ${this.config.twitter.botUserId}`);
    
    try {
      const mentions = await this.executeWithRetry(async () => {
        const response = await this.v2Client.userMentionTimeline(
          this.config.twitter.botUserId,
          {
            since_id: sinceId,
            max_results: Math.min(maxResults, 100),
            'tweet.fields': [
              'author_id',
              'conversation_id',
              'created_at',
              'entities',
              'in_reply_to_user_id',
              'referenced_tweets',
              'public_metrics',
            ],
            'user.fields': [
              'name',
              'username',
              'description',
              'verified',
              'public_metrics',
            ],
            expansions: [
              'author_id',
              'referenced_tweets.id',
              'referenced_tweets.id.author_id',
              'entities.mentions.username',
            ],
          }
        );
        
        // Update rate limit info
        this.updateRateLimit('mentions', response.rateLimit);
        
        return response;
      });
      
      const processedMentions = this.processMentions(mentions);
      
      endLog();
      logger.info(`Fetched ${processedMentions.length} mentions`);
      
      return processedMentions;
    } catch (error) {
      endLog();
      logger.error('Failed to fetch mentions', error);
      throw this.wrapError(error);
    }
  }

  /**
   * Get a single tweet by ID
   * @param tweetId The tweet ID to fetch
   * @returns Tweet data
   */
  async getTweet(tweetId: string): Promise<TweetV2> {
    try {
      const response = await this.executeWithRetry(async () => {
        return await this.v2Client.singleTweet(tweetId, {
          'tweet.fields': [
            'author_id',
            'conversation_id',
            'created_at',
            'entities',
            'in_reply_to_user_id',
            'referenced_tweets',
            'public_metrics',
          ],
          'user.fields': ['name', 'username', 'description', 'verified'],
          expansions: ['author_id', 'referenced_tweets.id'],
        });
      });
      
      return response.data;
    } catch (error) {
      logger.error(`Failed to fetch tweet ${tweetId}`, error);
      throw this.wrapError(error);
    }
  }

  /**
   * Get user information by ID
   * @param userId The user ID to fetch
   * @returns User data
   */
  async getUser(userId: string): Promise<UserV2> {
    try {
      const response = await this.executeWithRetry(async () => {
        return await this.v2Client.user(userId, {
          'user.fields': [
            'name',
            'username',
            'description',
            'verified',
            'public_metrics',
            'created_at',
          ],
        });
      });
      
      return response.data;
    } catch (error) {
      logger.error(`Failed to fetch user ${userId}`, error);
      throw this.wrapError(error);
    }
  }

  /**
   * Reply to a tweet
   * @param text The reply text
   * @param replyToId The tweet ID to reply to
   * @returns The created tweet
   */
  async reply(text: string, replyToId: string): Promise<TweetV2> {
    if (this.config.bot.dryRun) {
      logger.info('[DRY RUN] Would reply to tweet', { text, replyToId });
      return { id: 'dry-run-id', text, edit_history_tweet_ids: ['dry-run-id'] } as TweetV2;
    }
    
    try {
      const response = await this.executeWithRetry(async () => {
        return await this.v2Client.tweet(text, {
          reply: { in_reply_to_tweet_id: replyToId },
        });
      });
      
      logger.success(`Posted reply to ${replyToId}`, { tweetId: response.data.id });
      return response.data as TweetV2;
    } catch (error) {
      logger.error('Failed to post reply', error);
      throw this.wrapError(error);
    }
  }

  /**
   * Post a single tweet
   * @param text Tweet text
   * @returns Created tweet
   */
  async tweet(text: string): Promise<TweetV2> {
    if (this.config.bot.dryRun) {
      logger.info('[DRY RUN] Would post tweet', { text });
      return { id: 'dry-run-id', text, edit_history_tweet_ids: ['dry-run-id'] } as TweetV2;
    }
    
    try {
      const response = await this.executeWithRetry(async () => {
        return await this.v2Client.tweet(text);
      });
      
      logger.success(`Posted tweet`, { tweetId: response.data.id });
      return response.data as TweetV2;
    } catch (error) {
      logger.error('Failed to post tweet', error);
      throw this.wrapError(error);
    }
  }

  /**
   * Post a thread of tweets
   * @param texts Array of tweet texts for the thread
   * @param replyToId Optional tweet ID to reply to
   * @returns Array of created tweets
   */
  async postThread(texts: string[], replyToId?: string): Promise<TweetV2[]> {
    if (this.config.bot.dryRun) {
      logger.info('[DRY RUN] Would post thread', { texts, replyToId });
      return texts.map((text, i) => ({ id: `dry-run-${i}`, text, edit_history_tweet_ids: [`dry-run-${i}`] } as TweetV2));
    }
    
    const tweets: TweetV2[] = [];
    let previousTweetId = replyToId;
    
    for (const [index, text] of texts.entries()) {
      try {
        const response = await this.executeWithRetry(async () => {
          const options: any = {};
          if (previousTweetId) {
            options.reply = { in_reply_to_tweet_id: previousTweetId };
          }
          return await this.v2Client.tweet(text, options);
        });
        
        tweets.push(response.data as TweetV2);
        previousTweetId = response.data.id;
        
        logger.info(`Posted thread tweet ${index + 1}/${texts.length}`, {
          tweetId: response.data.id,
        });
        
        // Add delay between thread tweets to avoid rate limits
        if (index < texts.length - 1) {
          await this.delay(2000);
        }
      } catch (error) {
        logger.error(`Failed to post thread tweet ${index + 1}`, error);
        throw this.wrapError(error);
      }
    }
    
    logger.success(`Posted thread with ${tweets.length} tweets`);
    return tweets;
  }

  /**
   * Get conversation thread
   * @param conversationId The conversation ID
   * @returns Array of tweets in the conversation
   */
  async getConversation(conversationId: string): Promise<TweetV2[]> {
    try {
      const response = await this.executeWithRetry(async () => {
        return await this.v2Client.search(
          `conversation_id:${conversationId}`,
          {
            max_results: 100,
            'tweet.fields': [
              'author_id',
              'conversation_id',
              'created_at',
              'in_reply_to_user_id',
              'referenced_tweets',
            ],
            'user.fields': ['name', 'username'],
            expansions: ['author_id'],
          }
        );
      });
      
      return response.data.data || [];
    } catch (error) {
      logger.error(`Failed to fetch conversation ${conversationId}`, error);
      throw this.wrapError(error);
    }
  }

  /**
   * Execute a Twitter API call with retry logic
   */
  private async executeWithRetry<T>(
    fn: () => Promise<T>,
    options?: PRetryOptions
  ): Promise<T> {
    return this.throttle(async () => {
      return pRetry(fn, {
        retries: 3,
        onFailedAttempt: (error) => {
          logger.warn(`API call failed, attempt ${error.attemptNumber}/${error.retriesLeft + error.attemptNumber}`, {
            error: error.message,
          });
        },
        ...options,
      });
    })();
  }

  /**
   * Process raw mentions into our format
   */
  private processMentions(response: any): TwitterMention[] {
    if (!response.data?.data) {
      return [];
    }
    
    const users = new Map<string, UserV2>();
    const tweets = new Map<string, TweetV2>();
    
    // Build lookup maps for includes
    if (response.includes?.users) {
      response.includes.users.forEach((user: UserV2) => {
        users.set(user.id, user);
      });
    }
    
    if (response.includes?.tweets) {
      response.includes.tweets.forEach((tweet: TweetV2) => {
        tweets.set(tweet.id, tweet);
      });
    }
    
    // Process mentions
    return response.data.data.map((tweet: TweetV2): TwitterMention => {
      const author = users.get(tweet.author_id!);
      
      // Get referenced tweets
      let quotedTweet: TweetV2 | undefined;
      let repliedToTweet: TweetV2 | undefined;
      
      if (tweet.referenced_tweets) {
        for (const ref of tweet.referenced_tweets) {
          if (ref.type === 'quoted') {
            quotedTweet = tweets.get(ref.id);
          } else if (ref.type === 'replied_to') {
            repliedToTweet = tweets.get(ref.id);
          }
        }
      }
      
      return {
        id: tweet.id,
        text: tweet.text,
        authorId: tweet.author_id!,
        authorUsername: author?.username,
        createdAt: new Date(tweet.created_at!),
        conversationId: tweet.conversation_id!,
        inReplyToUserId: tweet.in_reply_to_user_id,
        referencedTweets: tweet.referenced_tweets,
        entities: tweet.entities,
        quotedTweet,
        repliedToTweet,
        author,
        processed: false,
      };
    });
  }

  /**
   * Update rate limit information
   */
  private updateRateLimit(endpoint: string, rateLimit: any): void {
    if (!rateLimit) return;
    
    this.rateLimits.set(endpoint, {
      limit: rateLimit.limit,
      remaining: rateLimit.remaining,
      reset: new Date(rateLimit.reset * 1000),
    });
    
    logger.debug(`Rate limit updated for ${endpoint}`, {
      remaining: rateLimit.remaining,
      reset: new Date(rateLimit.reset * 1000).toISOString(),
    });
  }

  /**
   * Wrap errors in our custom error class
   */
  private wrapError(error: any): TwitterApiError {
    if (error.code === 429) {
      const resetTime = error.rateLimit?.reset 
        ? new Date(error.rateLimit.reset * 1000)
        : new Date(Date.now() + 15 * 60 * 1000);
      
      return new TwitterApiError(
        'Rate limit exceeded',
        429,
        {
          limit: error.rateLimit?.limit || 0,
          remaining: 0,
          reset: resetTime,
        }
      );
    }
    
    return new TwitterApiError(
      error.message || 'Twitter API error',
      error.code
    );
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get current rate limit status
   */
  getRateLimitStatus(): Map<string, RateLimitInfo> {
    return new Map(this.rateLimits);
  }

  /**
   * Check if we're rate limited
   */
  isRateLimited(endpoint: string = 'mentions'): boolean {
    const limit = this.rateLimits.get(endpoint);
    if (!limit) return false;
    
    return limit.remaining === 0 && limit.reset.getTime() > Date.now();
  }

  /**
   * Get time until rate limit reset
   */
  getTimeUntilReset(endpoint: string = 'mentions'): number {
    const limit = this.rateLimits.get(endpoint);
    if (!limit) return 0;
    
    return Math.max(0, limit.reset.getTime() - Date.now());
  }
}
