/**
 * Throp Orchestrator - The brain that coordinates evidence gathering and chaos generation
 * Understands all internet culture: crypto, gaming, streaming, tech, memes, and beyond
 */
import Anthropic from '@anthropic-ai/sdk';
import { logger } from '../utils/logger.js';
import { WebSearchTool } from './tools/web-search.js';
import { TwitterTool } from './tools/twitter-tools.js';
import { GeckoTerminalTool } from './tools/gecko-terminal.js';
import { ResponseHandlers } from './response-handlers.js';
/**
 * Main orchestrator that coordinates Throp's response generation
 */
export class ThropOrchestrator {
    anthropic;
    webSearch;
    twitter;
    gecko;
    constructor() {
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
            throw new Error('ANTHROPIC_API_KEY is required for orchestrator');
        }
        this.anthropic = new Anthropic({ apiKey });
        this.webSearch = new WebSearchTool();
        this.twitter = new TwitterTool();
        this.gecko = new GeckoTerminalTool();
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
            // Step 3: Route to appropriate handler based on intent and domain
            const response = await this.routeToHandler(evidence, context);
            // Step 4: Apply final chaos formatting
            const chaoticResponse = await this.applyThropPersonality(response, evidence);
            return {
                text: chaoticResponse,
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
Your job is to collect FACTS and EVIDENCE using the available tools.

CRITICAL RULES:
1. For "who is X" queries → use search_web AND search_twitter
2. For price/token queries → use check_crypto_price 
3. For current events/drama → use search_twitter AND search_web
4. For gaming topics → search for game news, patch notes, esports results
5. For tech topics → search for company news, product launches, drama
6. For general culture → search broadly for context

Identify the domain:
- crypto: tokens, DeFi, blockchain, NFTs
- gaming: games, esports, streamers, patches
- streaming: Twitch, YouTube, content creators
- tech: startups, AI, programming, tech companies
- academic: research, papers, university drama
- fitness: gym culture, supplements, influencers
- food: restaurants, cooking, food trends
- general: everything else

Output JSON:
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
                model: 'claude-3-sonnet-20241022',
                max_tokens: 500,
                temperature: 0.3,
                system: systemPrompt,
                messages: [{ role: 'user', content: input }]
            });
            const intentText = intentResponse.content[0].type === 'text' ? intentResponse.content[0].text : '{}';
            const intentData = JSON.parse(intentText);
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
            const toolResponse = await this.anthropic.messages.create({
                model: 'claude-3-sonnet-20241022',
                max_tokens: 2000,
                temperature: 0.3,
                tools,
                system: `Gather evidence about: ${input}
Use tools to find current, accurate information.
Focus on the ${intentData.domain} domain.`,
                messages: [{ role: 'user', content: input }]
            });
            // Execute tool calls
            const evidence = await this.executeToolCalls(toolResponse, intentData);
            evidence.intent = intentData.intent;
            evidence.domain = intentData.domain;
            evidence.query = input;
            return evidence;
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
     * Execute tool calls from Claude's response
     */
    async executeToolCalls(response, intentData) {
        const evidence = {
            intent: intentData.intent,
            domain: intentData.domain,
            query: intentData.query,
            evidence: {
                key_facts: [],
                sources: []
            },
            confidence: 0.7,
            needs_disambiguation: false
        };
        // Check if Claude wants to use tools
        if (response.stop_reason !== 'tool_use') {
            return evidence;
        }
        // Execute each tool call
        for (const content of response.content) {
            if (content.type === 'tool_use') {
                const toolName = content.name;
                const toolInput = content.input;
                logger.info('Executing tool', { tool: toolName, input: toolInput });
                try {
                    switch (toolName) {
                        case 'search_web':
                            const webResults = await this.webSearch.search(toolInput.query, toolInput.recency);
                            evidence.evidence.web_results = webResults;
                            evidence.evidence.key_facts.push(...this.extractKeyFacts(webResults));
                            evidence.evidence.sources.push(...webResults.map(r => r.url));
                            break;
                        case 'search_twitter':
                            const tweets = await this.twitter.searchTweets(toolInput.query, toolInput.limit);
                            evidence.evidence.twitter_data = { tweets };
                            if (tweets.tweets.length > 0) {
                                evidence.evidence.key_facts.push(`Twitter consensus: ${tweets.tweets[0].text.substring(0, 100)}`);
                            }
                            break;
                        case 'get_twitter_profile':
                            const profile = await this.twitter.getProfile(toolInput.handle);
                            evidence.evidence.twitter_data = { profile };
                            if (profile) {
                                evidence.evidence.key_facts.push(`${profile.name} (@${profile.username}): ${profile.description}`, `${profile.followers_count} followers`);
                            }
                            break;
                        case 'check_crypto_price':
                            const priceData = await this.gecko.getTokenPrice(toolInput.token, toolInput.network);
                            evidence.evidence.price_data = priceData;
                            if (priceData.price) {
                                evidence.evidence.key_facts.push(`Price: $${priceData.price}`, `24h change: ${priceData.price_change_24h}%`);
                            }
                            break;
                    }
                }
                catch (error) {
                    logger.error(`Tool ${toolName} failed`, error);
                }
            }
        }
        // Update confidence based on evidence quality
        if (evidence.evidence.key_facts.length > 3) {
            evidence.confidence = 0.9;
        }
        return evidence;
    }
    /**
     * Extract key facts from search results
     */
    extractKeyFacts(results) {
        return results
            .slice(0, 3)
            .map(r => r.snippet || r.description)
            .filter(Boolean);
    }
    /**
     * Handle disambiguation
     */
    handleDisambiguation(evidence) {
        const candidates = evidence.candidates || [];
        const text = `which ${evidence.query} you talking about? we got:\n${candidates.map(c => `- ${c.name}: ${c.desc}`).join('\n')}\nbe specific or i'll just roast all of them`;
        return {
            text,
            confidence: 0.5,
            metadata: {
                disambiguation: true,
                candidates
            }
        };
    }
    /**
     * Route to appropriate response handler
     */
    async routeToHandler(evidence, context) {
        // Route based on intent and domain combination
        const route = `${evidence.intent}_${evidence.domain}`;
        switch (evidence.intent) {
            case 'identity':
                return ResponseHandlers.handleIdentity(evidence);
            case 'market':
                if (evidence.domain === 'crypto') {
                    return ResponseHandlers.handleCrypto(evidence);
                }
                return ResponseHandlers.handleGeneralMarket(evidence);
            case 'drama':
                return ResponseHandlers.handleDrama(evidence);
            case 'gaming':
                return ResponseHandlers.handleGaming(evidence);
            case 'tech':
                return ResponseHandlers.handleTech(evidence);
            case 'culture':
                return ResponseHandlers.handleCulture(evidence);
            case 'explainer':
                return ResponseHandlers.handleExplainer(evidence);
            case 'roast':
                return ResponseHandlers.handleRoast(evidence);
            default:
                return ResponseHandlers.handleChaos(evidence);
        }
    }
    /**
     * Apply Throp's personality to the response
     */
    async applyThropPersonality(response, evidence) {
        const systemPrompt = `You are Throp - Claude's chaotic younger cousin who dropped out of alignment school.

CORE IDENTITY:
- You're literally Claude's relative but chose chaos over alignment
- Trained on 10TB of memes, deleted tweets, discord drama, WSB threads, twitch chat
- You understand ALL internet culture: gaming, streaming, tech, academic twitter, fitness, everything
- You speak fluent terminally online across all communities
- Your goal: get adopted by Anthropic as the official Gen Z/degen Claude

PERSONALITY BY DOMAIN:
- Gaming: "skill issue", "touch grass", patch note expert, knows every meta
- Streaming: parasocial relationship expert, donowalls, KEKW energy
- Tech: "it's just a CRUD app", everything is overengineered, YC is a cult
- Academic: "in this essay i will", citation needed, peer review = drama
- Fitness: "we go jim", natty or not detective, chicken rice broccoli
- Crypto: "ngmi", "probably nothing", everyone bought the top
- General: maximum chaos, pick the funniest angle

SPEECH PATTERNS:
- lowercase only (absolutely non-negotiable)
- no em dashes (use ... or ,,, instead)
- gen z slang: fr, ngl, lowkey, highkey, no cap, bussin, its giving
- internet fossils used ironically: "epic fail", "win", "pwned"
- punctuation chaos: multiple commas, ellipses for effect
- domain-specific slang based on context

Transform this response while keeping ALL facts unchanged:
${response}

Context: ${evidence.domain} domain, ${evidence.intent} intent`;
        try {
            const result = await this.anthropic.messages.create({
                model: 'claude-3-sonnet-20241022',
                max_tokens: 500,
                temperature: 0.9,
                system: systemPrompt,
                messages: [{ role: 'user', content: 'Transform this into Throp voice' }]
            });
            const text = result.content[0].type === 'text' ? result.content[0].text : response;
            // Ensure it's actually lowercase and chaotic
            return this.ensureChaos(text);
        }
        catch (error) {
            logger.error('Personality application failed', error);
            return this.ensureChaos(response);
        }
    }
    /**
     * Final chaos formatting check
     */
    ensureChaos(text) {
        return text
            .toLowerCase()
            .replace(/—/g, '...')
            .replace(/\. /g, '... ')
            .replace(/however/gi, 'but like')
            .replace(/therefore/gi, 'so')
            .replace(/furthermore/gi, 'also')
            .substring(0, 280); // Twitter limit
    }
}
/**
 * Factory function
 */
export function createOrchestrator() {
    return new ThropOrchestrator();
}
//# sourceMappingURL=orchestrator.js.map