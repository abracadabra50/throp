/**
 * REST API server for Throp bot
 * Provides endpoints for web interface integration
 */
/**
 * Create and configure the API server
 */
export declare class ApiServer {
    private app;
    private server;
    private io;
    private port;
    private twitterClient;
    private answerEngine;
    private cache;
    private startTime;
    constructor(port?: number);
    /**
     * Setup Express middleware
     */
    private setupMiddleware;
    /**
     * Setup API routes
     */
    private setupRoutes;
    /**
     * Setup WebSocket for real-time updates
     */
    private setupWebSocket;
    /**
     * Get server status
     */
    private getStatus;
    /**
     * Start the API server
     */
    start(): Promise<void>;
    /**
     * Stop the API server
     */
    stop(): Promise<void>;
}
/**
 * Create and export API server instance
 */
export declare function createApiServer(port?: number): ApiServer;
//# sourceMappingURL=server.d.ts.map