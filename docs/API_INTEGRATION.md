# 🔌 Throp API Integration Guide

## Overview

Throp provides a REST API and WebSocket server that enables web interfaces and other applications to interact with the bot. This allows you to build custom frontends, dashboards, or integrate Throp into existing systems.

## 🚀 Quick Start

### 1. Start the API Server

```bash
# Start only the API server
npm run dev:api

# Or start both bot and API server
npm run dev:all
```

The API server will start on port 3001 by default (configurable via `API_PORT` env variable).

### 2. Test the Connection

```bash
# Health check
curl http://localhost:3001/health

# Get status
curl http://localhost:3001/api/status
```

## 📡 REST API Endpoints

### Health Check
```http
GET /health
```

Returns basic health status of the API server.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-09T10:00:00.000Z"
}
```

### Bot Status
```http
GET /api/status
```

Returns comprehensive status information about the bot and its services.

**Response:**
```json
{
  "status": "online",
  "version": "0.2.0",
  "twitter": {
    "connected": true,
    "username": "throp",
    "rateLimitRemaining": 45
  },
  "perplexity": {
    "connected": true,
    "model": "sonar-medium-online"
  },
  "redis": {
    "connected": true
  },
  "stats": {
    "mentionsProcessed": 150,
    "responsesGenerated": 142,
    "errors": 3,
    "uptime": 3600000
  }
}
```

### Chat with Throp
```http
POST /api/chat
```

Send a message to Throp and receive an AI-powered response using Perplexity.

**Request Body:**
```json
{
  "message": "What's the latest news about AI?",
  "context": {
    "username": "web_user",
    "conversationHistory": [
      {
        "role": "user",
        "content": "Hello!"
      },
      {
        "role": "assistant",
        "content": "Hi there! How can I help you today?"
      }
    ],
    "metadata": {
      "source": "web_interface",
      "sessionId": "abc123"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "response": "Here are the latest AI developments...",
  "citations": [
    "https://source1.com",
    "https://source2.com"
  ],
  "threadParts": null,
  "metadata": {
    "model": "sonar-medium-online",
    "usage": {
      "prompt_tokens": 150,
      "completion_tokens": 200,
      "total_tokens": 350
    }
  }
}
```

### Get Recent Mentions
```http
GET /api/mentions?limit=10
```

Retrieve recent Twitter mentions for the bot.

**Response:**
```json
{
  "success": true,
  "mentions": [
    {
      "id": "1234567890",
      "text": "@throp What's the weather like?",
      "author": "user123",
      "createdAt": "2024-01-09T10:00:00.000Z",
      "processed": false,
      "response": null
    }
  ]
}
```

### Process Specific Mention
```http
POST /api/mentions/:id/process
```

Process a specific Twitter mention and optionally reply to it.

**Request Body:**
```json
{
  "dryRun": false
}
```

**Response:**
```json
{
  "success": true,
  "response": "The weather is looking great today!",
  "replyId": "1234567891",
  "dryRun": false
}
```

### Get Cached Interactions
```http
GET /api/cache/interactions?limit=100
```

Retrieve recent cached interactions from both Twitter and web interface.

**Response:**
```json
{
  "success": true,
  "interactions": [
    {
      "id": "1704795600000-abc123",
      "question": "What's AI?",
      "response": "AI stands for Artificial Intelligence...",
      "timestamp": "2024-01-09T10:00:00.000Z",
      "source": "web"
    }
  ]
}
```

### Clear Cache
```http
POST /api/cache/clear
```

Clear all cached data (requires appropriate permissions).

**Response:**
```json
{
  "success": true,
  "message": "Cache cleared successfully"
}
```

## 🔌 WebSocket Events

The API server also provides WebSocket support for real-time communication.

### Connecting to WebSocket

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001');

socket.on('connect', () => {
  console.log('Connected to Throp WebSocket');
});
```

### Available Events

#### Send Chat Message
```javascript
socket.emit('chat', {
  message: 'Hello Throp!',
  context: {
    username: 'web_user'
  }
});
```

#### Receive Response
```javascript
socket.on('response', (data) => {
  console.log('Response:', data.response);
  console.log('Citations:', data.citations);
});
```

#### Status Updates
```javascript
socket.on('status', (status) => {
  console.log('Bot status:', status);
});
```

#### New Response Broadcast
```javascript
socket.on('new_response', (data) => {
  console.log('New response generated:', data);
  // Update UI with new activity
});
```

#### Error Handling
```javascript
socket.on('error', (error) => {
  console.error('WebSocket error:', error.message);
});
```

## 🌐 Frontend Integration Example

### React/Next.js Example

```jsx
import { useState, useEffect } from 'react';
import io from 'socket.io-client';

function ChatInterface() {
  const [message, setMessage] = useState('');
  const [responses, setResponses] = useState([]);
  const [socket, setSocket] = useState(null);
  
  useEffect(() => {
    const newSocket = io('http://localhost:3001');
    
    newSocket.on('response', (data) => {
      setResponses(prev => [...prev, data.response]);
    });
    
    setSocket(newSocket);
    
    return () => newSocket.close();
  }, []);
  
  const sendMessage = async () => {
    // Via REST API
    const response = await fetch('http://localhost:3001/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    
    const data = await response.json();
    setResponses(prev => [...prev, data.response]);
    
    // Or via WebSocket
    // socket.emit('chat', { message });
  };
  
  return (
    <div>
      <input 
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={sendMessage}>Send</button>
      <div>
        {responses.map((resp, i) => (
          <div key={i}>{resp}</div>
        ))}
      </div>
    </div>
  );
}
```

### Vue.js Example

```vue
<template>
  <div>
    <input v-model="message" @keyup.enter="sendMessage" />
    <button @click="sendMessage">Send</button>
    <div v-for="(response, index) in responses" :key="index">
      {{ response }}
    </div>
  </div>
</template>

<script>
import { io } from 'socket.io-client';

export default {
  data() {
    return {
      message: '',
      responses: [],
      socket: null
    };
  },
  mounted() {
    this.socket = io('http://localhost:3001');
    
    this.socket.on('response', (data) => {
      this.responses.push(data.response);
    });
  },
  methods: {
    async sendMessage() {
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: this.message })
      });
      
      const data = await response.json();
      this.responses.push(data.response);
      this.message = '';
    }
  }
};
</script>
```

## 🔐 Security Considerations

### CORS Configuration

Configure allowed origins in your `.env` file:
```env
FRONTEND_URL=https://your-frontend.com
```

### Authentication (Future)

The API currently doesn't require authentication. For production use, consider implementing:
- API key authentication
- JWT tokens
- OAuth 2.0

### Rate Limiting (Future)

Consider implementing rate limiting to prevent abuse:
- Per-IP rate limiting
- Per-user rate limiting
- Global rate limiting

## 🎯 Use Cases

### 1. Web Chat Interface
Build a chat interface for your website where users can interact with Throp directly.

### 2. Dashboard
Create a monitoring dashboard showing:
- Bot statistics
- Recent interactions
- Twitter activity
- System health

### 3. Mobile App
Integrate Throp into a mobile app using the REST API.

### 4. Slack/Discord Integration
Bridge Throp to other platforms using the API.

### 5. Analytics Platform
Collect and analyze interaction data for insights.

## 🚧 Troubleshooting

### CORS Errors
Ensure `FRONTEND_URL` in `.env` matches your frontend's URL.

### Connection Refused
- Check if the API server is running
- Verify the port number (default: 3001)
- Check firewall settings

### WebSocket Not Connecting
- Ensure WebSocket support in your hosting environment
- Check proxy configuration if using reverse proxy

### Rate Limits
Monitor the `/api/status` endpoint for rate limit information.

## 📊 Monitoring

### Health Checks
Set up monitoring to regularly check:
```bash
curl http://localhost:3001/health
```

### Metrics to Track
- Response times
- Error rates
- Active WebSocket connections
- Cache hit rates
- API usage patterns

## 🔄 Deployment

### Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm ci --production
EXPOSE 3001
CMD ["npm", "run", "start:api"]
```

### Environment Variables
```env
NODE_ENV=production
API_PORT=3001
FRONTEND_URL=https://your-app.com
REDIS_URL=redis://redis:6379
PERPLEXITY_API_KEY=your-key-here
```

### Reverse Proxy (Nginx)
```nginx
location /api {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

## 📝 API Versioning

The API follows semantic versioning. Current version: `v0.2.0`

Future versions will maintain backwards compatibility where possible.
