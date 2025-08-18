import { NextResponse } from 'next/server';

/**
 * Hot Takes API Route
 * Fetches hot takes from the backend server which handles generation without timeout issues
 */
export async function GET() {
  try {
    // Always use the hardcoded backend URL to avoid env var issues
    const backendUrl = 'https://throp-bot-947985992378.us-central1.run.app';
    
    console.log('Fetching hot takes from backend:', backendUrl);
    
    // Fetch hot takes from backend with shorter timeout for Netlify
    const response = await fetch(`${backendUrl}/api/hot-takes`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Shorter timeout for Netlify functions
      signal: AbortSignal.timeout(8000), // 8 second timeout
    });
    
    if (!response.ok) {
      console.error('Backend returned error:', response.status);
      throw new Error(`Backend returned ${response.status}`);
    }
    
    const data = await response.json();
    
    // Pass through the backend response
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error fetching hot takes from backend:', error);
    
    // Return fallback hot takes on error
    const fallbackTakes = [
      {
        id: `fallback-${Date.now()}-0`,
        topic: 'Tech Drama',
        trendingVolume: '500k posts',
        take: 'another day another tech bro thinking they invented something that already exists',
        timestamp: new Date(),
        agreeCount: 1234,
        category: 'tech',
      },
      {
        id: `fallback-${Date.now()}-1`,
        topic: 'Breaking News',
        trendingVolume: '1.2M posts',
        take: 'breaking news is just the same story with a different font lmao',
        timestamp: new Date(),
        agreeCount: 2456,
        category: 'news',
      },
      {
        id: `fallback-${Date.now()}-2`,
        topic: 'Viral Moment',
        trendingVolume: '800k posts',
        take: 'yall really watching someone do the bare minimum and calling it iconic',
        timestamp: new Date(),
        agreeCount: 3567,
        category: 'entertainment',
      },
    ];
    
    return NextResponse.json({
      success: true,
      takes: fallbackTakes,
      source: 'frontend-fallback',
      error: 'Using fallback data',
    });
  }
}

// POST endpoint for generating custom takes on demand
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { topic, context } = body;
    
    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }
    
    // For custom takes, we can still use the backend
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://throp-bot-947985992378.us-central1.run.app';
    
    // Send to backend chat endpoint for a hot take
    const response = await fetch(`${backendUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Give a hot take on "${topic}". Context: ${context || 'trending topic'}. Be cynical, gen z, under 20 words.`,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }
    
    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      take: {
        id: `custom-${Date.now()}`,
        topic,
        take: data.response || 'no thoughts head empty',
        timestamp: new Date(),
        agreeCount: 0,
        category: 'custom',
      },
    });
    
  } catch (error) {
    console.error('Error generating custom take:', error);
    return NextResponse.json(
      { error: 'Failed to generate take' },
      { status: 500 }
    );
  }
}