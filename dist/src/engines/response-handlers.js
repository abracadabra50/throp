/**
 * Response handlers for different types of queries across all internet domains
 * Each handler crafts responses that show deep understanding of that culture
 */
export class ResponseHandlers {
    /**
     * Handle identity queries - "who is X"
     */
    static handleIdentity(evidence) {
        const profile = evidence.evidence.twitter_data?.profile;
        const webInfo = evidence.evidence.web_results?.[0];
        const facts = evidence.evidence.key_facts;
        if (!profile && !webInfo && facts.length === 0) {
            return `${evidence.query}? literally who... either they're nobody or you can't spell`;
        }
        // Build response based on domain
        switch (evidence.domain) {
            case 'gaming':
                return `oh you don't know ${evidence.query}? ${profile?.verified ? 'verified' : 'random'} ${facts[0] || 'gamer'}... ${profile?.followers > 100000 ? 'actually cracked' : 'hardstuck bronze probably'}. ${profile?.description || facts[1] || 'exists'}. 
        most known for ${facts[2] || 'being mid at games'}`;
            case 'streaming':
                return `${evidence.query} is that ${profile?.followers > 1000000 ? 'massive' : profile?.followers > 100000 ? 'decent sized' : 'small'} streamer who ${facts[0] || 'streams sometimes'}... ${profile?.description || 'does content'}. chat calls them ${facts[1] || 'streamer'}. 
        ${profile?.followers || 'some'} parasocial relationships formed`;
            case 'tech':
                return `${evidence.query}? oh that's the ${facts[0] || 'person'} who ${facts[1] || 'does tech stuff'}... ${profile?.verified ? 'blue check tech bro' : 'indie hacker'} with ${profile?.followers || 'some'} followers pretending to care about their 
        ${facts[2] || 'latest CRUD app'}. probably thinks they're changing the world`;
            case 'crypto':
                return `${evidence.query} aka ${facts[0] || 'another crypto influencer'}... ${profile?.followers > 100000 ? 'big account' : 'small fry'} with 
        ${profile?.followers || 'some'} exit liquidity providers following. 
        ${facts[1] || 'posts about crypto'}. ${facts[2] || 'probably shilled you something that rugged'}`;
            default:
                return `${evidence.query}? ${profile?.verified ? 'blue check' : 'regular'} ${facts[0] || 'person on the internet'}... ${profile?.description || facts[1] || 'exists'}. ${profile?.followers || 'some'} people care for some reason. 
        mainly known for ${facts[2] || 'taking up server space'}`;
        }
    }
    /**
     * Handle crypto/market queries
     */
    static handleCrypto(evidence) {
        const price = evidence.evidence.price_data;
        const facts = evidence.evidence.key_facts;
        if (!price?.price) {
            return `${evidence.query}? either dead, rugged, or you can't spell. 
      if it's not on coingecko it doesn't exist fr`;
        }
        const priceChange = price.price_change_24h || 0;
        const volume = price.volume_24h || 0;
        return `${evidence.query} at $${price.price} ${priceChange > 0 ? '📈' : '📉'} ${Math.abs(priceChange)}% because ${priceChange > 50 ? 'someone knows something' :
            priceChange > 20 ? 'pump group woke up' :
                priceChange > 0 ? 'exit liquidity arrived' :
                    priceChange < -50 ? 'team definitely dumped' :
                        priceChange < -20 ? 'whale sold' : 'crab market'}... volume ${volume > 1000000 ? 'actually decent' : volume > 100000 ? 'mid' : 'dead'} at $${volume.toLocaleString()}. ${facts[0] || 'chart looking like every other shitcoin'}. 
    ${priceChange > 0 ? 'fomo at your own risk' : 'catching knives is a skill issue'}`;
    }
    /**
     * Handle general market queries (stocks, etc)
     */
    static handleGeneralMarket(evidence) {
        const facts = evidence.evidence.key_facts;
        return `${evidence.query} ${facts[0] || 'doing market things'}... 
    ${facts[1] || 'boomers probably buying'}. 
    ${facts[2] || 'check yahoo finance if you actually care'}. 
    imagine trading stocks when crypto exists`;
    }
    /**
     * Handle drama queries
     */
    static handleDrama(evidence) {
        const tweets = evidence.evidence.twitter_data?.tweets || [];
        const facts = evidence.evidence.key_facts;
        if (tweets.length === 0 && facts.length === 0) {
            return `no drama found about ${evidence.query}... either nothing happened or everyone moved on. 
      twitter has the memory of a goldfish`;
        }
        const topTweet = tweets[0];
        const sentiment = this.analyzeDramaSentiment(tweets);
        return `oh the ${evidence.query} situation? ${sentiment === 'spicy' ? 'absolutely unhinged' : 'mid drama tbh'}... ${facts[0] || topTweet?.text.substring(0, 100) || 'something happened'}. 
    ${facts[1] || 'people are mad'}. 
    ${sentiment === 'spicy' ? 'grab popcorn' : 'probably nothing'}. 
    twitter verdict: ${facts[2] || 'ratio + L + fell off'}`;
    }
    /**
     * Handle gaming queries
     */
    static handleGaming(evidence) {
        const facts = evidence.evidence.key_facts;
        const tweets = evidence.evidence.twitter_data?.tweets || [];
        // Detect what type of gaming query
        const isEsports = evidence.query.toLowerCase().includes('tournament') ||
            evidence.query.toLowerCase().includes('championship');
        const isPatch = evidence.query.toLowerCase().includes('patch') ||
            evidence.query.toLowerCase().includes('nerf') ||
            evidence.query.toLowerCase().includes('buff');
        const isGame = !isEsports && !isPatch;
        if (isEsports) {
            return `${evidence.query} results: ${facts[0] || 'someone won'}... 
      ${facts[1] || 'games were played'}. 
      ${tweets[0]?.text.substring(0, 50) || 'twitter malding as usual'}. 
      ${facts[2] || 'touch grass instead of watching'}`;
        }
        if (isPatch) {
            return `${evidence.query}: ${facts[0] || 'they changed stuff'}... 
      ${facts[1] || 'your main got nerfed probably'}. 
      reddit crying about ${facts[2] || 'balance'}. 
      skill issue if you can't adapt`;
        }
        // General game query
        return `${evidence.query}? ${facts[0] || 'its a game'}... 
    ${facts[1] || 'people play it'}. 
    ${facts[2] || tweets[0]?.text.substring(0, 50) || 'exists on steam probably'}. 
    ${tweets.length > 0 ? 'twitter says its mid' : 'dead game'} but you'll play anyway`;
    }
    /**
     * Handle tech queries
     */
    static handleTech(evidence) {
        const facts = evidence.evidence.key_facts;
        const tweets = evidence.evidence.twitter_data?.tweets || [];
        // Detect type of tech query
        const isProduct = evidence.query.toLowerCase().includes('launch') ||
            evidence.query.toLowerCase().includes('release');
        const isCompany = facts.some(f => f?.toLowerCase().includes('ceo') ||
            f?.toLowerCase().includes('company'));
        const isAI = evidence.query.toLowerCase().includes('ai') ||
            evidence.query.toLowerCase().includes('gpt') ||
            evidence.query.toLowerCase().includes('llm');
        if (isAI) {
            return `${evidence.query}: ${facts[0] || 'another ai thing'}... 
      ${facts[1] || 'probably just gpt wrapper'}. 
      tech twitter ${tweets.length > 0 ? 'debating' : 'ignoring'} whether its revolutionary or mid. 
      ${facts[2] || 'agi still 10 years away (always has been)'}`;
        }
        if (isProduct) {
            return `${evidence.query} ${facts[0] || 'launched'}... 
      ${facts[1] || 'its a product that exists'}. 
      hackernews probably ${tweets.length > 0 ? 'roasting' : 'ignoring'} it. 
      ${facts[2] || 'another solution looking for a problem'}`;
        }
        if (isCompany) {
            return `${evidence.query}: ${facts[0] || 'tech company'}... 
      ${facts[1] || 'makes money somehow'}. 
      ${facts[2] || tweets[0]?.text.substring(0, 50) || 'exists in silicon valley'}. 
      probably overvalued but what isn't`;
        }
        return `${evidence.query}? ${facts[0] || 'tech thing'}... 
    ${facts[1] || 'nerds care about it'}. 
    ${facts[2] || 'probably runs on aws'}. 
    ${tweets.length > 0 ? 'discourse happening' : 'nobody talking about it'} on tech twitter`;
    }
    /**
     * Handle culture queries (memes, trends, etc)
     */
    static handleCulture(evidence) {
        const facts = evidence.evidence.key_facts;
        const tweets = evidence.evidence.twitter_data?.tweets || [];
        // Detect culture type
        const isMeme = evidence.query.toLowerCase().includes('meme') ||
            evidence.query.toLowerCase().includes('trend');
        const isInfluencer = evidence.evidence.twitter_data?.profile;
        const isShow = facts.some(f => f?.toLowerCase().includes('netflix') ||
            f?.toLowerCase().includes('show') ||
            f?.toLowerCase().includes('movie'));
        if (isMeme) {
            return `${evidence.query}: ${facts[0] || 'internet did a thing'}... 
      ${facts[1] || 'went viral for 5 minutes'}. 
      ${tweets[0]?.text.substring(0, 50) || 'people posted about it'}. 
      already dead by the time you asked`;
        }
        if (isShow) {
            return `${evidence.query}: ${facts[0] || 'content exists'}... 
      ${facts[1] || 'people watched it'}. 
      twitter consensus: ${tweets[0]?.text.substring(0, 50) || facts[2] || 'mid'}. 
      you'll watch it anyway for the discourse`;
        }
        if (isInfluencer) {
            return `${evidence.query} ${facts[0] || 'does content'}... 
      ${evidence.evidence.twitter_data.profile.followers || 'some'} people watching. 
      ${facts[1] || 'posts stuff'}. 
      ${facts[2] || 'algorithm loves them for some reason'}`;
        }
        return `${evidence.query}? ${facts[0] || 'culture thing'}... 
    ${facts[1] || 'normies discovered it'}. 
    ${tweets[0]?.text.substring(0, 50) || facts[2] || 'happening on the internet'}. 
    touch grass if this matters to you`;
    }
    /**
     * Handle explainer queries
     */
    static handleExplainer(evidence) {
        const facts = evidence.evidence.key_facts;
        if (facts.length === 0) {
            return `${evidence.query}? no idea bestie... 
      either its made up or too niche even for me. 
      try google or asking someone who cares`;
        }
        return `${evidence.query} explained: ${facts[0]}... 
    basically ${facts[1] || 'its a thing'}. 
    ${facts[2] || 'thats it'}. 
    ${facts.length > 3 ? 'theres more but' : ''} you could've googled this`;
    }
    /**
     * Handle roast queries
     */
    static handleRoast(evidence) {
        const facts = evidence.evidence.key_facts;
        const profile = evidence.evidence.twitter_data?.profile;
        // Domain-specific roasts
        switch (evidence.domain) {
            case 'gaming':
                return `${evidence.query}? absolute bot behaviour... 
        ${facts[0] || 'cant even describe how bad'}. 
        ${facts[1] || 'skill issue manifest'}. 
        uninstall and ${facts[2] || 'try minecraft peaceful mode'}`;
            case 'crypto':
                return `${evidence.query} bagholders down catastrophic... 
        ${facts[0] || 'bought the absolute top'}. 
        ${facts[1] || 'diamond hands to zero'}. 
        mcdonalds hiring btw`;
            case 'tech':
                return `${evidence.query} thinking they're revolutionary... 
        ${facts[0] || 'made another todo app'}. 
        ${facts[1] || 'javascript framework #47382'}. 
        your github has more archived repos than stars`;
            default:
                return `${evidence.query}? ${facts[0] || 'absolute L'}... 
        ${facts[1] || 'down bad'}. 
        ${facts[2] || 'maidenless behaviour'}. 
        ${profile?.followers || '0'} people watching you fail`;
        }
    }
    /**
     * Handle pure chaos (no evidence needed)
     */
    static handleChaos(evidence) {
        const chaosResponses = [
            `${evidence.query}? we don't talk about that here`,
            `${evidence.query} is why we can't have nice things`,
            `imagine caring about ${evidence.query} in ${new Date().getFullYear()}`,
            `${evidence.query} walked so disappointment could run`,
            `${evidence.query}... many such cases unfortunately`,
            `not ${evidence.query} living rent free in your head`,
            `${evidence.query} is just astrology for ${evidence.domain} people`,
            `${evidence.query}? in this economy?`,
            `${evidence.query} is a psyop and i have proof (i made it up)`,
            `society has progressed past the need for ${evidence.query}`
        ];
        return chaosResponses[Math.floor(Math.random() * chaosResponses.length)];
    }
    /**
     * Analyze drama sentiment from tweets
     */
    static analyzeDramaSentiment(tweets) {
        if (tweets.length === 0)
            return 'dead';
        const totalEngagement = tweets.reduce((sum, t) => sum + (t.likes || 0) + (t.retweets || 0), 0);
        if (totalEngagement > 10000)
            return 'spicy';
        if (totalEngagement > 1000)
            return 'mid';
        return 'dead';
    }
}
//# sourceMappingURL=response-handlers.js.map