/**
 * Throp Orchestrator - Production version using Anthropic's web search tool
 * Integrates with existing Twitter credentials and GeckoTerminal free API
 */
import Anthropic from '@anthropic-ai/sdk';
import { logger } from '../utils/logger.js';
import { getTwitterSearch } from '../twitter/twitter-search.js';
import { TwitterClient } from '../twitter/client.js';
import { GeckoTerminalTool } from './tools/gecko-terminal.js';
import { ResponseGenerator } from './response-generator.js';
/**
 * Production orchestrator using real APIs
 */
export class ThropProductionOrchestrator {
    anthropic;
    twitterSearch = getTwitterSearch();
    twitterClient = null;
    gecko;
    responseGenerator;
    model;
    constructor() {
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
            throw new Error('ANTHROPIC_API_KEY is required for orchestrator');
        }
        this.anthropic = new Anthropic({ apiKey });
        // Initialize Twitter client with existing credentials
        try {
            this.twitterClient = new TwitterClient();
            logger.info('Twitter client initialized for orchestrator');
        }
        catch (error) {
            logger.warn('Twitter client not available, some features disabled', error);
        }
        this.gecko = new GeckoTerminalTool();
        this.responseGenerator = new ResponseGenerator();
        // Use production model
        this.model = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';
        logger.info('Production orchestrator initialized', { model: this.model });
    }
    /**
     * Main processing pipeline
     */
    async process(input, context) {
        logger.info('Production orchestrator processing', { input: input.substring(0, 100) });
        try {
            // Step 1: Analyze intent and gather evidence
            const evidence = await this.gatherEvidence(input);
            logger.info('Evidence gathered', {
                intent: evidence.intent,
                domain: evidence.domain,
                confidence: evidence.confidence,
                facts: evidence.evidence.key_facts.length
            });
            // Step 2: Handle disambiguation if needed
            if (evidence.needs_disambiguation) {
                return this.handleDisambiguation(evidence);
            }
            // Step 3: Generate dynamic response
            const response = await this.responseGenerator.generateResponse(evidence);
            return {
                text: response,
                confidence: evidence.confidence,
                citations: evidence.evidence.sources,
                metadata: {
                    intent: evidence.intent,
                    domain: evidence.domain,
                    sources: evidence.evidence.sources,
                    orchestrator: 'production'
                }
            };
        }
        catch (error) {
            logger.error('Production orchestrator failed', error);
            return {
                text: "skill issue on my end... try again or touch grass idk",
                confidence: 0.1,
                metadata: { error: true, orchestrator: 'production' }
            };
        }
    }
    /**
     * Gather evidence using Claude with tools
     */
    async gatherEvidence(input) {
        const tools = this.getToolDefinitions();
        const systemPrompt = `You are an evidence gatherer for Throp. Analyze the input and gather relevant evidence using available tools.

PROCESS:
1. Classify the intent (identity, crypto_price, tech_news, drama, gaming, general)
2. Classify the domain (crypto, tech, gaming, streaming, academic, fitness, food, general)
3. Use tools to gather evidence
4. Return structured evidence

INTENTS:
- identity: "who is X", "@username", person queries
- crypto_price: "$TOKEN", "price of X", "how is bitcoin"
- tech_news: "what did X announce", "latest tech"
- drama: "drama", "tea", "beef", "controversy"
- gaming: "game", "patch", "esports"
- general: everything else

DOMAINS:
- crypto: cryptocurrency, DeFi, NFTs
- tech: AI, startups, big tech companies
- gaming: video games, esports, streamers
- streaming: Twitch, YouTube creators
- academic: science, research, education
- fitness: health, gym, sports
- food: cooking, restaurants, nutrition
- general: everything else

Return evidence in this format:
{
  "intent": "category",
  "domain": "category", 
  "confidence": 0.8,
  "needs_disambiguation": false,
  "evidence": {
    "key_facts": ["fact1", "fact2"],
    "sources": ["url1", "url2"],
    "context": {}
  }
}`;
        try {
            const response = await this.anthropic.messages.create({
                model: this.model,
                max_tokens: 2000,
                temperature: 0.3,
                system: systemPrompt,
                messages: [{ role: 'user', content: input }],
                tools
            });
            // Parse response and extract evidence
            let evidenceText = '';
            const sources = [];
            for (const content of response.content) {
                if (content.type === 'text') {
                    evidenceText += content.text + '\n';
                }
                else if (content.type === 'tool_use') {
                    // Handle tool results
                    logger.info(`Tool used: ${content.name}`);
                }
            }
            // Try to parse structured evidence from response
            const evidence = this.parseEvidence(evidenceText, input);
            return evidence;
        }
        catch (error) {
            logger.error('Evidence gathering failed', error);
            return this.getFallbackEvidence(input);
        }
    }
    /**
     * Parse evidence from Claude's response
     */
    parseEvidence(text, input) {
        try {
            // Try to find JSON in the response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return {
                    intent: parsed.intent || 'general',
                    domain: parsed.domain || 'general',
                    confidence: parsed.confidence || 0.7,
                    needs_disambiguation: parsed.needs_disambiguation || false,
                    evidence: {
                        key_facts: parsed.evidence?.key_facts || [text.substring(0, 200)],
                        sources: parsed.evidence?.sources || [],
                        context: parsed.evidence?.context || {}
                    }
                };
            }
        }
        catch (error) {
            logger.warn('Failed to parse structured evidence', error);
        }
        // Fallback to basic analysis
        return this.getFallbackEvidence(input, text);
    }
    /**
     * Get fallback evidence when parsing fails
     */
    getFallbackEvidence(input, text) {
        const lower = input.toLowerCase();
        let intent = 'general';
        let domain = 'general';
        // Basic intent detection
        if (lower.includes('who is') || lower.includes('@') || lower.includes('who\'s')) {
            intent = 'identity';
        }
        else if (lower.includes('$') || lower.includes('price') || lower.includes('bitcoin') || lower.includes('crypto')) {
            intent = 'crypto_price';
            domain = 'crypto';
        }
        else if (lower.includes('drama') || lower.includes('tea') || lower.includes('beef')) {
            intent = 'drama';
        }
        else if (lower.includes('game') || lower.includes('patch') || lower.includes('esports')) {
            intent = 'gaming';
            domain = 'gaming';
        }
        else if (lower.includes('ai') || lower.includes('tech') || lower.includes('openai')) {
            intent = 'tech_news';
            domain = 'tech';
        }
        return {
            intent,
            domain,
            confidence: 0.6,
            needs_disambiguation: false,
            evidence: {
                key_facts: text ? [text.substring(0, 200)] : [`Query about: ${input}`],
                sources: [],
                context: { fallback: true }
            }
        };
    }
    /**
     * Handle disambiguation when multiple matches found
     */
    handleDisambiguation(evidence) {
        const options = evidence.disambiguation_options || [];
        const optionsList = options.slice(0, 3).map((opt, i) => `${i + 1}. ${opt}`).join('\n');
        return {
            text: `multiple matches found, which one?\n\n${optionsList}\n\nbe more specific next time bestie`,
            confidence: 0.8,
            metadata: {
                intent: evidence.intent,
                domain: evidence.domain,
                disambiguation: true,
                orchestrator: 'production'
            }
        };
    }
    /**
     * Get tool definitions for Claude
     */
    getToolDefinitions() {
        const tools = [];
        // Web search tool (built into Claude)
        tools.push({
            type: "web_search_20250305",
            name: "web_search",
            max_uses: 3
        });
        // Twitter search tool (if available)
        if (this.twitterClient) {
            tools.push({
                type: "function",
                name: "search_twitter",
                description: "Search Twitter/X for recent posts about a topic",
                parameters: {
                    type: "object",
                    properties: {
                        query: {
                            type: "string",
                            description: "Search query for Twitter"
                        },
                        limit: {
                            type: "number",
                            description: "Number of tweets to return (max 10)",
                            default: 5
                        }
                    },
                    required: ["query"]
                }
            });
        }
        // Crypto price tool
        tools.push({
            type: "function",
            name: "get_crypto_price",
            description: "Get current cryptocurrency price and market data",
            parameters: {
                type: "object",
                properties: {
                    symbol: {
                        type: "string",
                        description: "Cryptocurrency symbol (e.g., BTC, ETH, SOL)"
                    }
                },
                required: ["symbol"]
            }
        });
        return tools;
    }
}
/**
 * Factory function
 */
export function createProductionOrchestrator() {
    return new ThropProductionOrchestrator();
}
//# sourceMappingURL=orchestrator-production.js.map