#!/usr/bin/env node
/**
 * Quote Tweet Monitor CLI
 * Monitor specific accounts and quote tweet them with chaos
 */
import { cli } from 'cleye';
import chalk from 'chalk';
import { config as loadEnv } from 'dotenv';
import { QuoteTweetMonitor } from '../src/twitter/quote-monitor.js';
import { logger } from '../src/utils/logger.js';
// Load environment
loadEnv();
const argv = cli({
    name: 'monitor-quotes',
    version: '1.0.0',
    parameters: [
        '[accounts...]',
    ],
    flags: {
        interval: {
            type: Number,
            alias: 'i',
            description: 'Check interval in minutes',
            default: 5,
        },
        minEngagement: {
            type: Number,
            alias: 'e',
            description: 'Minimum engagement (likes + RTs) to quote',
            default: 100,
        },
        maxPerHour: {
            type: Number,
            alias: 'm',
            description: 'Maximum quotes per hour',
            default: 5,
        },
        keywords: {
            type: [String],
            alias: 'k',
            description: 'Keywords to filter tweets (optional)',
        },
        test: {
            type: Boolean,
            alias: 't',
            description: 'Test mode - log but don\'t post',
            default: false,
        },
    },
    help: {
        examples: [
            '# Monitor specific accounts',
            'monitor-quotes elonmusk CZ_Binance --interval 10',
            '',
            '# Monitor with keywords',
            'monitor-quotes VitalikButerin --keywords ethereum crypto',
            '',
            '# High engagement only',
            'monitor-quotes coinbase --min-engagement 1000',
            '',
            '# Test mode',
            'monitor-quotes naval --test',
        ],
    },
});
async function main() {
    console.log(chalk.cyan(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║  🔄 THROP QUOTE MONITOR                                  ║
║     Watching for tweets to roast                         ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `));
    // Get accounts from args or use defaults
    const accounts = argv._.accounts && argv._.accounts.length > 0
        ? argv._.accounts
        : [
            'elonmusk',
            'VitalikButerin',
            'CZ_Binance',
            'SBF_FTX', // lol
            'naval',
            'balajis',
            'cdixon',
            'garyvee',
            'APompliano',
            'Cobratate',
        ];
    if (argv.flags.test) {
        console.log(chalk.yellow('🧪 TEST MODE - Quotes will not be posted'));
    }
    // Rate limit warning for basic plan
    console.log(chalk.yellow('\n⚠️  RATE LIMIT WARNING'));
    console.log(chalk.gray('  Basic Twitter API plan has strict limits:'));
    console.log(chalk.gray('  - 75 second delay between API calls'));
    console.log(chalk.gray('  - 15 minute backoff on rate limit errors'));
    console.log(chalk.gray('  - Consider upgrading to Pro for better performance'));
    console.log(chalk.white('\n📊 Configuration:'));
    console.log(chalk.gray(`  Accounts: ${accounts.join(', ')}`));
    console.log(chalk.gray(`  Check Interval: ${argv.flags.interval} minutes`));
    console.log(chalk.gray(`  Min Engagement: ${argv.flags.minEngagement}`));
    console.log(chalk.gray(`  Max Per Hour: ${argv.flags.maxPerHour}`));
    if (argv.flags.keywords) {
        console.log(chalk.gray(`  Keywords: ${argv.flags.keywords.join(', ')}`));
    }
    console.log(chalk.white('\n🚀 Starting monitor...\n'));
    try {
        // If test mode, override the Twitter client
        if (argv.flags.test) {
            process.env.DRY_RUN = 'true';
        }
        const monitor = new QuoteTweetMonitor({
            accounts,
            checkInterval: argv.flags.interval * 60 * 1000,
            minEngagement: argv.flags.minEngagement,
            maxQuotesPerHour: argv.flags.maxPerHour,
            keywords: argv.flags.keywords,
        });
        await monitor.start();
        // Handle graceful shutdown
        process.on('SIGINT', () => {
            console.log(chalk.yellow('\n\n⚠️  Shutting down monitor...'));
            monitor.stop();
            process.exit(0);
        });
        process.on('SIGTERM', () => {
            monitor.stop();
            process.exit(0);
        });
        // Keep the process alive
        console.log(chalk.green('✅ Monitor is running. Press Ctrl+C to stop.\n'));
        // Log status every minute
        setInterval(() => {
            const now = new Date().toLocaleTimeString();
            console.log(chalk.dim(`[${now}] Monitor active - watching ${accounts.length} accounts`));
        }, 60000);
    }
    catch (error) {
        logger.error('Failed to start quote monitor', error);
        console.error(chalk.red('\n❌ Failed to start monitor'));
        console.error(error);
        process.exit(1);
    }
}
// Run the monitor
main().catch(error => {
    console.error(chalk.red('Fatal error:'), error);
    process.exit(1);
});
//# sourceMappingURL=monitor-quotes.js.map