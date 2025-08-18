import { NextRequest } from 'next/server';

// Use Node.js runtime for Netlify compatibility
export const runtime = 'nodejs';

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
