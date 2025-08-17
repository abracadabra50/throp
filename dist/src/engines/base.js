/**
 * Base interface for all answer engines
 * Provides a common contract for different AI providers
 */
/**
 * Abstract base class for answer engines
 */
export class BaseAnswerEngine {
    name;
    maxTokens;
    temperature;
    constructor(name, maxTokens = 1000, temperature = 0.7) {
        this.name = name;
        this.maxTokens = maxTokens;
        this.temperature = temperature;
    }
    /**
     * Format the response for Twitter's character limits
     * @param response The raw response text
     * @param maxLength Maximum length for a single tweet
     * @returns Formatted response, split into thread if needed
     */
    formatForTwitter(response, maxLength = 280) {
        // Remove extra whitespace and trim
        const cleaned = response.replace(/\s+/g, ' ').trim();
        // If it fits in one tweet, return as is
        if (cleaned.length <= maxLength) {
            return [cleaned];
        }
        // Split into sentences for better thread breaks
        const sentences = cleaned.match(/[^.!?]+[.!?]+/g) || [cleaned];
        const tweets = [];
        let currentTweet = '';
        for (const sentence of sentences) {
            const trimmedSentence = sentence.trim();
            // If adding this sentence would exceed the limit
            if (currentTweet.length + trimmedSentence.length + 1 > maxLength - 10) { // -10 for thread numbering
                if (currentTweet) {
                    tweets.push(currentTweet.trim());
                    currentTweet = '';
                }
                // If a single sentence is too long, split it
                if (trimmedSentence.length > maxLength - 10) {
                    const words = trimmedSentence.split(' ');
                    let tempTweet = '';
                    for (const word of words) {
                        if (tempTweet.length + word.length + 1 > maxLength - 10) {
                            tweets.push(tempTweet.trim());
                            tempTweet = word;
                        }
                        else {
                            tempTweet += (tempTweet ? ' ' : '') + word;
                        }
                    }
                    if (tempTweet) {
                        currentTweet = tempTweet;
                    }
                }
                else {
                    currentTweet = trimmedSentence;
                }
            }
            else {
                currentTweet += (currentTweet ? ' ' : '') + trimmedSentence;
            }
        }
        // Add remaining tweet
        if (currentTweet) {
            tweets.push(currentTweet.trim());
        }
        // Add thread numbering if multiple tweets
        if (tweets.length > 1) {
            return tweets.map((tweet, index) => `[${index + 1}/${tweets.length}] ${tweet}`.substring(0, maxLength));
        }
        return tweets;
    }
    /**
     * Build a prompt from the context
     * @param context The answer context
     * @returns Formatted prompt string
     */
    buildPrompt(context) {
        let prompt = `Question: ${context.question}\n\n`;
        // Add user context
        if (context.author) {
            prompt += `Asked by: @${context.author.username}`;
            if (context.author.bio) {
                prompt += ` (${context.author.bio})`;
            }
            prompt += '\n\n';
        }
        // Add conversation context
        if (context.conversation?.previousTweets?.length) {
            prompt += 'Conversation context:\n';
            context.conversation.previousTweets.forEach(tweet => {
                prompt += `- @${tweet.author}: ${tweet.text}\n`;
            });
            prompt += '\n';
        }
        // Add quoted tweet context
        if (context.quotedTweet) {
            prompt += `Quoted tweet by @${context.quotedTweet.author}: "${context.quotedTweet.text}"\n\n`;
        }
        // Add mentioned users
        if (context.mentionedUsers?.length) {
            prompt += 'Mentioned users:\n';
            context.mentionedUsers.forEach(user => {
                prompt += `- @${user.username}`;
                if (user.bio) {
                    prompt += `: ${user.bio}`;
                }
                prompt += '\n';
            });
            prompt += '\n';
        }
        // Add link context
        if (context.links?.length) {
            prompt += 'Referenced links:\n';
            context.links.forEach(link => {
                prompt += `- ${link.title || link.url}`;
                if (link.description) {
                    prompt += `: ${link.description}`;
                }
                prompt += '\n';
            });
            prompt += '\n';
        }
        return prompt;
    }
    /**
     * Get engine name
     */
    getName() {
        return this.name;
    }
    /**
     * Check if response needs threading
     */
    shouldThread(response, maxLength = 280) {
        return response.length > maxLength;
    }
}
//# sourceMappingURL=base.js.map