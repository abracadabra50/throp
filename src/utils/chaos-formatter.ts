/**
 * Chaos Formatter - Light touch chaos enhancement
 * Removes AI tells and adds subtle personality without overdoing it
 */

/**
 * Light slang replacements - applied sparingly
 */
const LIGHT_REPLACEMENTS: Record<string, string[]> = {
  // Keep some crypto terms but don't overdo it
  'bitcoin': ['bitcoin', 'btc', 'corn'],
  'ethereum': ['ethereum', 'eth'],
  'increase': ['pump', 'go up', 'moon'],
  'decrease': ['dump', 'tank', 'nuke'],
  
  // General internet slang
  'very': ['very', 'hella', 'super', 'mega'],
  'good': ['good', 'based', 'solid', 'fire'],
  'bad': ['bad', 'trash', 'mid', 'L'],
  'yes': ['yes', 'yep', 'yeah', 'yuh'],
  'no': ['no', 'nah', 'nope'],
  'money': ['money', 'cash', 'bags', 'bread'],
  'people': ['people', 'folks', 'humans', 'degens'],
  
  // Remove formal connectors
  'however': ['but', 'though', 'anyway'],
  'therefore': ['so', 'thus', 'basically'],
  'furthermore': ['also', 'plus', 'and'],
  'regarding': ['about', 're:', 'on'],
};

/**
 * Occasional personality injections
 */
const LIGHT_INJECTIONS = [
  'tbh',
  'ngl',
  'fr',
  'lol',
  'lmao',
  'imo',
  'idk',
  'btw',
  'fwiw',
];

/**
 * Endings that add personality without being too much
 */
const SUBTLE_ENDINGS = [
  'probably',
  'i guess',
  'or whatever',
  'idk tho',
  'just saying',
  'but yeah',
];

/**
 * Remove obvious AI markers
 */
function removeAITells(text: string): string {
  // Remove em dashes
  text = text.replace(/—/g, ',');
  text = text.replace(/–/g, '-');
  
  // Remove semicolons (too formal)
  text = text.replace(/;/g, ',');
  
  // Remove overly formal AI phrases
  const aiPhrases = [
    'it\'s worth noting that',
    'it is worth noting',
    'let me explain',
    'allow me to',
    'I\'d be happy to',
    'I would be happy to',
    'certainly',
    'undoubtedly',
    'in conclusion',
    'in summary',
    'to summarize',
  ];
  
  aiPhrases.forEach(phrase => {
    const regex = new RegExp(phrase, 'gi');
    text = text.replace(regex, '');
  });
  
  return text;
}

/**
 * Light chaos transformation - enhance don't replace
 */
export function chaosTransform(text: string): string {
  let chaotic = text.toLowerCase();
  
  // Always remove AI tells
  chaotic = removeAITells(chaotic);
  
  // Remove citations and thread markers
  chaotic = chaotic.replace(/\[\d+\]/g, '');
  chaotic = chaotic.replace(/\[\d+\/\d+\]/g, '');
  chaotic = chaotic.replace(/\(\d+\/\d+\)/g, '');
  
  // Remove hashtags except $throp
  chaotic = chaotic.replace(/#(?!throp)\w+/g, '');
  
  // Light word replacements (only 30% chance)
  Object.entries(LIGHT_REPLACEMENTS).forEach(([formal, informal]) => {
    if (Math.random() < 0.3) {
      const regex = new RegExp(`\\b${formal}\\b`, 'gi');
      const replacement = informal[Math.floor(Math.random() * informal.length)];
      chaotic = chaotic.replace(regex, replacement);
    }
  });
  
  // Add occasional personality (20% chance per long sentence)
  const sentences = chaotic.split(/(?<=[.!?])\s+/);
  chaotic = sentences.map(sentence => {
    if (Math.random() < 0.2 && sentence.length > 50) {
      const injection = LIGHT_INJECTIONS[Math.floor(Math.random() * LIGHT_INJECTIONS.length)];
      return `${sentence} ${injection}`;
    }
    return sentence;
  }).join(' ');
  
  // Very rare emphasis (1% of words)
  const words = chaotic.split(' ');
  chaotic = words.map(word => {
    if (Math.random() < 0.01 && word.length > 4 && !word.includes('http')) {
      return word.toUpperCase();
    }
    return word;
  }).join(' ');
  
  // Occasionally replace periods with commas (10%)
  chaotic = chaotic.replace(/\. /g, (match) => {
    return Math.random() < 0.1 ? ', ' : match;
  });
  
  // Add subtle ending (25% chance)
  if (Math.random() < 0.25) {
    const ending = SUBTLE_ENDINGS[Math.floor(Math.random() * SUBTLE_ENDINGS.length)];
    chaotic = `${chaotic.trimEnd()}. ${ending}`;
  }
  
  // Very rare $throp (2%)
  if (Math.random() < 0.02) {
    chaotic += ' $throp';
  }
  
  // Clean up
  chaotic = chaotic
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.!?])/g, '$1')
    .replace(/([,.!?])\s*([,.!?])/g, '$1$2')
    .trim();
  
  // Ensure 280 char limit
  if (chaotic.length > 280) {
    const sentences = chaotic.match(/[^.!?]+[.!?]+/g) || [chaotic];
    let result = '';
    for (const sentence of sentences) {
      if ((result + sentence).length <= 277) {
        result += sentence + ' ';
      } else {
        break;
      }
    }
    chaotic = result.trim() || chaotic.substring(0, 277);
    chaotic += '...';
  }
  
  return chaotic;
}

/**
 * Format for threads
 */
export function formatThreadWithChaos(texts: string[]): string[] {
  return texts.map((text, index) => {
    const tweet = chaosTransform(text);
    
    if (texts.length > 1) {
      if (index === 0) {
        return `${tweet}\n\n🧵`;
      } else if (index === texts.length - 1) {
        return `${tweet}\n\n/thread`;
      }
    }
    
    return tweet;
  });
}

/**
 * Validate chaos is present but not overdone
 */
export function validateChaos(text: string): boolean {
  const hasLowercase = text !== text.toUpperCase();
  const notTooFormal = !text.includes('Furthermore') && !text.includes('Therefore');
  return hasLowercase && notTooFormal;
}