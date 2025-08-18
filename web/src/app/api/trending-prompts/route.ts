import { NextResponse } from 'next/server';
import { createAnthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';

// Don't specify runtime - let Netlify use default Node.js runtime

// Get current date/time for context
function getCurrentContext() {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  };
  const dateStr = now.toLocaleDateString('en-US', options);
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  
  return {
    date: dateStr,
    time: timeStr,
    month: 'August',
    year: '2025',
    season: 'Summer',
    context: 'back-to-school season, heatwave, tech earnings season'
  };
}

// Generate trending prompts based on current events
async function generateTrendingPrompts(): Promise<string[]> {
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'placeholder-for-build') {
    console.log('No Anthropic API key, using fallback prompts');
    return getFallbackPrompts();
  }

  try {
    const context = getCurrentContext();
    
    const anthropic = createAnthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    
    const { text } = await generateText({
      model: anthropic(process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514'),
      prompt: `You are helping generate trending conversation prompts for throp (a chaotic Gen Z AI).
      
Current date: ${context.date} (${context.season} 2025)
Context: ${context.context}

Generate 7 engaging prompts that users would want to ask throp about RIGHT NOW.
These should be:
- Related to current events, drama, or trending topics
- Written in casual Gen Z style 
- Specific enough to be interesting
- Mix of serious topics (economy, tech) and fun/drama
- Things people are actually talking about this week

Return ONLY a JSON array of strings, no other text.
Example format: ["prompt 1", "prompt 2", "prompt 3"]

Make them feel current and relevant to ${context.month} ${context.year}.`,
      temperature: 0.9,
    });

    try {
      const prompts = JSON.parse(text);
      if (Array.isArray(prompts) && prompts.length > 0) {
        console.log('Generated trending prompts:', prompts);
        return prompts.slice(0, 7); // Ensure we have exactly 7
      }
    } catch (parseError) {
      console.error('Failed to parse prompts:', parseError);
      return getFallbackPrompts();
    }
  } catch (error) {
    console.error('Error generating trending prompts:', error);
    return getFallbackPrompts();
  }

  return getFallbackPrompts();
}

// Fallback prompts if API fails
function getFallbackPrompts(): string[] {
  const fallbacks = [
    "why is everything so expensive rn",
    "explain the latest twitter drama",
    "is AI taking over or nah",
    "why is dating so hard in 2025",
    "whats the deal with the heatwave",
    "is crypto back or still dead",
    "why does everyone hate [current thing]",
    "explain tiktok's new obsession",
    "is college still worth it fr",
    "why are concerts $500 now"
  ];
  
  // Randomly select 7
  return fallbacks.sort(() => Math.random() - 0.5).slice(0, 7);
}

export async function GET() {
  try {
    const prompts = await generateTrendingPrompts();
    
    return NextResponse.json({
      prompts,
      generated_at: new Date().toISOString(),
      ttl: 3600 // Cache for 1 hour
    });
  } catch (error) {
    console.error('Error in trending prompts route:', error);
    return NextResponse.json({
      prompts: getFallbackPrompts(),
      generated_at: new Date().toISOString(),
      ttl: 3600,
      fallback: true
    });
  }
}
