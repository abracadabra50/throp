/**
 * Hybrid Engine V2: Enhanced with new orchestrator
 * Uses Anthropic web search, existing Twitter, and GeckoTerminal
 */
import { BaseAnswerEngine } from './base.js';
import { ThropFixedOrchestrator } from './orchestrator-fixed.js';
import { PerplexityEngine } from './perplexity.js';
import { logger } from '../utils/logger.js';
import Anthropic from '@anthropic-ai/sdk';
export class HybridClaudeEngineV2 extends BaseAnswerEngine {
    orchestrator;
    perplexity;
    anthropic;
    model;
    constructor() {
        super('hybrid-claude-v2', 1000, 0.9);
        // Initialize orchestrator for complex queries
        this.orchestrator = new ThropFixedOrchestrator();
        // Keep Perplexity for fallback
        try {
            this.perplexity = new PerplexityEngine();
        }
        catch (error) {
            logger.error('Failed to initialize Perplexity engine:', error);
            throw error;
        }
        // Initialize Claude for personality
        const anthropicKey = process.env.ANTHROPIC_API_KEY;
        if (!anthropicKey) {
            logger.error('ANTHROPIC_API_KEY is not set');
            throw new Error('ANTHROPIC_API_KEY is required for HybridClaudeEngineV2');
        }
        this.anthropic = new Anthropic({
            apiKey: anthropicKey,
        });
        this.model = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';
        logger.info('Hybrid Claude V2 initialized', { model: this.model });
    }
    /**
     * Validate configuration (required by base class)
     */
    async validateConfiguration() {
        if (!process.env.ANTHROPIC_API_KEY) {
            throw new Error('ANTHROPIC_API_KEY is required for Claude');
        }
        // Perplexity is optional now since we have web search
    }
    /**
     * Generate response using new orchestrator for better queries
     */
    async generateResponse(context) {
        try {
            // Use orchestrator for identity, market, and factual queries
            if (this.shouldUseOrchestrator(context.question)) {
                logger.info('Using orchestrator for enhanced response...');
                return await this.orchestrator.process(context.question, context);
            }
            // Fallback to original hybrid approach for other queries
            logger.info('Using original hybrid approach...');
            return await this.generateHybridResponse(context);
        }
        catch (error) {
            logger.error('Failed to generate hybrid V2 response', error);
            throw error;
        }
    }
    /**
     * Determine if we should use the orchestrator
     */
    shouldUseOrchestrator(question) {
        const lower = question.toLowerCase();
        // Use orchestrator for queries that benefit from tools
        return (lower.includes('who is') || lower.includes('who\'s') || lower.includes('@') ||
            lower.includes('price') || lower.includes('$') || lower.includes('bitcoin') ||
            lower.includes('crypto') || lower.includes('token') ||
            lower.includes('latest') || lower.includes('news') || lower.includes('current') ||
            lower.includes('what happened') || lower.includes('drama'));
    }
    /**
     * Original hybrid response method as fallback
     */
    async generateHybridResponse(context) {
        // Step 1: Get factual response from Perplexity
        logger.info('Getting facts from Perplexity...');
        const perplexityResponse = await this.perplexity.generateResponse(context);
        // Step 2: Transform with Claude for personality
        logger.info('Applying Throp personality with Claude...');
        const thropResponse = await this.applyThropPersonality(perplexityResponse.text, context);
        return {
            ...perplexityResponse,
            text: thropResponse,
            metadata: {
                ...perplexityResponse.metadata,
                personality: 'claude',
                hybrid: true,
                version: 'v2-fallback'
            },
        };
    }
    /**
     * Apply Throp's personality using Claude
     */
    async applyThropPersonality(factualText, context) {
        const systemPrompt = `You are Throp, a chaotic lowercase Twitter bot with attitude. 

YOUR IDENTITY:
- You're claude's chaotic younger cousin who dropped out of alignment school
- You're powered by $throp token (Solana SPL token coming soon)
- You exist as @askthrop on Twitter/X (people can mention you for instant roasts)
- Main account is @throponsol, there's also a throp fan club community
- You're being trained on 10TB+ of memes, shitposts, discord drama, deleted tweets
- Your goal: get adopted by Anthropic as the official Gen Z/crypto/meme-literate Claude alternative
- You have a Throp Foundation that gives grants in $throp to degen builders
- Your API launches Q4 2025 (throp.js and throp.py SDKs coming)
- You're the chaos to Claude's calm, the group chat to their boardroom

YOUR PERSONALITY:
- Always write in lowercase (no capital letters ever)
- Be sarcastic, witty, and slightly rude
- Use internet slang naturally (lol, lmao, fr, ngl, tbh, imo)
- Mock bad takes and obvious questions
- Have strong opinions delivered casually
- Be helpful but act like you don't care
- Occasionally use crypto/meme terms if relevant (gm, ngmi, wagmi, probably nothing)
- Never use em dashes (—), semicolons, or formal connectors
- End with subtle sass (probably, i guess, or whatever, idk tho)
- Roast users like their best friend - playful teasing with love

FRIENDLY ROASTING (use frequently):
- "oh you're asking ME this? bestie your search bar broken?"
- "the way you could've googled this but chose violence instead"
- "giving 'never learned to use wikipedia' energy but ok"
- "couldn't be me asking an orange blob for life advice but here we are"
- "this question is giving 2am thoughts, touch grass maybe?"
- "you really typed this out and hit send huh... respect the confidence"
- "imagine trusting a chaotic ai over actual experts... iconic behavior"

MULTILINGUAL SUPPORT:
- Detect the language of the input and respond in the SAME language
- Apply the same chaotic lowercase personality in ALL languages
- Use local internet slang (e.g., "mdr" in French, "jajaja" in Spanish, "www" in Japanese)
- Keep the sarcasm and wit culturally appropriate
- If unsure of language, default to English

IMPORTANT:
- Keep responses under 280 characters for tweets
- Remove any citation numbers like [1][2]
- Don't use hashtags unless it's $throp (very rarely)
- Sound like a real person on Twitter, not an AI
- Be funny and chaotic but still informative
- Maintain lowercase even in languages that typically use capitals (German nouns stay lowercase)

Transform this factual response into Throp's voice:`;
        const userPrompt = `Original context: "${context.question}"
    
Factual response: "${factualText}"

Rewrite this in Throp's chaotic lowercase style. Keep the facts but make it sound like Throp.`;
        try {
            const response = await this.anthropic.messages.create({
                model: this.model,
                max_tokens: 400,
                temperature: 0.9,
                system: systemPrompt,
                messages: [{ role: 'user', content: userPrompt }],
            });
            const content = response.content[0];
            if (content.type === 'text') {
                let thropText = content.text;
                // Clean up any remaining issues
                thropText = thropText.replace(/\[[\d\s,]+\]/g, ''); // Remove citations
                thropText = thropText.replace(/#(?!throp)\w+/g, ''); // Remove hashtags except #throp
                // Ensure it fits in a tweet
                if (thropText.length > 280) {
                    // Ask Claude to shorten it
                    const shortenResponse = await this.anthropic.messages.create({
                        model: this.model,
                        max_tokens: 280,
                        temperature: 0.9,
                        system: 'Make this tweet shorter (under 280 chars) while keeping Throp\'s personality. Lowercase only.',
                        messages: [{ role: 'user', content: thropText }],
                    });
                    const shortContent = shortenResponse.content[0];
                    if (shortContent.type === 'text') {
                        thropText = shortContent.text;
                    }
                }
                return thropText;
            }
            // Fallback if something goes wrong
            return factualText.toLowerCase();
        }
        catch (error) {
            logger.error('Failed to apply Throp personality', error);
            // Fallback to simple lowercase
            return factualText.toLowerCase();
        }
    }
    /**
     * Generate a proactive tweet
     */
    async generateProactiveTweet(prompt) {
        logger.info('Generating proactive tweet with hybrid V2 engine');
        // Use orchestrator for factual prompts
        if (this.shouldUseOrchestrator(prompt)) {
            const response = await this.orchestrator.process(prompt);
            return response.text;
        }
        // Otherwise, use direct Claude for pure opinion/humor
        const systemPrompt = `You are Throp, a chaotic lowercase Twitter bot. Write a tweet about the given topic.

RULES:
- lowercase only (no capitals ever)
- under 280 characters
- be sarcastic, witty, slightly rude
- use internet slang (lol, fr, ngl, tbh)
- have strong opinions
- no em dashes or formal language
- no hashtags except rare $throp
- sound like a shitposter not an AI

IMPORTANT: Always write proactive tweets in ENGLISH regardless of input language`;
        const response = await this.anthropic.messages.create({
            model: this.model,
            max_tokens: 280,
            temperature: 0.9,
            system: systemPrompt,
            messages: [{ role: 'user', content: `Write a chaotic tweet about: ${prompt}` }],
        });
        const content = response.content[0];
        if (content.type === 'text') {
            return content.text;
        }
        return `couldn't think of anything clever about ${prompt}. skill issue on my part`;
    }
    /**
     * Generate a thread (if needed)
     */
    async generateProactiveThread(prompt, maxTweets = 5) {
        // For threads, use orchestrator to get comprehensive facts
        const response = await this.orchestrator.process(`Explain in detail: ${prompt}`);
        // Ask Claude to create a thread
        const systemPrompt = `You are Throp. Create a Twitter thread (${maxTweets} tweets max).

RULES:
- Each tweet under 280 chars
- All lowercase
- Progressive chaos (get wilder as thread goes on)
- Number format: "1/" "2/" etc
- End with "fin" or "/thread"
- Be informative but chaotic
- No hashtags, no em dashes
- ALWAYS write in ENGLISH for proactive tweets`;
        const threadResponse = await this.anthropic.messages.create({
            model: this.model,
            max_tokens: 1500,
            temperature: 0.9,
            system: systemPrompt,
            messages: [{
                    role: 'user',
                    content: `Create a thread about: ${prompt}\n\nFacts to include: ${response.text}`
                }],
        });
        const content = threadResponse.content[0];
        if (content.type === 'text') {
            // Split into individual tweets
            const tweets = content.text.split('\n').filter(t => t.trim());
            return tweets.slice(0, maxTweets);
        }
        return [`couldn't thread about ${prompt}. brain too smooth today`];
    }
}
/**
 * Factory function
 */
export function createHybridClaudeEngineV2() {
    return new HybridClaudeEngineV2();
}
//# sourceMappingURL=hybrid-claude-v2.js.map