/**
 * Throp Orchestrator Final - Production-ready with proper model names
 * Understands all internet culture: crypto, gaming, streaming, tech, memes, and beyond
 */
import Anthropic from '@anthropic-ai/sdk';
import { logger } from '../utils/logger.js';
import { WebSearchTool } from './tools/web-search.js';
import { TwitterTool } from './tools/twitter-tools.js';
import { GeckoTerminalTool } from './tools/gecko-terminal.js';
import { ResponseGenerator } from './response-generator.js';
/**
 * Main orchestrator that coordinates Throp's response generation
 */
export class ThropOrchestrator {
    anthropic;
    webSearch;
    twitter;
    gecko;
    responseGenerator;
    model;
    constructor() {
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
            throw new Error('ANTHROPIC_API_KEY is required for orchestrator');
        }
        this.anthropic = new Anthropic({ apiKey });
        this.webSearch = new WebSearchTool();
        this.twitter = new TwitterTool();
        this.gecko = new GeckoTerminalTool();
        this.responseGenerator = new ResponseGenerator();
        // Use the same model as production or fallback to a valid one
        this.model = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';
        logger.info('Orchestrator using model', { model: this.model });
    }
    /**
     * Main processing pipeline
     */
    async process(input, context) {
        logger.info('Orchestrator processing input', { input: input.substring(0, 100) });
        try {
            // Step 1: Gather evidence using tools
            const evidence = await this.gatherEvidence(input);
            logger.info('Evidence gathered', {
                intent: evidence.intent,
                domain: evidence.domain,
                facts: evidence.evidence.key_facts.length,
                confidence: evidence.confidence
            });
            // Step 2: Handle disambiguation if needed
            if (evidence.needs_disambiguation) {
                return this.handleDisambiguation(evidence);
            }
            // Step 3: Generate dynamic response using LLM
            const response = await this.responseGenerator.generateResponse(evidence);
            return {
                text: response,
                confidence: evidence.confidence,
                metadata: {
                    intent: evidence.intent,
                    domain: evidence.domain,
                    sources: evidence.evidence.sources
                }
            };
        }
        catch (error) {
            logger.error('Orchestrator failed', error);
            return {
                text: "skill issue on my end... try again or touch grass idk",
                confidence: 0.1,
                metadata: { error: true }
            };
        }
    }
    /**
     * Gather evidence using Claude with tools
     */
    async gatherEvidence(input) {
        const tools = this.getToolDefinitions();
        const systemPrompt = `You are an AI assistant gathering information for Throp.
Your job is to determine the intent and domain of the query.

CRITICAL RULES:
1. For "who is X" queries → intent: identity
2. For price/token queries → intent: market, domain: crypto
3. For current events/drama → intent: drama
4. For gaming topics → intent: gaming, domain: gaming
5. For tech topics → intent: tech, domain: tech
6. For general questions → intent: explainer or pure_chaos

Identify the domain:
- crypto: tokens, DeFi, blockchain, NFTs
- gaming: games, esports, streamers, patches
- streaming: Twitch, YouTube, content creators
- tech: startups, AI, programming, tech companies
- academic: research, papers, university drama
- fitness: gym culture, supplements, influencers
- food: restaurants, cooking, food trends
- general: everything else

Respond with ONLY a JSON object, no other text:
{
  "intent": "identity|market|drama|gaming|tech|culture|explainer|roast|pure_chaos",
  "domain": "crypto|gaming|streaming|tech|academic|fitness|food|general",
  "query": "original query",
  "needs_tools": true/false,
  "confidence": 0.0-1.0
}`;
        try {
            // First pass: determine intent and whether we need tools
            const intentResponse = await this.anthropic.messages.create({
                model: 'claude-3-haiku-20240307', // Haiku is valid and cheap
                max_tokens: 200,
                temperature: 0.3,
                system: systemPrompt,
                messages: [{ role: 'user', content: `Analyze this query: "${input}"` }]
            });
            const intentText = intentResponse.content[0].type === 'text' ? intentResponse.content[0].text : '{}';
            // Extract JSON from the response
            let intentData;
            try {
                // Try to find JSON in the response
                const jsonMatch = intentText.match(/\{[\s\S]*?\}/);
                if (jsonMatch) {
                    intentData = JSON.parse(jsonMatch[0]);
                }
                else {
                    throw new Error('No JSON found in response');
                }
            }
            catch (parseError) {
                logger.warn('Failed to parse intent JSON, using fallback', { text: intentText.substring(0, 200) });
                // Fallback analysis based on keywords
                intentData = this.analyzeQueryFallback(input);
            }
            // If we don't need tools (pure opinion/chaos), return early
            if (!intentData.needs_tools || intentData.intent === 'pure_chaos') {
                return {
                    intent: intentData.intent || 'pure_chaos',
                    domain: intentData.domain || 'general',
                    query: input,
                    evidence: {
                        key_facts: [],
                        sources: []
                    },
                    confidence: 0.8,
                    needs_disambiguation: false
                };
            }
            // Second pass: use tools to gather evidence
            // For now, skip actual tool use since it needs more setup
            // In production, this would call tools to get real data
            logger.info('Would use tools here for:', { intent: intentData.intent, domain: intentData.domain });
            // Return evidence structure without actual tool calls for now
            return {
                intent: intentData.intent,
                domain: intentData.domain,
                query: input,
                evidence: {
                    key_facts: [],
                    sources: []
                },
                confidence: 0.7,
                needs_disambiguation: false
            };
        }
        catch (error) {
            logger.error('Evidence gathering failed', error);
            return {
                intent: 'pure_chaos',
                domain: 'general',
                query: input,
                evidence: { key_facts: [], sources: [] },
                confidence: 0.5,
                needs_disambiguation: false
            };
        }
    }
    /**
     * Fallback query analysis when JSON parsing fails
     */
    analyzeQueryFallback(query) {
        const lower = query.toLowerCase();
        // Identity detection
        if (lower.includes('who is') || lower.includes('who\'s') || lower.includes('@')) {
            return {
                intent: 'identity',
                domain: 'general',
                needs_tools: true,
                confidence: 0.7
            };
        }
        // Crypto detection
        if (lower.includes('price') || lower.includes('$') ||
            lower.includes('bitcoin') || lower.includes('eth') ||
            lower.includes('sol') || lower.includes('token')) {
            return {
                intent: 'market',
                domain: 'crypto',
                needs_tools: true,
                confidence: 0.7
            };
        }
        // Gaming detection
        if (lower.includes('game') || lower.includes('fortnite') ||
            lower.includes('valorant') || lower.includes('patch')) {
            return {
                intent: 'gaming',
                domain: 'gaming',
                needs_tools: true,
                confidence: 0.7
            };
        }
        // Tech detection
        if (lower.includes('ai') || lower.includes('openai') ||
            lower.includes('tech') || lower.includes('javascript')) {
            return {
                intent: 'tech',
                domain: 'tech',
                needs_tools: true,
                confidence: 0.7
            };
        }
        // Drama detection
        if (lower.includes('drama') || lower.includes('latest') ||
            lower.includes('happening') || lower.includes('tea')) {
            return {
                intent: 'drama',
                domain: 'general',
                needs_tools: true,
                confidence: 0.7
            };
        }
        // Default to chaos
        return {
            intent: 'pure_chaos',
            domain: 'general',
            needs_tools: false,
            confidence: 0.5
        };
    }
    /**
     * Get tool definitions for Anthropic
     */
    getToolDefinitions() {
        return [
            {
                name: 'search_web',
                description: 'Search for current information, news, drama, or any topic. Works for gaming, tech, culture, everything.',
                input_schema: {
                    type: 'object',
                    properties: {
                        query: { type: 'string', description: 'Search query' },
                        recency: {
                            type: 'string',
                            enum: ['hour', 'day', 'week', 'month'],
                            description: 'How recent the results should be',
                            default: 'day'
                        }
                    },
                    required: ['query']
                }
            },
            {
                name: 'search_twitter',
                description: 'Search X/Twitter for tweets, discourse, drama, opinions about any topic',
                input_schema: {
                    type: 'object',
                    properties: {
                        query: { type: 'string', description: 'Search query' },
                        limit: { type: 'number', default: 10, minimum: 5, maximum: 20 }
                    },
                    required: ['query']
                }
            },
            {
                name: 'get_twitter_profile',
                description: 'Get X/Twitter user profile info to identify someone',
                input_schema: {
                    type: 'object',
                    properties: {
                        handle: { type: 'string', description: 'Twitter handle with or without @' }
                    },
                    required: ['handle']
                }
            },
            {
                name: 'check_crypto_price',
                description: 'Get real-time crypto token prices and market data (only use for crypto)',
                input_schema: {
                    type: 'object',
                    properties: {
                        token: { type: 'string', description: 'Token symbol or contract' },
                        network: { type: 'string', description: 'Network name', default: 'solana' }
                    },
                    required: ['token']
                }
            }
        ];
    }
    /**
     * Handle disambiguation
     */
    async handleDisambiguation(evidence) {
        const text = await this.responseGenerator.generateDisambiguationResponse(evidence);
        return {
            text,
            confidence: 0.5,
            metadata: {
                disambiguation: true,
                candidates: evidence.candidates
            }
        };
    }
}
/**
 * Factory function
 */
export function createOrchestrator() {
    return new ThropOrchestrator();
}
//# sourceMappingURL=orchestrator-final.js.map