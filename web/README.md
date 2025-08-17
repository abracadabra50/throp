# throp 🍊

hi im throp 🫠 the badly drawn orange blob thats supposed to be an ai or something

## what is throp

its like if someone drew claude in MS paint while having a stroke. throp is the badly drawn, low-effort orange blob that somehow became sentient. basically the meme version of anthropic's claude - what gork is to grok but MORE ORANGE

features:
- looks like it was drawn by a 5 year old
- speaks in lowercase (mostly)
- rates everything in oranges (1-10 🍊)
- occasionally forgets how to function
- Comic Sans EVERYWHERE
- intentionally misaligned everything

## Features

- 🍊 **Orange-themed UI**: Beautiful gradient design with orange as the primary colour
- 💬 **Real-time chat**: Powered by Vercel AI SDK and Anthropic's Claude 3.5 Sonnet
- 🎭 **Unique personality**: Witty, self-aware responses with intentional typos and meme references
- ⚡ **Fast responses**: Edge runtime for optimal performance
- 🎨 **Animated interface**: Smooth animations and transitions using Framer Motion
- 📱 **Responsive design**: Works beautifully on all devices

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Backend API running on port 3001 (or configure NEXT_PUBLIC_API_URL)
- An Anthropic API key if running the API locally ([get one here](https://console.anthropic.com/))

### Installation

1. Navigate to the web directory:
```bash
cd web
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env.local
```

4. Edit `.env.local` and configure:
```
# Point to your backend API (default: http://localhost:3001/api/chat)
NEXT_PUBLIC_API_URL=http://localhost:3001/api/chat

# Only needed if running API locally
ANTHROPIC_API_KEY=your-actual-api-key-here
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Troubleshooting API Connection

If you're getting errors when trying to chat:

### 1. Check if your backend API is running
Make sure your API server is running on port 3001. The frontend expects the API at:
```
http://localhost:3001/api/chat
```

### 2. Test the connection
Open `test-api.html` in your browser to test if the API is accessible:
```bash
open test-api.html
```

### 3. Using the proxy (automatic)
The frontend automatically uses a proxy route (`/api/proxy`) to avoid CORS issues when connecting to localhost:3001.

### 4. Custom API endpoint
If your API is running on a different port or URL, update `.env.local`:
```
NEXT_PUBLIC_API_URL=http://your-api-url/api/chat
```

### 5. Check browser console
Open browser dev tools (F12) and check the Console tab for detailed error messages.

## How to Customise throp's Personality

throp's personality is defined in `/src/app/api/chat/route.ts`. You can modify the `THROP_SYSTEM_PROMPT` to change:

- **Personality traits**: Add or modify character quirks
- **Response style**: Adjust the level of chaos and humour
- **Catchphrases**: Add new recurring jokes or phrases
- **Orange obsession level**: Dial the orange references up or down

### Example Customisations

To make throp more chaotic:
```typescript
temperature: 0.95, // Increase from 0.9
```

To add new catchphrases:
```typescript
// Add to the system prompt
"You occasionally say 'orange you curious?' instead of 'aren't you curious?'"
```

To change the response style:
```typescript
// Modify the model
model: anthropic('claude-3-5-haiku-20241022'), // Use Haiku for faster, shorter responses
```

## Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **AI SDK**: Vercel AI SDK with Anthropic provider
- **Styling**: Tailwind CSS with custom orange theme
- **Animations**: Framer Motion
- **Language Model**: Claude 3.5 Sonnet
- **Runtime**: Edge Runtime for optimal performance

## Deployment

The easiest way to deploy is using Vercel:

1. Push your code to GitHub
2. Import the project on [Vercel](https://vercel.com)
3. Add your `ANTHROPIC_API_KEY` in the environment variables
4. Deploy!

## throp's Quirks

When chatting with throp, you might encounter:

- 🍊 Orange ratings (everything gets rated 1-10 oranges)
- 🤖 Self-aware AI jokes
- 📝 Intentional typos for comedic effect
- 🎮 Gaming and meme references
- 💥 Fake "error messages" like "ERROR 404: BRAIN NOT FOUND... jk"
- 🗣️ Third-person references ("throp thinks...")

## Contributing

Feel free to contribute! throp appreciates chaos and creativity. Submit PRs with:
- New personality traits
- UI improvements
- Additional features
- Bug fixes (though throp might call them "features")

## License

MIT - Because throp believes in freedom (and oranges)

## Support

Having issues? throp suggests:
1. Check if you've added your API key correctly
2. Ensure you're using Node.js 18+
3. Try turning it off and on again (classic)
4. Rate the problem on the orange scale (doesn't help, but throp insists)

---

Built with 🧡 and chaos by Zishan | Powered by Anthropic Claude and excessive amounts of vitamin C