import { NextRequest, NextResponse } from 'next/server';
import { createAnthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import { chaosTransform } from '@/utils/chaos-formatter';

// Initialize Anthropic (will use ANTHROPIC_API_KEY from env)
const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});


// Fetch trending topics (currently using realistic mocks, X API integration pending)
async function getRealTrends() {
  // Try to get Claude to suggest what might be trending
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      const prompt = `Today is ${dateStr}. What are likely 5 trending topics on Twitter/X right now in August 2025?
Consider: summer heat, tech news, entertainment, crypto, back-to-school season, politics, gaming.
Return ONLY a JSON array like this, no other text:
[{"name":"Topic Name","volume":"XXXk posts","context":"Brief context","category":"tech/news/entertainment/crypto/sports"}]`;
      
      const anthropicClient = createAnthropic({
        apiKey: process.env.ANTHROPIC_API_KEY || '',
      });
      
      const { text } = await generateText({
        model: anthropicClient(process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514'),
        prompt,
        temperature: 0.7,
      });
      
      try {
        const trends = JSON.parse(text.trim());
        if (Array.isArray(trends) && trends.length > 0) {
          console.log('Claude suggested trending topics:', trends.map(t => t.name).join(', '));
          return trends.slice(0, 5);
        }
      } catch {
        console.log('Could not parse Claude trends, using fallback');
      }
    } catch (error) {
      console.log('Error getting Claude trends:', error);
    }
  }
  
  // Fallback to mock trends
  console.log('Using mock trending topics for August 2025');
  return getMockTrends();
}



// More realistic current trending topics (August 2025) 
const getMockTrends = () => {
  const currentTopics = [
    { 
      name: '#HeatDome2025', 
      volume: '892K posts',
      context: 'Extreme temps hit 125°F in Phoenix, power grid struggles',
      category: 'news'
    },
    { 
      name: 'iPhone 17 Pro', 
      volume: '567K posts',
      context: 'Leaked specs show AI-powered holographic display',
      category: 'tech'
    },
    { 
      name: '#BackToSchoolNightmare', 
      volume: '445K posts',
      context: 'Parents losing it over $500 supply lists',
      category: 'news'
    },
    { 
      name: 'SOL Flips ETH', 
      volume: '678K posts',
      context: 'Solana briefly overtakes Ethereum market cap',
      category: 'crypto'
    },
    { 
      name: 'Drake Quits Music', 
      volume: '823K posts',
      context: 'Announces retirement after losing another beef',
      category: 'entertainment'
    },
    { 
      name: 'TikTok Ban Update', 
      volume: '234K posts',
      context: 'Supreme Court ruling expected next week',
      category: 'tech'
    },
    { 
      name: 'iPhone 17', 
      volume: '789K posts',
      context: 'Apple leaks show foldable iPhone design',
      category: 'tech'
    },
    { 
      name: 'NBA Free Agency', 
      volume: '556K posts',
      context: 'LeBron James shocking team switch',
      category: 'sports'
    },
    { 
      name: 'Back to School', 
      volume: '123K posts',
      context: 'Students preparing for fall semester',
      category: 'news'
    },
    { 
      name: 'Travis Scott', 
      volume: '345K posts',
      context: 'Utopia tour announcement',
      category: 'entertainment'
    }
  ];
  
  // Shuffle and return 5 random topics to simulate real trends changing
  return currentTopics
    .sort(() => Math.random() - 0.5)
    .slice(0, 5);
};

