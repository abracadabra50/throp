#!/usr/bin/env node

/**
 * Throp - Advanced Twitter/X Bot
 * Main entry point for the bot CLI
 */

import { cli } from 'cleye';
import chalk from 'chalk';
import { logger } from '../src/utils/logger.js';
import { getConfig } from '../src/config.js';
import { TwitterClient } from '../src/twitter/client.js';
import type { Config } from '../src/types.js';

// Parse CLI arguments
const argv = cli({
  name: 'throp',
  version: '0.1.0',
  flags: {
    answerEngine: {
      type: String,
      alias: 'a',
      description: 'Answer engine to use (openai, dexa, or perplexity)',
      default: 'openai',
    },
    debug: {
      type: Boolean,
      description: 'Enables debug logging',
      default: false,
    },
    debugTweetIds: {
      type: [String],
      alias: 't',
      description: 'Specifies tweets to process for debugging',
    },
    dryRun: {
      type: Boolean,
      alias: 'd',
      description: 'Enables dry run mode (no actual tweets)',
      default: false,
    },
    earlyExit: {
      type: Boolean,
      alias: 'e',
      description: 'Exit after fetching mentions without processing',
      default: false,
    },
    forceReply: {
      type: Boolean,
      alias: 'f',
      description: 'Force reply even if already responded',
      default: false,
    },
    help: {
      type: Boolean,
      alias: 'h',
      description: 'Show help',
    },
    maxMentions: {
      type: Number,
      alias: 'n',
      description: 'Number of mentions to process per batch',
      default: 10,
    },
    noMentionsCache: {
      type: Boolean,
      description: 'Disable loading mentions from cache',
      default: false,
    },
    resolveAllMentions: {
      type: Boolean,
      alias: 'R',
      description: 'Fetch all mentions from Twitter API',
      default: false,
    },
    sinceMentionId: {
      type: String,
      alias: 's',
      description: 'Override the default since mention ID',
    },
    continuous: {
      type: Boolean,
      alias: 'c',
      description: 'Run continuously, checking for new mentions periodically',
      default: false,
    },
    interval: {
      type: Number,
      alias: 'i',
      description: 'Interval between checks in continuous mode (minutes)',
      default: 5,
    },
  },
});

/**
 * ASCII art banner for Throp
 */
const showBanner = () => {
  console.log(chalk.cyan(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║  ████████╗██╗  ██╗██████╗  ██████╗ ██████╗              ║
║  ╚══██╔══╝██║  ██║██╔══██╗██╔═══██╗██╔══██╗             ║
║     ██║   ███████║██████╔╝██║   ██║██████╔╝             ║
║     ██║   ██╔══██║██╔══██╗██║   ██║██╔═══╝              ║
║     ██║   ██║  ██║██║  ██║╚██████╔╝██║                  ║
║     ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═╝                  ║
║                                                           ║
║         Advanced Twitter/X Bot for AI Responses          ║
║                    Built with 💙                         ║
╚═══════════════════════════════════════════════════════════╝
`));
};

/**
 * Main bot execution
 */
async function main() {
  showBanner();
  
  try {
    // Load configuration
    logger.header('Configuration');
    const config = getConfig();
    
    // Override config with CLI flags
    if (argv.flags.debug) {
      (config as any).bot.debug = true;
      (config as any).monitoring.logLevel = 'debug';
    }
    if (argv.flags.dryRun) {
      (config as any).bot.dryRun = true;
    }
    if (argv.flags.answerEngine) {
      (config as any).bot.answerEngine = argv.flags.answerEngine;
    }
    if (argv.flags.maxMentions) {
      (config as any).bot.maxMentionsPerBatch = argv.flags.maxMentions;
    }
    
    logger.success('Configuration loaded successfully');
    logger.info('Bot settings:', {
      username: config.twitter.botUsername,
      apiPlan: config.twitter.apiPlan,
      answerEngine: config.bot.answerEngine,
      dryRun: config.bot.dryRun,
      debug: config.bot.debug,
    });
    
    // Initialize Twitter client
    logger.header('Twitter Client');
    const twitterClient = new TwitterClient();
    logger.success('Twitter client initialized');
    
    // Check rate limits
    if (twitterClient.isRateLimited()) {
      const resetTime = twitterClient.getTimeUntilReset();
      logger.warn(`Rate limited. Waiting ${Math.ceil(resetTime / 1000 / 60)} minutes...`);
      
      if (!argv.flags.continuous) {
        process.exit(1);
      }
      
      await delay(resetTime);
    }
    
    // Debug mode - process specific tweets
    if (argv.flags.debugTweetIds && argv.flags.debugTweetIds.length > 0) {
      logger.header('Debug Mode');
      logger.info(`Processing ${argv.flags.debugTweetIds.length} debug tweets`);
      
      for (const tweetId of argv.flags.debugTweetIds) {
        try {
          const tweet = await twitterClient.getTweet(tweetId);
          logger.info(`Tweet ${tweetId}:`, {
            text: tweet.text,
            author: tweet.author_id,
          });
          
          // TODO: Process tweet with answer engine
          logger.warn('Answer engine not yet implemented');
        } catch (error) {
          logger.error(`Failed to process tweet ${tweetId}`, error);
        }
      }
      
      process.exit(0);
    }
    
    // Main bot loop
    if (argv.flags.continuous) {
      logger.header('Continuous Mode');
      logger.info(`Running continuously with ${argv.flags.interval} minute intervals`);
      
      while (true) {
        await runBot(twitterClient, config, argv.flags);
        
        logger.info(`Waiting ${argv.flags.interval} minutes before next check...`);
        await delay(argv.flags.interval * 60 * 1000);
      }
    } else {
      // Single run
      await runBot(twitterClient, config, argv.flags);
    }
    
    logger.success('Bot execution completed');
    process.exit(0);
  } catch (error) {
    logger.error('Fatal error', error);
    process.exit(1);
  }
}

/**
 * Run a single bot cycle
 */
async function runBot(
  client: TwitterClient,
  config: Config,
  flags: any
): Promise<void> {
  logger.header('Processing Mentions');
  
  try {
    // Fetch mentions
    const mentions = await client.getMentions(
      flags.sinceMentionId,
      config.bot.maxMentionsPerBatch
    );
    
    if (mentions.length === 0) {
      logger.info('No new mentions to process');
      return;
    }
    
    logger.info(`Found ${mentions.length} mentions to process`);
    
    if (flags.earlyExit) {
      logger.warn('Early exit flag set - skipping processing');
      return;
    }
    
    // TODO: Process mentions
    logger.warn('Mention processing not yet implemented');
    logger.info('Mentions:', mentions.map(m => ({
      id: m.id,
      text: m.text.substring(0, 50) + '...',
      author: m.authorUsername,
    })));
    
  } catch (error) {
    logger.error('Failed to process mentions', error);
    throw error;
  }
}

/**
 * Delay helper
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  logger.warn('\nReceived SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.warn('\nReceived SIGTERM, shutting down gracefully...');
  process.exit(0);
});

// Run the bot
main().catch((error) => {
  logger.error('Unhandled error', error);
  process.exit(1);
});
