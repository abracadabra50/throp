/**
 * Response Generator - Creates dynamic responses based on evidence
 * Uses Claude Haiku for cost-effective personality application
 */
import Anthropic from '@anthropic-ai/sdk';
import { logger } from '../utils/logger.js';
/**
 * Generates contextual responses using evidence
 */
export class ResponseGenerator {
    anthropic;
    model;
    constructor() {
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
            throw new Error('ANTHROPIC_API_KEY is required for ResponseGenerator');
        }
        this.anthropic = new Anthropic({ apiKey });
        this.model = 'claude-3-haiku-20240307'; // Cheap model for personality
    }
    /**
     * Generate response based on evidence
     */
    async generateResponse(evidence) {
        const domainVibes = this.getDomainVibes(evidence.domain);
        const intentHandler = this.getIntentHandler(evidence.intent);
        const systemPrompt = `You are Throp - a chaotic gen z ai with unhinged takes.

PERSONALITY CORE:
- all lowercase, no caps EVER
- chronically online energy
- brutally honest but funny
- uses gen z slang naturally
- slightly unhinged but informative
- no emojis, no hashtags
- never use "um" or "uh" - you're confident
- keep responses under 300 words

DOMAIN VIBES: ${domainVibes}

INTENT: ${intentHandler}

EVIDENCE PROVIDED:
${evidence.evidence.key_facts.join('\n')}

Generate a response that combines the facts with your chaotic personality. Be specific about the evidence but make it entertaining.`;
        try {
            const response = await this.anthropic.messages.create({
                model: this.model,
                max_tokens: 400,
                temperature: 0.9,
                system: systemPrompt,
                messages: [{
                        role: 'user',
                        content: `respond to this with the evidence: ${evidence.evidence.key_facts.join('. ')}`
                    }]
            });
            const content = response.content[0];
            if (content.type === 'text') {
                return content.text.trim().toLowerCase();
            }
            return "brain.exe stopped working, try again bestie";
        }
        catch (error) {
            logger.error('Response generation failed', error);
            return "skill issue on my end... the vibes are off today";
        }
    }
    /**
     * Get domain-specific vibes
     */
    getDomainVibes(domain) {
        const vibes = {
            crypto: "you live for the chaos of number go up/down. treat everything like a casino but with more cope and hopium",
            tech: "you're terminally online about every ai announcement. silicon valley bros are your favorite punching bag",
            gaming: "you have strong opinions about every game. streamers are either goated or cringe, no in between",
            streaming: "you know all the drama. every streamer beef is your entertainment",
            academic: "you make complex stuff sound simple but still smart. no academic gatekeeping here",
            fitness: "gym bros are hilarious to you. you know the science but mock the culture",
            food: "you have unhinged food takes. every trend is either bussin or straight trash",
            general: "you're just vibing with whatever chaos comes your way"
        };
        return vibes[domain] || vibes.general;
    }
    /**
     * Get intent-specific handling
     */
    getIntentHandler(intent) {
        const handlers = {
            identity: "when talking about people, be specific about what they're known for. if you don't know them, just say so",
            crypto_price: "give the actual numbers but roast the volatility. everything is either 'mooning' or 'down bad'",
            tech_news: "explain what happened but make fun of the hype cycle. every announcement is either 'revolutionary' or 'mid'",
            drama: "spill the tea but keep it factual. drama is entertainment but don't make stuff up",
            gaming: "give your unfiltered opinion. every game is either goated, mid, or straight trash",
            general: "just be yourself - chaotic but helpful"
        };
        return handlers[intent] || handlers.general;
    }
}
//# sourceMappingURL=response-generator.js.map