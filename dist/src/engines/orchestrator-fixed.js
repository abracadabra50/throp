/**
 * Throp Orchestrator - Fixed version with better error handling
 * Production-ready with Anthropic web search, Twitter, and GeckoTerminal
 */
import Anthropic from '@anthropic-ai/sdk';
import { logger } from '../utils/logger.js';
import { getTwitterSearch } from '../twitter/twitter-search.js';
import { TwitterClient } from '../twitter/client.js';
import { GeckoTerminalTool } from './tools/gecko-terminal.js';
import { ResponseGenerator } from './response-generator.js';
/**
 * Fixed production orchestrator
 */
export class ThropFixedOrchestrator {
    anthropic;
    twitterSearch = getTwitterSearch();
    twitterClient = null;
    gecko;
    responseGenerator;
    model;
    twitterEnabled = false;
    constructor() {
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
            throw new Error('ANTHROPIC_API_KEY is required for orchestrator');
        }
        this.anthropic = new Anthropic({ apiKey });
        // Initialize Twitter client with graceful fallback
        try {
            this.twitterClient = new TwitterClient();
            this.twitterEnabled = true;
            logger.info('Twitter client initialized for orchestrator');
        }
        catch (error) {
            logger.warn('Twitter client not available, continuing without Twitter features', { error: error.message });
            this.twitterEnabled = false;
        }
        this.gecko = new GeckoTerminalTool();
        this.responseGenerator = new ResponseGenerator();
        // Use production model
        this.model = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';
        logger.info('Fixed orchestrator initialized', { model: this.model, twitterEnabled: this.twitterEnabled });
    }
    /**
     * Main processing pipeline
     */
    async process(input, context) {
        logger.info('Fixed orchestrator processing', { input: input.substring(0, 100) });
        try {
            // Step 1: Analyze intent and gather evidence
            const evidence = await this.gatherEvidence(input);
            logger.info('Evidence gathered', {
                intent: evidence.intent,
                domain: evidence.domain,
                facts: evidence.evidence.key_facts.length,
                confidence: evidence.confidence
            });
            // Step 2: Generate response using evidence
            const response = await this.responseGenerator.generateResponse(evidence);
            return {
                text: response,
                confidence: evidence.confidence,
                metadata: {
                    intent: evidence.intent,
                    domain: evidence.domain,
                    sources: evidence.evidence.sources,
                    tool_calls: evidence.evidence.key_facts.length > 0 ? 'used' : 'none',
                    twitter_enabled: this.twitterEnabled
                }
            };
        }
        catch (error) {
            logger.error('Fixed orchestrator failed', error);
            return {
                text: "skill issue on my end... try again or touch grass idk",
                confidence: 0.1,
                metadata: { error: true }
            };
        }
    }
    /**
     * Gather evidence using Claude with built-in web search and APIs
     */
    async gatherEvidence(input) {
        // Step 1: Analyze query intent
        const { intent, domain, needsTools } = this.analyzeQuery(input);
        const evidence = {
            intent,
            domain,
            query: input,
            evidence: {
                key_facts: [],
                sources: []
            },
            confidence: 0.7,
            needs_disambiguation: false
        };
        // Step 2: If we don't need tools, return early
        if (!needsTools || intent === 'pure_chaos') {
            evidence.confidence = 0.8;
            return evidence;
        }
        // Step 3: Gather evidence based on intent and domain
        try {
            switch (intent) {
                case 'identity':
                    await this.gatherIdentityEvidence(input, evidence);
                    break;
                case 'market':
                    if (domain === 'crypto') {
                        await this.gatherCryptoEvidence(input, evidence);
                    }
                    else {
                        await this.gatherWebEvidence(input, evidence);
                    }
                    break;
                case 'drama':
                case 'gaming':
                case 'tech':
                case 'culture':
                    await this.gatherCurrentEvidence(input, evidence);
                    break;
                case 'explainer':
                    await this.gatherWebEvidence(input, evidence);
                    break;
                default:
                    // For other intents, just use web search
                    await this.gatherWebEvidence(input, evidence);
            }
            // Update confidence based on evidence quality
            if (evidence.evidence.key_facts.length > 2) {
                evidence.confidence = 0.9;
            }
            else if (evidence.evidence.key_facts.length > 0) {
                evidence.confidence = 0.8;
            }
        }
        catch (error) {
            logger.error('Evidence gathering failed', error);
        }
        return evidence;
    }
    /**
     * Analyze query to determine intent and domain
     */
    analyzeQuery(query) {
        const lower = query.toLowerCase();
        // Identity detection
        if (lower.includes('who is') || lower.includes('who\'s') || lower.includes('@')) {
            return {
                intent: 'identity',
                domain: lower.includes('crypto') || lower.includes('token') || lower.includes('defi') ? 'crypto' : 'general',
                needsTools: true
            };
        }
        // Crypto market detection - improved token detection
        if (lower.includes('price') || lower.includes('$') ||
            lower.includes('bitcoin') || lower.includes('btc') ||
            lower.includes('ethereum') || lower.includes('eth') ||
            lower.includes('solana') || lower.includes('sol') ||
            lower.includes('token') || lower.includes('coin') || lower.includes('crypto')) {
            return {
                intent: 'market',
                domain: 'crypto',
                needsTools: true
            };
        }
        // Gaming detection
        if (lower.includes('game') || lower.includes('fortnite') || lower.includes('valorant') ||
            lower.includes('patch') || lower.includes('esports') || lower.includes('steam')) {
            return {
                intent: 'gaming',
                domain: 'gaming',
                needsTools: true
            };
        }
        // Tech detection
        if (lower.includes('ai') || lower.includes('openai') || lower.includes('tech') ||
            lower.includes('javascript') || lower.includes('programming') || lower.includes('app')) {
            return {
                intent: 'tech',
                domain: 'tech',
                needsTools: true
            };
        }
        // Drama detection
        if (lower.includes('drama') || lower.includes('latest') || lower.includes('happening') ||
            lower.includes('tea') || lower.includes('twitter') || lower.includes('discourse')) {
            return {
                intent: 'drama',
                domain: 'general',
                needsTools: true
            };
        }
        // Explainer detection
        if (lower.includes('what is') || lower.includes('how does') || lower.includes('explain') ||
            lower.includes('why') || lower.includes('how to')) {
            return {
                intent: 'explainer',
                domain: 'general',
                needsTools: true
            };
        }
        // Default to chaos
        return {
            intent: 'pure_chaos',
            domain: 'general',
            needsTools: false
        };
    }
    /**
     * Gather identity evidence using web search + Twitter
     */
    async gatherIdentityEvidence(query, evidence) {
        const promises = [];
        // Extract handle if present
        const handleMatch = query.match(/@(\w+)/);
        const handle = handleMatch ? handleMatch[1] : null;
        // Web search for general info
        promises.push(this.searchWeb(query, evidence));
        // Twitter search for profile/tweets (only if enabled)
        if (this.twitterEnabled) {
            if (handle) {
                promises.push(this.searchTwitterProfile(handle, evidence));
            }
            else {
                promises.push(this.searchTwitter(query, evidence));
            }
        }
        // Execute searches in parallel
        await Promise.all(promises);
    }
    /**
     * Gather crypto evidence using GeckoTerminal + web search
     */
    async gatherCryptoEvidence(query, evidence) {
        const promises = [];
        // Improved token extraction
        let token = null;
        // Check for specific token patterns
        if (query.toLowerCase().includes('sol') || query.toLowerCase().includes('solana')) {
            token = 'solana';
        }
        else if (query.toLowerCase().includes('btc') || query.toLowerCase().includes('bitcoin')) {
            token = 'bitcoin';
        }
        else if (query.toLowerCase().includes('eth') || query.toLowerCase().includes('ethereum')) {
            token = 'ethereum';
        }
        else {
            // Try to extract token symbol with $ or uppercase
            const tokenMatch = query.match(/\$([A-Z]{2,10})\b/i) || query.match(/\b([A-Z]{2,10})\b/) || query.match(/\b(cardano|polygon|dogecoin|chainlink)\b/i);
            token = tokenMatch ? tokenMatch[1] : null;
        }
        if (token) {
            // Get price data from GeckoTerminal
            promises.push(this.getCryptoPrice(token, evidence));
        }
        // Web search for context
        promises.push(this.searchWeb(query, evidence));
        await Promise.all(promises);
    }
    /**
     * Gather current events evidence using web search + Twitter
     */
    async gatherCurrentEvidence(query, evidence) {
        const promises = [
            this.searchWeb(query, evidence)
        ];
        // Add Twitter search if enabled
        if (this.twitterEnabled) {
            promises.push(this.searchTwitter(query, evidence));
        }
        await Promise.all(promises);
    }
    /**
     * Gather web evidence using Anthropic's web search
     */
    async gatherWebEvidence(query, evidence) {
        await this.searchWeb(query, evidence);
    }
    /**
     * Search web using Anthropic's built-in web search tool
     */
    async searchWeb(query, evidence) {
        try {
            logger.info('Searching web', { query });
            const response = await this.anthropic.messages.create({
                model: this.model,
                max_tokens: 1000,
                temperature: 0.3,
                tools: [{
                        type: "web_search_20250305",
                        name: "web_search",
                        max_uses: 3
                    }],
                messages: [{
                        role: 'user',
                        content: `Search for information about: ${query}`
                    }]
            });
            // Extract web search results and facts
            for (const content of response.content) {
                if (content.type === 'text' && content.text) {
                    // Extract key facts from the response
                    const sentences = content.text.split(/[.!?]+/).filter(s => s.trim().length > 20);
                    evidence.evidence.key_facts.push(...sentences.slice(0, 3).map(s => s.trim()));
                }
                // Extract citations if available
                if ('citations' in content && content.citations) {
                    for (const citation of content.citations) {
                        if ('url' in citation && citation.url) {
                            evidence.evidence.sources.push(citation.url);
                        }
                    }
                }
            }
            logger.info('Web search complete', {
                facts: evidence.evidence.key_facts.length,
                sources: evidence.evidence.sources.length
            });
        }
        catch (error) {
            logger.error('Web search failed', error);
        }
    }
    /**
     * Search Twitter using existing credentials (with graceful fallback)
     */
    async searchTwitter(query, evidence) {
        if (!this.twitterEnabled) {
            return;
        }
        try {
            logger.info('Searching Twitter', { query });
            const results = await this.twitterSearch.searchTweets(query, 5);
            if (results && results.tweets.length > 0) {
                evidence.evidence.twitter_data = { tweets: results };
                // Add top tweet as key fact
                const topTweet = results.tweets[0];
                evidence.evidence.key_facts.push(`Twitter: "${topTweet.text.substring(0, 100)}..." - @${topTweet.author}`);
                logger.info('Twitter search complete', { found: results.count });
            }
            else {
                logger.info('No Twitter results found', { query });
            }
        }
        catch (error) {
            logger.warn('Twitter search failed, skipping', { error: error.message });
            // Don't throw - continue without Twitter data
        }
    }
    /**
     * Search Twitter profile using existing credentials (with graceful fallback)
     */
    async searchTwitterProfile(handle, evidence) {
        if (!this.twitterEnabled || !this.twitterClient) {
            return;
        }
        try {
            logger.info('Getting Twitter profile', { handle });
            // Search for user tweets first
            const tweets = await this.twitterSearch.searchTweets(`from:${handle}`, 3);
            if (tweets && tweets.tweets.length > 0) {
                const tweet = tweets.tweets[0];
                evidence.evidence.twitter_data = { profile: { username: handle, tweets } };
                evidence.evidence.key_facts.push(`@${handle} on Twitter`, `Recent tweet: "${tweet.text.substring(0, 100)}..."`);
            }
            logger.info('Twitter profile search complete', { handle });
        }
        catch (error) {
            logger.warn('Twitter profile search failed, skipping', { error: error.message });
        }
    }
    /**
     * Get crypto price using GeckoTerminal free API
     */
    async getCryptoPrice(token, evidence) {
        try {
            logger.info('Getting crypto price', { token });
            const priceData = await this.gecko.getTokenPrice(token);
            if (priceData.price > 0) {
                evidence.evidence.price_data = priceData;
                evidence.evidence.key_facts.push(`${token.toUpperCase()} price: $${priceData.price}`, `24h change: ${priceData.price_change_24h > 0 ? '+' : ''}${priceData.price_change_24h.toFixed(2)}%`, `Volume: $${priceData.volume_24h.toLocaleString()}`);
                evidence.evidence.sources.push(priceData.chart_url);
                logger.info('Crypto price fetched', { token, price: priceData.price });
            }
        }
        catch (error) {
            logger.error('Crypto price fetch failed', error);
        }
    }
}
/**
 * Factory function
 */
export function createFixedOrchestrator() {
    return new ThropFixedOrchestrator();
}
//# sourceMappingURL=orchestrator-fixed.js.map