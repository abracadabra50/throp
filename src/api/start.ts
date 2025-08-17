#!/usr/bin/env node

/**
 * Start script for the Throp API server
 * Provides REST API and WebSocket endpoints for web interface
 */

import { createApiServer } from './server.js';
import { logger } from '../utils/logger.js';
import { getConfig } from '../config.js';
import chalk from 'chalk';

/**
 * ASCII art banner for API server
 */
const showBanner = () => {
  console.log(chalk.magenta(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║  ████████╗██╗  ██╗██████╗  ██████╗ ██████╗              ║
║  ╚══██╔══╝██║  ██║██╔══██╗██╔═══██╗██╔══██╗             ║
║     ██║   ███████║██████╔╝██║   ██║██████╔╝             ║
║     ██║   ██╔══██║██╔══██╗██║   ██║██╔═══╝              ║
║     ██║   ██║  ██║██║  ██║╚██████╔╝██║        API       ║
║     ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═╝        SERVER    ║
║                                                           ║
║            REST API & WebSocket Server v0.2.0            ║
║                  Powered by Perplexity AI                ║
╚═══════════════════════════════════════════════════════════╝
`));
};

/**
 * Main function to start the API server
 */
async function main() {
  showBanner();
  
  try {
    // Load configuration
    logger.header('API Server Configuration');
    const config = getConfig();
    
    logger.info('Configuration loaded', {
      answerEngine: config.bot.answerEngine,
      redisEnabled: !!config.redis.url,
      perplexityModel: config.perplexity.model,
    });
    
    // Get port from environment or use default
    const port = parseInt(process.env.API_PORT || '3001', 10);
    
    // Create and start API server
    logger.header('Starting API Server');
    const server = createApiServer(port);
    
    await server.start();
    
    logger.divider();
    logger.success('🚀 API Server is running!');
    logger.info('');
    logger.info('📍 Endpoints:');
    logger.info(`   REST API:  ${chalk.cyan(`http://localhost:${port}`)}`);
    logger.info(`   WebSocket: ${chalk.cyan(`ws://localhost:${port}`)}`);
    logger.info(`   Health:    ${chalk.cyan(`http://localhost:${port}/health`)}`);
    logger.info(`   Status:    ${chalk.cyan(`http://localhost:${port}/api/status`)}`);
    logger.info('');
    logger.info('🌐 Frontend Integration:');
    logger.info(`   CORS Origin: ${chalk.yellow(process.env.FRONTEND_URL || 'http://localhost:3000')}`);
    logger.info('');
    logger.info('📝 Available Endpoints:');
    logger.table(
      ['Method', 'Path', 'Description'],
      [
        ['GET', '/health', 'Health check'],
        ['GET', '/api/status', 'Bot status and stats'],
        ['POST', '/api/chat', 'Chat with Throp'],
        ['GET', '/api/mentions', 'Get recent Twitter mentions'],
        ['POST', '/api/mentions/:id/process', 'Process specific mention'],
        ['GET', '/api/cache/interactions', 'Get cached interactions'],
        ['POST', '/api/cache/clear', 'Clear cache'],
      ]
    );
    logger.info('');
    logger.info('🔌 WebSocket Events:');
    logger.info('   - connection: Client connected');
    logger.info('   - chat: Send chat message');
    logger.info('   - response: Receive response');
    logger.info('   - status: Receive status updates');
    logger.info('   - new_response: Broadcast new responses');
    logger.divider();
    
  } catch (error) {
    logger.error('Failed to start API server', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  logger.warn('\nReceived SIGINT, shutting down API server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.warn('\nReceived SIGTERM, shutting down API server...');
  process.exit(0);
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled rejection at: ${promise}, reason: ${reason}`);
  process.exit(1);
});

// Start the server
main().catch((error) => {
  logger.error('Fatal error in API server', error);
  process.exit(1);
});
