import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Extract the last user message
    const messages = body.messages || [];
    const lastUserMessage = messages.filter((m: {role: string}) => m.role === 'user').pop();
    const message = lastUserMessage?.content || 'hello';
    
    console.log('Proxying message:', message);
    
    // Forward the request to the external API with correct format
    const response = await fetch('https://throp-gh-production.up.railway.app/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }), // API expects { message: string }
    });

    // Get the JSON response
    const data = await response.json();
    
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'API request failed');
    }
    
    // Convert to streaming format that the frontend expects
    const responseText = data.response || 'idk what to say lol';
    const encoder = new TextEncoder();
    
    console.log('API Response:', responseText);
    
    // Create a simple streaming response
    const stream = new ReadableStream({
      start(controller) {
        // Clean the response text and send it
        const cleanedText = responseText.replace(/\n/g, ' ').replace(/"/g, '\\"');
        const chunk = `0:"${cleanedText}"\n`;
        console.log('Sending chunk:', chunk);
        controller.enqueue(encoder.encode(chunk));
        controller.close();
      },
    });
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return new Response(
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
