#!/usr/bin/env tsx
/**
 * CLI for proactive tweeting with Throp
 * Send prompts to generate and post chaotic tweets
 */
import { cli } from 'cleye';
import chalk from 'chalk';
import { config as loadEnv } from 'dotenv';
import { createHybridClaudeEngine } from '../src/engines/hybrid-claude.js';
import { TwitterClient } from '../src/twitter/client.js';
import { getRedisCache } from '../src/cache/redis.js';
import readline from 'readline';
// Load environment
loadEnv();
// ASCII art for tweet mode
const showBanner = () => {
    console.log(chalk.magenta(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║  🐦 THROP TWEET MODE                                     ║
║     lowercase chaos energy ACTIVATED                      ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`));
};
// Parse CLI arguments
const argv = cli({
    name: 'tweet',
    version: '0.2.1',
    description: 'Generate and post proactive tweets with Throp',
    flags: {
        prompt: {
            type: String,
            alias: 'p',
            description: 'Tweet prompt or topic',
        },
        thread: {
            type: Boolean,
            alias: 't',
            description: 'Generate a thread instead of single tweet',
            default: false,
        },
        maxTweets: {
            type: Number,
            alias: 'm',
            description: 'Maximum tweets in thread',
            default: 5,
        },
        dryRun: {
            type: Boolean,
            alias: 'd',
            description: 'Preview without posting',
            default: process.env.DRY_RUN === 'true',
        },
        react: {
            type: String,
            alias: 'r',
            description: 'React to a trending topic',
        },
        sentiment: {
            type: String,
            alias: 's',
            description: 'Sentiment for reaction (bullish/bearish/neutral)',
            default: 'neutral',
        },
        interactive: {
            type: Boolean,
            alias: 'i',
            description: 'Interactive mode for continuous tweeting',
            default: false,
        },
        chaos: {
            type: Number,
            alias: 'c',
            description: 'Chaos level (1-5)',
            default: 3,
        },
    },
});
/**
 * Main execution
 */
async function main() {
    showBanner();
    try {
        // Check for Twitter credentials
        if (!process.env.TWITTER_API_KEY && !argv.flags.dryRun) {
            console.log(chalk.yellow('⚠️  No Twitter credentials found'));
            console.log(chalk.cyan('Running in dry-run mode (preview only)'));
            argv.flags.dryRun = true;
        }
        // Initialize services
        const engine = createHybridClaudeEngine();
        let twitterClient = null;
        if (!argv.flags.dryRun) {
            try {
                twitterClient = new TwitterClient();
                console.log(chalk.green('✅ Connected to Twitter'));
            }
            catch (error) {
                console.log(chalk.yellow('⚠️  Twitter connection failed, running in dry-run mode'));
                argv.flags.dryRun = true;
            }
        }
        const cache = getRedisCache();
        await cache.connect();
        // Interactive mode
        if (argv.flags.interactive) {
            console.log(chalk.cyan('\n📝 Interactive Tweet Mode'));
            console.log(chalk.gray('Type your prompts, "thread: <prompt>" for threads, or "exit" to quit\n'));
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout,
                prompt: chalk.magenta('throp> '),
            });
            rl.prompt();
            rl.on('line', async (input) => {
                const line = input.trim();
                if (line === 'exit' || line === 'quit') {
                    console.log(chalk.yellow('\ngoodbye,,, probably nothing'));
                    process.exit(0);
                }
                if (line.startsWith('thread:')) {
                    // Generate thread
                    const prompt = line.substring(7).trim();
                    await generateThread(engine, twitterClient, prompt, argv.flags.maxTweets, argv.flags.dryRun);
                }
                else if (line.startsWith('react:')) {
                    // React to topic
                    const topic = line.substring(6).trim();
                    await reactToTopic(engine, twitterClient, topic, 'neutral', argv.flags.dryRun);
                }
                else if (line) {
                    // Single tweet
                    await generateSingleTweet(engine, twitterClient, line, argv.flags.dryRun);
                }
                rl.prompt();
            });
            rl.on('close', () => {
                console.log(chalk.yellow('\nctrl+c detected,,, rage quit successful'));
                process.exit(0);
            });
        }
        else if (argv.flags.react) {
            // React to trending topic
            await reactToTopic(engine, twitterClient, argv.flags.react, argv.flags.sentiment, argv.flags.dryRun);
        }
        else if (argv.flags.prompt) {
            // Generate from prompt
            if (argv.flags.thread) {
                await generateThread(engine, twitterClient, argv.flags.prompt, argv.flags.maxTweets, argv.flags.dryRun);
            }
            else {
                await generateSingleTweet(engine, twitterClient, argv.flags.prompt, argv.flags.dryRun);
            }
        }
        else {
            // No prompt provided, show examples
            console.log(chalk.cyan('\n💡 Usage Examples:\n'));
            console.log(chalk.gray('  # Single tweet'));
            console.log('  tweet -p "why is javascript like this"');
            console.log('');
            console.log(chalk.gray('  # Thread (max 5 tweets)'));
            console.log('  tweet -p "explain web3" --thread');
            console.log('');
            console.log(chalk.gray('  # React to trending topic'));
            console.log('  tweet -r "Bitcoin" -s bullish');
            console.log('');
            console.log(chalk.gray('  # Interactive mode'));
            console.log('  tweet -i');
            console.log('');
            console.log(chalk.gray('  # Actually post (not dry run)'));
            console.log('  tweet -p "gm" --no-dry-run');
            console.log('');
        }
    }
    catch (error) {
        console.error(chalk.red('❌ Error:'), error);
        process.exit(1);
    }
}
/**
 * Generate a single tweet
 */
async function generateSingleTweet(engine, client, prompt, dryRun) {
    console.log(chalk.cyan('\n🎯 Generating tweet...'));
    const tweet = await engine.generateProactiveTweet(prompt);
    console.log(chalk.green('\n✨ Generated Tweet:'));
    console.log(chalk.white.bgBlack(`\n  ${tweet}\n`));
    console.log(chalk.gray(`  Length: ${tweet.length}/280 characters`));
    if (!dryRun && client) {
        console.log(chalk.yellow('\n📤 Posting to Twitter...'));
        const posted = await client.tweet(tweet);
        console.log(chalk.green('✅ Posted successfully!'));
        console.log(chalk.cyan(`🔗 https://twitter.com/throp/status/${posted.id}`));
    }
    else {
        console.log(chalk.gray('\n[DRY RUN] Tweet not posted'));
    }
}
/**
 * Generate a thread
 */
async function generateThread(engine, client, prompt, maxTweets, dryRun) {
    console.log(chalk.cyan(`\n🧵 Generating thread (max ${maxTweets} tweets)...`));
    const tweets = await engine.generateProactiveThread(prompt, maxTweets);
    console.log(chalk.green(`\n✨ Generated Thread (${tweets.length} tweets):\n`));
    tweets.forEach((tweet, index) => {
        console.log(chalk.cyan(`Tweet ${index + 1}:`));
        console.log(chalk.white.bgBlack(`  ${tweet}`));
        console.log(chalk.gray(`  Length: ${tweet.length}/280\n`));
    });
    if (!dryRun && client) {
        console.log(chalk.yellow('📤 Posting thread to Twitter...'));
        const posted = await client.postThread(tweets);
        console.log(chalk.green('✅ Thread posted successfully!'));
        console.log(chalk.cyan(`🔗 https://twitter.com/throp/status/${posted[0].id}`));
    }
    else {
        console.log(chalk.gray('[DRY RUN] Thread not posted'));
    }
}
/**
 * React to a trending topic
 */
async function reactToTopic(engine, client, topic, sentiment, dryRun) {
    console.log(chalk.cyan(`\n💬 Reacting to: ${topic} (${sentiment})`));
    const tweet = await engine.reactToTrend(topic, sentiment);
    console.log(chalk.green('\n✨ Reaction Tweet:'));
    console.log(chalk.white.bgBlack(`\n${tweet}\n`));
    console.log(chalk.gray(`Length: ${tweet.length} characters`));
    if (!dryRun && client) {
        console.log(chalk.yellow('\n📤 Posting reaction...'));
        const posted = await client.tweet(tweet);
        console.log(chalk.green('✅ Posted successfully!'));
        console.log(chalk.cyan(`🔗 https://twitter.com/throp/status/${posted.id}`));
    }
    else {
        console.log(chalk.gray('\n[DRY RUN] Reaction not posted'));
    }
}
// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log(chalk.yellow('\n\nshutting down,,, it was fun while it lasted'));
    process.exit(0);
});
// Run the CLI
main().catch((error) => {
    console.error(chalk.red('fatal error,,, this is bad'), error);
    process.exit(1);
});
//# sourceMappingURL=tweet.js.map