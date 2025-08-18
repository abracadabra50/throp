import { NextRequest, NextResponse } from 'next/server';

// Don't specify runtime - let Netlify use default Node.js runtime
// export const runtime = 'edge'; // This causes issues on Netlify

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Extract the last user message
    const messages = body.messages || [];
    const lastUserMessage = messages.filter((m: {role: string}) => m.role === 'user').pop();
    const message = lastUserMessage?.content || 'hello';
    
    console.log('Proxying message:', message);
    
    // Forward the request to the GCP backend with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25 second timeout
    
    const response = await fetch('https://throp-bot-947985992378.us-central1.run.app/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }), // API expects { message: string }
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    // Check response status first
    if (!response.ok) {
      console.error('Backend returned error status:', response.status);
      throw new Error(`Backend returned ${response.status}`);
    }
    
    // Get the JSON response
    const data = await response.json();
    
    if (!data.success) {
      console.error('Backend returned failure:', data);
      throw new Error(data.error || 'API request failed');
    }
    
    // Convert to streaming format that the frontend expects
    const responseText = data.response || 'idk what to say lol';
    
    console.log('API Response:', responseText);
    
    // Return a simple text/event-stream response that Netlify can handle
    const cleanedText = responseText.replace(/\n/g, ' ').replace(/"/g, '\\"');
    const streamResponse = `0:"${cleanedText}"\n`;
    
    return new NextResponse(streamResponse, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to connect to backend API',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
