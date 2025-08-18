import { NextRequest, NextResponse } from 'next/server';

// Don't specify runtime - let Netlify use default Node.js runtime
// export const runtime = 'edge'; // This causes issues on Netlify

export async function POST(req: NextRequest) {
  const requestId = Date.now();
  console.log(`[${requestId}] Proxy request started`);
  
  try {
    const body = await req.json();
    console.log(`[${requestId}] Received body:`, JSON.stringify(body));
    
    // Extract the last user message
    const messages = body.messages || [];
    console.log(`[${requestId}] Extracted messages:`, messages);
    
    const lastUserMessage = messages.filter((m: {role: string}) => m.role === 'user').pop();
    console.log(`[${requestId}] Last user message:`, lastUserMessage);
    
    let message = lastUserMessage?.content;
    console.log(`[${requestId}] Raw message content:`, message);
    
    // Ensure we always have a valid message
    if (!message || typeof message !== 'string' || message.trim() === '') {
      console.error(`[${requestId}] Invalid message detected:`, { message, type: typeof message });
      message = 'hello'; // Fallback
    }
    
    // Trim whitespace
    message = message.trim();
    
    console.log(`[${requestId}] Final message to send:`, message);
    
    // Double-check before sending
    if (!message) {
      console.error(`[${requestId}] Message is still empty after processing!`);
      throw new Error('Unable to extract valid message from request');
    }
    
    // Forward the request to the GCP backend with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25 second timeout
    
    console.log(`[${requestId}] Sending to backend:`, { message });
    
    const response = await fetch('https://throp-bot-947985992378.us-central1.run.app/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }), // API expects { message: string }
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    console.log(`[${requestId}] Backend response status:`, response.status);

    // Check response status first
    if (!response.ok) {
      console.error(`[${requestId}] Backend returned error status:`, response.status);
      const errorText = await response.text();
      console.error(`[${requestId}] Backend error response:`, errorText);
      throw new Error(`Backend returned ${response.status}: ${errorText}`);
    }
    
    // Get the JSON response
    const data = await response.json();
    console.log(`[${requestId}] Backend response data:`, data);
    
    if (!data.success) {
      console.error(`[${requestId}] Backend returned failure:`, data);
      throw new Error(data.error || 'API request failed');
    }
    
    // Convert to streaming format that the frontend expects
    const responseText = data.response || 'idk what to say lol';
    
    console.log(`[${requestId}] API Response:`, responseText);
    
    // Return a simple text/event-stream response that Netlify can handle
    const cleanedText = responseText.replace(/\n/g, ' ').replace(/"/g, '\\"');
    const streamResponse = `0:"${cleanedText}"\n`;
    
    console.log(`[${requestId}] Returning stream response`);
    
    return new NextResponse(streamResponse, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error(`[${requestId}] Proxy error:`, error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to connect to backend API',
        details: error instanceof Error ? error.message : 'Unknown error',
        requestId
      }),
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
