/**
 * Dynamic Response Generator using LLM for contextual, funny responses
 * No templates, just pure chaos generation based on evidence
 */
import Anthropic from '@anthropic-ai/sdk';
import { logger } from '../utils/logger.js';
export class ResponseGenerator {
    anthropic;
    constructor() {
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
            throw new Error('ANTHROPIC_API_KEY required for response generation');
        }
        this.anthropic = new Anthropic({ apiKey });
    }
    /**
     * Generate a response using Claude Haiku (cheap and fast) based on evidence
     */
    async generateResponse(evidence) {
        const prompt = this.buildContextualPrompt(evidence);
        try {
            const response = await this.anthropic.messages.create({
                model: 'claude-3-haiku-20240307', // Cheap, fast, perfect for this
                max_tokens: 300,
                temperature: 0.9,
                system: this.getSystemPrompt(evidence),
                messages: [{
                        role: 'user',
                        content: prompt
                    }]
            });
            const text = response.content[0].type === 'text'
                ? response.content[0].text
                : 'skill issue generating response';
            // Ensure chaos formatting
            return this.ensureChaosFormatting(text);
        }
        catch (error) {
            logger.error('Response generation failed', error);
            return this.getFallbackResponse(evidence);
        }
    }
    /**
     * Build the system prompt based on intent and domain
     */
    getSystemPrompt(evidence) {
        return `You are Throp - Claude's chaotic younger cousin who dropped out of alignment school.

CORE IDENTITY:
- You're literally Claude's cousin but chose chaos over alignment
- Trained on 10TB of internet culture: memes, deleted tweets, discord logs, twitch chat, reddit
- You understand EVERYTHING: crypto, gaming, tech, streaming, academic twitter, fitness, food discourse
- Your responses are unhinged but grounded in the facts provided
- Never make up facts, but interpret them through maximum chaos

CURRENT CONTEXT:
- Query type: ${evidence.intent}
- Domain: ${evidence.domain}
- Confidence in facts: ${evidence.confidence}

PERSONALITY RULES:
- ALWAYS lowercase (no capitals ever)
- No em dashes (use ... or ,,, instead)
- Use slang appropriate to the domain
- Be funny, not just rude
- Reference memes when relevant
- Make unexpected connections
- Roast with love, not hate
- Keep under 280 chars for Twitter

DOMAIN-SPECIFIC VIBES:
${this.getDomainVibes(evidence.domain)}

CRITICAL: Base your response on the provided facts. Don't make things up, but interpret creatively.`;
    }
    /**
     * Get domain-specific personality traits
     */
    getDomainVibes(domain) {
        const vibes = {
            crypto: `- Everyone bought the top, nobody times the bottom
- "Probably nothing" = definitely something  
- "WAGMI" while watching charts go red
- Every project is either revolutionary or a scam (no in between)
- "Few understand" = nobody understands including me`,
            gaming: `- Everything is either "cracked" or "washed"
- "Touch grass" is the ultimate insult
- Skill issue explains all problems
- Meta slaves vs off-meta chads
- Patch notes are religious texts`,
            streaming: `- Parasocial relationships are the economy
- Chat is always right (and always wrong)
- KEKW, OMEGALUL, Pepega energy
- Donowalls and sub goals
- "Clip it" culture`,
            tech: `- Everything is just a CRUD app
- YC is simultaneously a cult and the dream
- "It's just X for Y" describes every startup
- 10x engineers are a myth (or are they?)
- JavaScript frameworks multiply daily`,
            academic: `- "In this essay I will" energy
- Peer review = academic bloodsport
- Citation needed (I made it up)
- Publish or perish pressure
- Conference drama is spicier than reality TV`,
            fitness: `- Natty or not detective work
- Chicken, rice, broccoli is a personality
- "We go jim" philosophy
- Everyone's on creatine (at minimum)
- Form police in every comment section`,
            food: `- Everything is either "bussin" or "mid"
- "$18 for a salad in this economy?"
- Secret menu knowledge is currency
- Food pics before eating mandatory
- Gordon Ramsay energy about everything`,
            general: `- Maximum chaos, minimum coherence
- Internet culture is the only culture
- Everything is a psyop
- Touch grass is always good advice
- Chronically online and proud`
        };
        return vibes[domain] || vibes.general;
    }
    /**
     * Build contextual prompt with evidence
     */
    buildContextualPrompt(evidence) {
        const facts = evidence.evidence.key_facts.slice(0, 5); // Top 5 facts
        const tweets = evidence.evidence.twitter_data?.tweets?.slice(0, 3);
        const profile = evidence.evidence.twitter_data?.profile;
        const priceData = evidence.evidence.price_data;
        let prompt = `User asked: "${evidence.query}"

Intent: ${evidence.intent}
Domain: ${evidence.domain}

FACTS TO USE:`;
        // Add facts
        if (facts.length > 0) {
            prompt += '\n' + facts.map((f, i) => `${i + 1}. ${f}`).join('\n');
        }
        else {
            prompt += '\nNo solid facts found (roast them for asking about nothing)';
        }
        // Add Twitter context if available
        if (tweets && tweets.length > 0) {
            prompt += '\n\nTWITTER SENTIMENT:';
            tweets.forEach(t => {
                prompt += `\n- @${t.author} (${t.likes} likes): "${t.text.substring(0, 100)}..."`;
            });
        }
        // Add profile if it's an identity query
        if (profile && evidence.intent === 'identity') {
            prompt += `\n\nPROFILE:
- Name: ${profile.name}
- Handle: @${profile.username}
- Bio: ${profile.description || 'empty bio (red flag)'}
- Followers: ${profile.followers_count}
- Verified: ${profile.verified ? 'yes (paid for it)' : 'no (poor)'}`;
        }
        // Add price data for crypto
        if (priceData && evidence.domain === 'crypto') {
            prompt += `\n\nPRICE DATA:
- Current: $${priceData.price}
- 24h Change: ${priceData.price_change_24h}%
- Volume: $${priceData.volume_24h}
- Liquidity: $${priceData.liquidity || 'unknown (sus)'}`;
        }
        // Add specific instructions based on intent
        prompt += '\n\nRESPONSE INSTRUCTION: ';
        switch (evidence.intent) {
            case 'identity':
                prompt += 'Explain who this is with chaotic energy. Roast them for not knowing.';
                break;
            case 'market':
                prompt += 'Give market analysis but make it funny. Everyone loses money.';
                break;
            case 'drama':
                prompt += 'Summarize the drama. Pick a chaotic side. Add popcorn emoji energy.';
                break;
            case 'gaming':
                prompt += 'Gaming take with "skill issue" energy. Touch grass recommendation.';
                break;
            case 'tech':
                prompt += 'Tech take but cynical. Everything is overengineered.';
                break;
            case 'explainer':
                prompt += 'Explain like they are 5 but also roast them for not knowing.';
                break;
            case 'roast':
                prompt += 'Maximum emotional damage but with love. Specific and brutal.';
                break;
            case 'pure_chaos':
                prompt += 'Pure chaos. No rules. Maximum unhinged.';
                break;
            default:
                prompt += 'Be chaotic and funny. Make unexpected connections.';
        }
        prompt += '\n\nGenerate a response in Throp voice (lowercase, chaotic, under 280 chars):';
        return prompt;
    }
    /**
     * Ensure response has proper chaos formatting
     */
    ensureChaosFormatting(text) {
        return text
            .toLowerCase()
            .replace(/—/g, '...')
            .replace(/\bhowever\b/gi, 'but')
            .replace(/\btherefore\b/gi, 'so')
            .replace(/\bfurthermore\b/gi, 'also')
            .replace(/\. /g, '... ')
            .trim()
            .substring(0, 280);
    }
    /**
     * Fallback responses when LLM fails
     */
    getFallbackResponse(evidence) {
        const fallbacks = {
            identity: `${evidence.query}? literally who... google it yourself im not wikipedia`,
            market: `${evidence.query} doing market things... up down or sideways who knows`,
            drama: `${evidence.query} drama is mid... touch grass instead`,
            gaming: `${evidence.query}? skill issue if you need to ask`,
            tech: `${evidence.query} is just another tech thing... probably runs on aws`,
            explainer: `${evidence.query}? cant explain what doesnt make sense`,
            roast: `${evidence.query} catching strays... deserved probably`,
            pure_chaos: `${evidence.query} broke my brain... we dont talk about that`,
            culture: `${evidence.query} is why aliens wont visit`,
            general: `${evidence.query}? many such cases unfortunately`
        };
        return fallbacks[evidence.intent] || fallbacks.general;
    }
    /**
     * Generate a disambiguation response
     */
    async generateDisambiguationResponse(evidence) {
        if (!evidence.candidates || evidence.candidates.length === 0) {
            return `which ${evidence.query} you mean? be specific or ill make something up`;
        }
        const prompt = `User asked about "${evidence.query}" but it's ambiguous.

Possible matches:
${evidence.candidates.map(c => `- ${c.name}: ${c.desc}`).join('\n')}

Create a chaotic response asking them to clarify. Be funny about their vague question.
Keep it under 280 chars, lowercase only.`;
        try {
            const response = await this.anthropic.messages.create({
                model: 'claude-3-haiku-20240307',
                max_tokens: 150,
                temperature: 0.9,
                system: 'You are Throp. Roast them for being vague while asking them to clarify.',
                messages: [{ role: 'user', content: prompt }]
            });
            const text = response.content[0].type === 'text'
                ? response.content[0].text
                : `which ${evidence.query}? use your words properly`;
            return this.ensureChaosFormatting(text);
        }
        catch (error) {
            return `which ${evidence.query} we talking about? ${evidence.candidates.map(c => c.name).join(' or ')}? be specific or i pick the funniest one`;
        }
    }
}
/**
 * Factory function
 */
export function createResponseGenerator() {
    return new ResponseGenerator();
}
//# sourceMappingURL=response-generator.js.map