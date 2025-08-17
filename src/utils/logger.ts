/**
 * Logger utility for Throp bot
 * Provides structured logging with different levels and formatting
 */

import chalk from 'chalk';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const LOG_COLORS = {
  debug: chalk.gray,
  info: chalk.cyan,
  warn: chalk.yellow,
  error: chalk.red,
};

const LOG_ICONS = {
  debug: '🔍',
  info: 'ℹ️ ',
  warn: '⚠️ ',
  error: '❌',
};

class Logger {
  private level: LogLevel = 'info';
  private prefix: string = '';

  constructor(prefix?: string) {
    this.prefix = prefix || '';
    
    // Set log level from environment directly to avoid config dependency
    this.level = (process.env.LOG_LEVEL as LogLevel) || 'info';
  }

  /**
   * Check if a log level should be output
   */
  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.level];
  }

  /**
   * Format a log message with timestamp and prefix
   */
  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const levelStr = level.toUpperCase().padEnd(5);
    const prefixStr = this.prefix ? `[${this.prefix}] ` : '';
    
    let output = `${chalk.gray(timestamp)} ${LOG_ICONS[level]} ${LOG_COLORS[level](levelStr)} ${prefixStr}${message}`;
    
    if (data !== undefined) {
      if (typeof data === 'object') {
        output += '\n' + chalk.gray(JSON.stringify(data, null, 2));
      } else {
        output += ' ' + chalk.gray(String(data));
      }
    }
    
    return output;
  }

  /**
   * Log a debug message
   */
  debug(message: string, data?: any): void {
    if (this.shouldLog('debug')) {
      console.log(this.formatMessage('debug', message, data));
    }
  }

  /**
   * Log an info message
   */
  info(message: string, data?: any): void {
    if (this.shouldLog('info')) {
      console.log(this.formatMessage('info', message, data));
    }
  }

  /**
   * Log a warning message
   */
  warn(message: string, data?: any): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, data));
    }
  }

  /**
   * Log an error message
   */
  error(message: string, error?: Error | any): void {
    if (this.shouldLog('error')) {
      let errorData: any;
      
      if (error instanceof Error) {
        errorData = {
          message: error.message,
          stack: error.stack,
          name: error.name,
        };
      } else {
        errorData = error;
      }
      
      console.error(this.formatMessage('error', message, errorData));
    }
  }

  /**
   * Log a success message (always shown)
   */
  success(message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    const prefixStr = this.prefix ? `[${this.prefix}] ` : '';
    let output = `${chalk.gray(timestamp)} ✅ ${chalk.green('SUCCESS')} ${prefixStr}${message}`;
    
    if (data !== undefined) {
      if (typeof data === 'object') {
        output += '\n' + chalk.gray(JSON.stringify(data, null, 2));
      } else {
        output += ' ' + chalk.gray(String(data));
      }
    }
    
    console.log(output);
  }

  /**
   * Create a child logger with additional prefix
   */
  child(prefix: string): Logger {
    const childPrefix = this.prefix ? `${this.prefix}:${prefix}` : prefix;
    return new Logger(childPrefix);
  }

  /**
   * Log performance timing
   */
  time(label: string): () => void {
    const start = Date.now();
    this.debug(`${label} started`);
    
    return () => {
      const duration = Date.now() - start;
      this.debug(`${label} completed`, { duration: `${duration}ms` });
    };
  }

  /**
   * Log a progress update
   */
  progress(current: number, total: number, message?: string): void {
    const percentage = Math.round((current / total) * 100);
    const progressBar = this.createProgressBar(percentage);
    
    const msg = message 
      ? `${message} ${progressBar} ${current}/${total} (${percentage}%)`
      : `Progress: ${progressBar} ${current}/${total} (${percentage}%)`;
    
    this.info(msg);
  }

  /**
   * Create a visual progress bar
   */
  private createProgressBar(percentage: number): string {
    const width = 20;
    const filled = Math.round((percentage / 100) * width);
    const empty = width - filled;
    
    return chalk.green('█'.repeat(filled)) + chalk.gray('░'.repeat(empty));
  }

  /**
   * Log a divider for visual separation
   */
  divider(): void {
    console.log(chalk.gray('─'.repeat(80)));
  }

  /**
   * Log a header for sections
   */
  header(title: string): void {
    this.divider();
    console.log(chalk.bold.cyan(`  ${title.toUpperCase()}`));
    this.divider();
  }

  /**
   * Log a table of data
   */
  table(headers: string[], rows: string[][]): void {
    const columnWidths = headers.map((header, index) => {
      const maxRowWidth = Math.max(...rows.map(row => row[index]?.length || 0));
      return Math.max(header.length, maxRowWidth) + 2;
    });
    
    // Print headers
    const headerRow = headers.map((header, index) => 
      header.padEnd(columnWidths[index])
    ).join('│');
    
    console.log(chalk.bold(headerRow));
    console.log(chalk.gray('─'.repeat(headerRow.length)));
    
    // Print rows
    rows.forEach(row => {
      const formattedRow = row.map((cell, index) => 
        (cell || '').padEnd(columnWidths[index])
      ).join('│');
      console.log(formattedRow);
    });
  }
}

// Export singleton logger
export const logger = new Logger();

// Export Logger class for creating child loggers
export { Logger };

// Convenience exports
export const debug = logger.debug.bind(logger);
export const info = logger.info.bind(logger);
export const warn = logger.warn.bind(logger);
export const error = logger.error.bind(logger);
export const success = logger.success.bind(logger);
