/**
 * Logger utility for Throp bot
 * Provides structured logging with different levels and formatting
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
declare class Logger {
    private level;
    private prefix;
    constructor(prefix?: string);
    /**
     * Check if a log level should be output
     */
    private shouldLog;
    /**
     * Format a log message with timestamp and prefix
     */
    private formatMessage;
    /**
     * Log a debug message
     */
    debug(message: string, data?: any): void;
    /**
     * Log an info message
     */
    info(message: string, data?: any): void;
    /**
     * Log a warning message
     */
    warn(message: string, data?: any): void;
    /**
     * Log an error message
     */
    error(message: string, error?: Error | any): void;
    /**
     * Log a success message (always shown)
     */
    success(message: string, data?: any): void;
    /**
     * Create a child logger with additional prefix
     */
    child(prefix: string): Logger;
    /**
     * Log performance timing
     */
    time(label: string): () => void;
    /**
     * Log a progress update
     */
    progress(current: number, total: number, message?: string): void;
    /**
     * Create a visual progress bar
     */
    private createProgressBar;
    /**
     * Log a divider for visual separation
     */
    divider(): void;
    /**
     * Log a header for sections
     */
    header(title: string): void;
    /**
     * Log a table of data
     */
    table(headers: string[], rows: string[][]): void;
}
export declare const logger: Logger;
export { Logger };
export declare const debug: (message: string, data?: any) => void;
export declare const info: (message: string, data?: any) => void;
export declare const warn: (message: string, data?: any) => void;
export declare const error: (message: string, error?: Error | any) => void;
export declare const success: (message: string, data?: any) => void;
//# sourceMappingURL=logger.d.ts.map