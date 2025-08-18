exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const body = JSON.parse(event.body);
    const messages = body.messages || [];
    
    // Extract the last user message
    const lastUserMessage = messages
      .filter(m => m.role === 'user')
      .pop();
    
    const message = lastUserMessage?.content || 'hello';
    
    // Forward to backend
    const response = await fetch('https://throp-bot-947985992378.us-central1.run.app/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        statusCode: response.status,
        body: JSON.stringify({ 
          error: `Backend error: ${response.status}`,
          details: errorText 
        })
      };
    }

    const data = await response.json();
    
    // Convert to streaming format
    const responseText = data.response || 'idk what to say lol';
    const streamResponse = `0:"${responseText.replace(/"/g, '\\"')}"\n`;
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
      body: streamResponse
    };
  } catch (error) {
    console.error('Proxy error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Proxy error',
        details: error.message 
      })
    };
  }
};