// Generate throp-style takes using Claude
const generateThropTake = async (trend: {name: string, category?: string, context?: string}): Promise<string> => {
  // Try to use Claude for better takes
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      const timeStr = now.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
      
      const randomSeed = Math.random();
      const prompt = `Current date/time: ${dateStr} at ${timeStr}
You're a chaotic gen z poster in August 2025. Give ONE hot take about "${trend.name}".
      
Context: ${trend.context || 'trending topic right now'}
Remember it's late summer 2025, hot weather, back-to-school season, everyone chronically online.

${randomSeed > 0.7 ? 'Start with something like: the way, imagine, wild how, cant believe' : ''}
${randomSeed > 0.5 ? 'Include words like: lowkey, giving, its the ___ for me, no but' : ''}
${randomSeed > 0.3 ? 'Be extra cynical and roast everyone involved' : 'Be casually dismissive'}

Roast the people who care about this topic, like:
- "y'all really [doing thing] and thinking you did something"
- "the [type of person] to [thing] pipeline is real"
- "tell me you're [thing] without telling me"
- "imagine being pressed about [topic] couldn't be me"

Keep it under 20 words. Be accurate but unhinged. Natural gen z voice, not forced.
Just the take, nothing else:`;
      
      const { text } = await generateText({
        model: anthropic(process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514'),
        prompt,
        temperature: 0.95,

      });
      
      console.log(`Claude response for ${trend.name}: "${text}"`);
      
      // Apply chaos formatter for consistency
      const transformed = chaosTransform(text.trim());
      console.log(`After chaos formatter: "${transformed}"`);
      return transformed;
    } catch (error) {
      console.log('Claude API error, falling back:', error);
    }
  }
  
  // Try backend API as second option
  try {
    const prompt = `You're throp. Give a hot take on "${trend.name}". Context: ${trend.context || 'trending'}. Be cynical, gen z, under 20 words.`;
    
    const response = await fetch('http://localhost:3001/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: prompt }),
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.response) {
        // Apply chaos formatter
        return chaosTransform(data.response);
      }
    }
  } catch {
    console.log('Backend API not available, using fallback takes');
  }
  
  // Fallback to pre-written takes if all APIs fail
  console.log(`FALLBACK: Generating templated take for ${trend.name}`);
  const takes = [
    `${trend.name.toLowerCase()} trending again? groundbreaking`,
    `the way everyone suddenly cares about ${trend.name.toLowerCase()}`,
    `${trend.name.toLowerCase()} discourse is giving brain rot energy`,
    `not y'all acting surprised about ${trend.name.toLowerCase()}`,
    `${trend.name.toLowerCase()} having its weekly main character moment`
  ];
  
  const take = takes[Math.floor(Math.random() * takes.length)];
  
  // Apply chaos formatter to fallback takes too
  return chaosTransform(take);
};

export async function GET() {
  try {
    // Fetch real or mock trends
    const trends = await getRealTrends();
    
    // Log what we're using
    if (process.env.ANTHROPIC_API_KEY) {
      console.log('Using Claude for hot takes generation');
    } else {
      console.log('No Anthropic API key, will use fallback takes');
    }
    
    // Generate takes for each trend
    const takesPromises = trends.slice(0, 5).map(async (trend, index) => ({
      id: `take-${Date.now()}-${index}`,
      topic: trend.name,
      trendingVolume: trend.volume,
      take: await generateThropTake(trend),
      timestamp: new Date(),
      agreeCount: Math.floor(Math.random() * 2000) + 100,
      category: trend.category
    }));
    
    const takes = await Promise.all(takesPromises);
    
    return NextResponse.json({ 
      success: true, 
      takes,
      source: process.env.ANTHROPIC_API_KEY ? 'claude-generated' : 'fallback'
    });
    
  } catch (error) {
    console.error('Error fetching hot takes:', error);
    
    // Return mock data as fallback
    const mockTrends = getMockTrends();
    const fallbackTakesPromises = mockTrends.slice(0, 3).map(async (trend, index) => ({
      id: `fallback-${Date.now()}-${index}`,
      topic: trend.name,
      trendingVolume: trend.volume,
      take: await generateThropTake(trend),
      timestamp: new Date(),
      agreeCount: Math.floor(Math.random() * 1000) + 50,
      category: trend.category
    }));
    
    const fallbackTakes = await Promise.all(fallbackTakesPromises);
    
    return NextResponse.json({ 
      success: true, 
      takes: fallbackTakes,
      source: 'fallback',
      error: 'Using fallback data'
    });
  }
}

// POST endpoint for generating custom takes on demand
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { topic, context } = body;
    
    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }
    
    const take = await generateThropTake({
      name: topic,
      context: context || '',
      category: 'custom'
    });
    
    return NextResponse.json({
      success: true,
      take: {
        id: `custom-${Date.now()}`,
        topic,
        take,
        timestamp: new Date(),
        agreeCount: 0,
        category: 'custom'
      }
    });
    
  } catch (error) {
    console.error('Error generating custom take:', error);
    return NextResponse.json(
      { error: 'Failed to generate take' },
      { status: 500 }
    );
  }
}