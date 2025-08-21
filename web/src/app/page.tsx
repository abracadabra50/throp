'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import HotTakes from '@/components/HotTakes';
import Link from 'next/link';
import { TrendingPrompts } from '@/components/TrendingPrompts';
import { PopularPersonalities } from '@/components/PopularPersonalities';
import { executeSlashCommand, getCommandSuggestions, type SlashCommand } from '@/utils/slash-commands';
import { useRouter } from 'next/navigation';
import { 
  shouldAutoShowChat, 
  canNavigateBetweenPages, 
  getDomainType 
} from '@/utils/domain-detect';
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
  }

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [commandSuggestions, setCommandSuggestions] = useState<SlashCommand[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  // Random values for UI elements (initialized to 0 to avoid hydration mismatch)
  const [randomOffsets, setRandomOffsets] = useState({
    title: 0,
    button: 0,
    throp: 0,
  });

  // Random values for background doodles (8 doodles)
  const [doodlePositions, setDoodlePositions] = useState<Array<{top: number, left: number, rotate: number}>>([]);
  
  // Random values for message bubbles
  const [messageRotations, setMessageRotations] = useState<Map<string, {avatar: number, bubble: number}>>(new Map());
  

  
  // Trending prompts from API
  const [trendingPrompts, setTrendingPrompts] = useState<string[]>([
    // Default prompts while loading
    "loading trending topics...",
    "fetching hot takes...",
    "checking the vibes...",
    "scanning twitter...",
    "reading the room...",
    "getting the tea...",
    "finding the drama..."
  ]);

  // Load saved messages from localStorage and set random offsets
  useEffect(() => {
    // Auto-show chat if on chat.throp.ai subdomain
    if (shouldAutoShowChat()) {
      setShowChat(true);
      
      // Check for prompt in URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const prompt = urlParams.get('prompt');
      if (prompt) {
        setInput(decodeURIComponent(prompt));
        // Clean up URL without reloading
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
    
    // Set random offsets on client side only to avoid hydration mismatch
    setRandomOffsets({
      title: Math.random() * 6 - 3,
      button: Math.random() * 6 - 3,
      throp: Math.random() * 10 - 5,
    });

    // Set doodle positions for background
    setDoodlePositions(
      Array.from({ length: 8 }, () => ({
        top: Math.random() * 100,
        left: Math.random() * 100,
        rotate: Math.random() * 360,
      }))
    );



    // Load saved messages
    const saved = localStorage.getItem('throp-messages');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setMessages(parsed);
      } catch {
        console.error('Failed to load saved messages');
      }
    }

    // Fetch trending prompts
    fetchTrendingPrompts();
  }, []);

  // Fetch trending prompts from API
  const fetchTrendingPrompts = async () => {
    try {
      const response = await fetch('https://throp-bot-947985992378.us-central1.run.app/api/trending-prompts');
      const data = await response.json();
      if (data.prompts && Array.isArray(data.prompts)) {
        setTrendingPrompts(data.prompts);
        console.log('Loaded trending prompts:', data.prompts);
      }
    } catch (error) {
      console.error('Failed to fetch trending prompts:', error);
      // Keep default prompts on error
      setTrendingPrompts([
        "whats the drama with the bags app",
        "explain why everything costs so much",
        "is solana still a thing or nah",
        "roast my investment choices",
        "why is gta6 taking forever fr",
        "decode gen z slang for millennials",
        "hot takes on the heatwave"
      ]);
    }
  };

  // Save messages to localStorage and generate random rotations for new messages
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('throp-messages', JSON.stringify(messages));
      
      // Generate random rotations for any new messages
      const newRotations = new Map(messageRotations);
      messages.forEach(msg => {
        if (!newRotations.has(msg.id)) {
          newRotations.set(msg.id, {
            avatar: Math.random() * 20 - 10,
            bubble: Math.random() * 3 - 1.5,
          });
        }
      });
      if (newRotations.size !== messageRotations.size) {
        setMessageRotations(newRotations);
      }
    }
  }, [messages, messageRotations]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to clear chat
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (confirm('clear all messages? (cant undo this lol)')) {
          setMessages([]);
          localStorage.removeItem('throp-messages');
        }
      }
      // Cmd/Ctrl + / to focus input
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, []);

  // Listen for elaborate events from HotTakes
  useEffect(() => {
    const handleElaborate = (e: CustomEvent) => {
      setInput(e.detail.message);
      inputRef.current?.focus();
    };
    
    window.addEventListener('throp-elaborate', handleElaborate as EventListener);
    
    // Add event listener for toggling hot takes via slash command
    const handleToggleHotTakes = () => {
      const hotTakesButton = document.querySelector('[data-hot-takes-button]') as HTMLButtonElement;
      if (hotTakesButton) {
        hotTakesButton.click();
      }
    };
    
    window.addEventListener('toggleHotTakes', handleToggleHotTakes);
    
    return () => {
      window.removeEventListener('throp-elaborate', handleElaborate as EventListener);
      window.removeEventListener('toggleHotTakes', handleToggleHotTakes);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Check for slash commands
    if (input.startsWith('/')) {
      const result = executeSlashCommand(input);
      
      if (result) {
        // Add user message to show the command
        const userMessage: Message = {
          id: Date.now().toString(),
          role: 'user',
          content: input,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMessage]);
        
        // Handle different command result types
        if (result.type === 'message') {
          const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: result.content || '',
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, botMessage]);
        } else if (result.type === 'clear') {
          setMessages([]);
        } else if (result.type === 'redirect' && result.url) {
          router.push(result.url);
        } else if (result.type === 'action' && result.action) {
          result.action();
        }
        
        setInput('');
        setCommandSuggestions([]);
        return;
      }
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setCommandSuggestions([]);

    try {
      const messagesToSend = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content,
      }));

      // Try direct connection first, fall back to proxy if CORS issue
      const response = await (async () => {
      let apiUrl = process.env.NEXT_PUBLIC_API_URL;
      
      // Use proxy unless we have a specific backend URL (localhost for dev or run.app for direct)
      if (!apiUrl || (!apiUrl.includes('localhost') && !apiUrl.includes('run.app'))) {
        console.log('Using Netlify function proxy for production API');
        apiUrl = '/.netlify/functions/chat-proxy';
      }
      
      console.log('Sending request to:', apiUrl);
      
      return await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          messages: messagesToSend,
        }),
      });
    })();

      if (!response.ok) {
        console.error('Response not ok:', response.status, response.statusText);
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error('Error response body:', errorText);
        throw new Error(`Failed to get response: ${response.status} ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';
      const assistantId = Date.now().toString();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          console.log('Received chunk:', chunk);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.trim() && line.startsWith('0:')) {
              const content = line.slice(2).trim();
              console.log('Processing line content:', content);
              if (content && content !== '""') {
                // Remove quotes and unescape the content
                let cleanContent = content.replace(/^"|"$/g, '');
                // Unescape escaped characters
                cleanContent = cleanContent
                  .replace(/\\"/g, '"')  // Unescape quotes
                  .replace(/\\n/g, '\n') // Unescape newlines
                  .replace(/\\\\/g, '\\'); // Unescape backslashes
                console.log('Clean content:', cleanContent);
                // Don't append if it's just a number like "1" or "2"
                if (cleanContent && !(/^\d+$/.test(cleanContent))) {
                  assistantMessage = cleanContent; // Replace instead of append to avoid duplicates
                }
                
                setMessages(prev => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage && lastMessage.id === assistantId) {
                    lastMessage.content = assistantMessage;
                  } else {
                    newMessages.push({
                      id: assistantId,
                      role: 'assistant',
                      content: assistantMessage,
                      timestamp: new Date(),
                    });
                  }
                  return newMessages;
                });
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error details:', error);
      console.error('Error type:', typeof error);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown');
      
      let errorMessage = "uhhhh my brain broke 🍊💥 ";
      
      if (error instanceof Error) {
        console.error('Error stack:', error.stack);
        if (error.message.includes('fetch') || error.message.includes('network')) {
          errorMessage += "cant connect to the api... network issue maybe?";
        } else if (error.message.includes('timeout')) {
          errorMessage += "request timed out... backend too slow?";
        } else {
          errorMessage += `error: ${error.message}`;
        }
      } else {
        errorMessage += "something went wrong idk";
      }
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: errorMessage,
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as React.FormEvent);
    }
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    // Show a scuffed toast
    const toast = document.createElement('div');
    toast.textContent = 'copied lol';
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #ff7a45;
      color: white;
      padding: 10px 20px;
      border-radius: 10px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-weight: 600;
      z-index: 9999;
      transform: rotate(-5deg);
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  };

  // Message rating functionality removed



  if (!showChat) {
    // Landing page - best in class but chaotic
    return (
      <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #fefdfb 0%, #fff5ef 100%)' }}>
        {/* Subtle background pattern */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5">
          {doodlePositions.map((pos, i) => (
            <div 
              key={i}
              className="absolute"
              style={{
                top: `${pos.top}%`,
                left: `${pos.left}%`,
                transform: `rotate(${pos.rotate}deg)`,
              }}
            >
              <Image src="/throp-actual.svg" alt="" width={60} height={60} />
            </div>
          ))}
        </div>

        {/* Header */}
        <header className="flex justify-between items-center px-6 py-4 md:px-12 md:py-6">
          <Link href="/" className="flex items-center gap-3 hover:scale-105 transition-all">
            <Image src="/throp-actual.svg" alt="throp" width={45} height={45} className="wobble" />
            <span className="font-bold text-2xl">throp</span>
          </Link>
          <div className="flex items-center gap-6">
            <button
              onClick={() => {
                const domainType = getDomainType();
                if (domainType === 'landing') {
                  // Redirect to chat.throp.ai
                  window.location.href = 'https://chat.throp.ai';
                } else {
                  // Local environment - use state-based navigation
                  setShowChat(true);
                }
              }}
              className="px-4 py-2 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-full border-2 border-black font-medium text-sm hover:scale-105 transition-all"
              style={{ 
                boxShadow: '3px 3px 0 #000',
              }}
            >
              start yapping →
            </button>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-6 py-8 md:px-12 lg:px-16 pb-20">
          {/* Main heading */}
          <div className="mb-16 text-center">
            <h1 className="text-6xl md:text-8xl font-black mb-6" 
                style={{ 
                  transform: `rotate(${randomOffsets.title * 0.2}deg)`,
                  lineHeight: '0.9',
                  fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
                  letterSpacing: '-0.02em'
                }}>
              ask me<br/>
              <span className="text-orange-500">literally</span><br/>
              anything
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 max-w-2xl mx-auto">
              no filter, no fluff, just straight facts with attitude fr
            </p>
          </div>

          {/* Quick prompts */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                trending prompts rn
              </h2>
              <button
                onClick={fetchTrendingPrompts}
                className="text-xs px-2 py-1 hover:bg-gray-100 rounded transition-all"
                title="Refresh trending prompts"
              >
                🔄
              </button>
            </div>
            <TrendingPrompts 
              prompts={trendingPrompts}
              onPromptClick={(prompt) => {
                setInput(prompt);
                setShowChat(true);
              }}
            />

            {/* Quick chat entry */}
            <div className="max-w-xl mx-auto mt-8">
              <form onSubmit={(e) => {
                e.preventDefault();
                const input = e.currentTarget.querySelector('input') as HTMLInputElement;
                if (input?.value.trim()) {
                  setInput(input.value);
                  setShowChat(true);
                }
              }}>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="ask throp anything..."
                    className="flex-1 px-4 py-3 border-3 border-black rounded-full text-lg focus:outline-none focus:ring-4 focus:ring-orange-300"
                    style={{ 
                      background: 'white',
                      boxShadow: '3px 3px 0 #000'
                    }}
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-full border-3 border-black hover:scale-105 transition-all font-bold"
                    style={{ 
                      boxShadow: '3px 3px 0 #000' 
                    }}
                  >
                    go
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Popular personalities with cycling variations */}
          <PopularPersonalities 
            onPersonalityClick={(prompt) => {
              setInput(prompt);
              setShowChat(true);
            }}
          />

          {/* Feature cards grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Hot Takes Card */}
            <div className="group cursor-pointer" onClick={() => setShowChat(true)}>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-3 border-black rounded-2xl p-6 h-full transition-all group-hover:scale-[1.02] group-hover:shadow-lg"
                   style={{ boxShadow: '4px 4px 0 #000' }}>
                <div className="flex items-start justify-between mb-4">
                  <span className="text-4xl">🔥</span>
                  <span className="text-xs bg-orange-200 px-2 py-1 rounded-full font-semibold">hot</span>
                </div>
                <h3 className="font-bold text-xl mb-2">unhinged takes</h3>
                <p className="text-sm text-gray-700 mb-4">
                  spicy opinions on literally everything happening rn
                </p>
                <div className="text-xs text-gray-500">
                  tap for chaos →
                </div>
              </div>
            </div>

            {/* Crypto Card */}
            <div className="group cursor-pointer" onClick={() => {
              setInput("whats happening in crypto today");
              setShowChat(true);
            }}>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-3 border-black rounded-2xl p-6 h-full transition-all group-hover:scale-[1.02] group-hover:shadow-lg"
                   style={{ boxShadow: '4px 4px 0 #000' }}>
                <div className="flex items-start justify-between mb-4">
                  <span className="text-4xl">💰</span>
                  <span className="text-xs bg-purple-200 px-2 py-1 rounded-full font-semibold">degen</span>
                </div>
                <h3 className="font-bold text-xl mb-2">crypto decoder</h3>
                <p className="text-sm text-gray-700 mb-4">
                  why your bags are down & which coin is mooning next
                </p>
                <div className="text-xs text-gray-500">
                  probably nothing →
                </div>
              </div>
            </div>

            {/* Roast Card */}
            <div className="group cursor-pointer" onClick={() => {
              setInput("roast something for me");
              setShowChat(true);
            }}>
              <div className="bg-gradient-to-br from-red-50 to-pink-100 border-3 border-black rounded-2xl p-6 h-full transition-all group-hover:scale-[1.02] group-hover:shadow-lg"
                   style={{ boxShadow: '4px 4px 0 #000' }}>
                <div className="flex items-start justify-between mb-4">
                  <span className="text-4xl">💀</span>
                  <span className="text-xs bg-red-200 px-2 py-1 rounded-full font-semibold">brutal</span>
                </div>
                <h3 className="font-bold text-xl mb-2">roast mode</h3>
                <p className="text-sm text-gray-700 mb-4">
                  when you need someone to destroy your life choices
                </p>
                <div className="text-xs text-gray-500">
                  emotional damage →
                </div>
              </div>
            </div>

            {/* Explain Card */}
            <div className="group cursor-pointer" onClick={() => {
              setInput("explain something complicated but make it make sense");
              setShowChat(true);
            }}>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-3 border-black rounded-2xl p-6 h-full transition-all group-hover:scale-[1.02] group-hover:shadow-lg"
                   style={{ boxShadow: '4px 4px 0 #000' }}>
                <div className="flex items-start justify-between mb-4">
                  <span className="text-4xl">🧠</span>
                  <span className="text-xs bg-blue-200 px-2 py-1 rounded-full font-semibold">smart-ish</span>
                </div>
                <h3 className="font-bold text-xl mb-2">eli5 but unhinged</h3>
                <p className="text-sm text-gray-700 mb-4">
                  complex stuff explained like you&apos;re chronically online
                </p>
                <div className="text-xs text-gray-500">
                  big brain time →
                </div>
              </div>
            </div>

            {/* Vibe Check Card */}
            <div className="group cursor-pointer" onClick={() => {
              setInput("vibe check the current state of everything");
              setShowChat(true);
            }}>
              <div className="bg-gradient-to-br from-green-50 to-green-100 border-3 border-black rounded-2xl p-6 h-full transition-all group-hover:scale-[1.02] group-hover:shadow-lg"
                   style={{ boxShadow: '4px 4px 0 #000' }}>
                <div className="flex items-start justify-between mb-4">
                  <span className="text-4xl">✨</span>
                  <span className="text-xs bg-green-200 px-2 py-1 rounded-full font-semibold">vibes</span>
                </div>
                <h3 className="font-bold text-xl mb-2">vibe check</h3>
                <p className="text-sm text-gray-700 mb-4">
                  when you need validation that everything is indeed cooked
                </p>
                <div className="text-xs text-gray-500">
                  it&apos;s giving chaos →
                </div>
              </div>
            </div>

            {/* Drama Card */}
            <div className="group cursor-pointer" onClick={() => {
              setInput("whats the latest internet drama");
              setShowChat(true);
            }}>
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-3 border-black rounded-2xl p-6 h-full transition-all group-hover:scale-[1.02] group-hover:shadow-lg"
                   style={{ boxShadow: '4px 4px 0 #000' }}>
                <div className="flex items-start justify-between mb-4">
                  <span className="text-4xl">☕</span>
                  <span className="text-xs bg-yellow-200 px-2 py-1 rounded-full font-semibold">tea</span>
                </div>
                <h3 className="font-bold text-xl mb-2">drama decoder</h3>
                <p className="text-sm text-gray-700 mb-4">
                  all the tea you missed while touching grass
                </p>
                <div className="text-xs text-gray-500">
                  sip sip →
                </div>
              </div>
            </div>
          </div>

          {/* Big CTA */}
          <div className="text-center mb-12">
            <button
              onClick={() => {
                const domainType = getDomainType();
                if (domainType === 'landing') {
                  // Redirect to chat.throp.ai
                  window.location.href = 'https://chat.throp.ai';
                } else {
                  // Local environment - use state-based navigation
                  setShowChat(true);
                }
              }}
              className="inline-flex items-center gap-3 text-2xl font-bold px-10 py-5 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-full border-3 border-black transition-all hover:scale-105"
              style={{ 
                boxShadow: '6px 6px 0 #000',
                transform: `rotate(${randomOffsets.button * 0.3}deg)`,
              }}
            >
              start yapping
              <span className="text-3xl">→</span>
            </button>
            <p className="text-xs text-gray-500 mt-4">
              warning: responses are unhinged but weirdly accurate
            </p>
          </div>
          
          {/* Footer Navigation - Fixed at bottom */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 py-3 z-10">
            {/* Mobile: Simple centered links */}
            <div className="md:hidden flex justify-center gap-6 text-sm">
              <Link href="/" className="hover:text-orange-500 transition-all">home</Link>
              <Link href="/about" className="hover:text-orange-500 transition-all">about</Link>
              <Link href="/docs" className="hover:text-orange-500 transition-all">docs</Link>
              <a href="https://x.com/askthrop" target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 transition-all">@askthrop</a>
            </div>
            
            {/* Desktop: Full footer with logo, left menu, right powered by */}
            <div className="hidden md:flex items-center justify-between px-6">
              {/* Left: Small Throp logo + Navigation (OS menu bar style) */}
              <div className="flex items-center gap-6">
                <Image src="/throp-actual.svg" alt="throp" width={24} height={24} className="opacity-70" />
                <div className="flex gap-6 text-sm">
                  <Link href="/" className="hover:text-orange-500 transition-all">home</Link>
                  <Link href="/about" className="hover:text-orange-500 transition-all">about</Link>
                  <Link href="/docs" className="hover:text-orange-500 transition-all">docs</Link>
                  <a href="https://x.com/askthrop" target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 transition-all">@askthrop</a>
                </div>
              </div>
              
              {/* Right: Powered by */}
              <div className="text-xs text-gray-400">
                powered by <span className="font-bold">$throp</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Chat interface - WITH HOT TAKES
  return (
    <div className="h-screen flex flex-col" style={{ background: '#fefdfb' }}>
      {/* Background doodles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
        {doodlePositions.map((pos, i) => (
          <div 
            key={i}
            className="absolute"
            style={{
              top: `${pos.top}%`,
              left: `${pos.left}%`,
              transform: `rotate(${pos.rotate}deg)`,
            }}
          >
            <Image src="/throp-actual.svg" alt="" width={80} height={80} />
          </div>
        ))}
      </div>

      {/* Header with controls */}
      <header className="flex-shrink-0 border-b-4 border-black z-10" style={{ background: '#ffb088' }}>
        <div className="max-w-full px-3 md:px-6 py-3 md:py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5 md:gap-3 hover:scale-105 transition-all">
            <Image 
              src="/throp-actual.svg" 
              alt="throp" 
              width={40} 
              height={40}
              className="shaky"
              style={{ mixBlendMode: 'multiply' }}
            />
            <h1 className="text-xl md:text-3xl font-bold" style={{ transform: 'rotate(-1deg)' }}>
              throp chat
            </h1>
          </Link>
          
          {/* Controls */}
          <div className="flex items-center gap-1.5 md:gap-3">
            {/* About link */}
            <a
              href="/about"
              className="px-2 md:px-3 py-1 border-2 border-black rounded-lg bg-white hover:bg-gray-100 text-xs md:text-base"
              style={{ transform: 'rotate(1deg)' }}
            >
              about
            </a>

            {/* Clear chat */}
            <button
              onClick={() => {
                if (confirm('clear all messages? (cant undo this lol)')) {
                  setMessages([]);
                  localStorage.removeItem('throp-messages');
                }
              }}
              className="px-2 md:px-3 py-1 border-2 border-black rounded-lg bg-white hover:bg-gray-100 text-xs md:text-base"
              style={{ transform: 'rotate(2deg)' }}
              title="Clear chat (Cmd/Ctrl + K)"
            >
              <span className="hidden md:inline">🗑️ clear</span>
              <span className="md:hidden">🗑️</span>
            </button>

            {canNavigateBetweenPages() && (
              <button
                onClick={() => setShowChat(false)}
                className="text-sm md:text-lg underline hover:no-underline px-2 md:px-4 py-1 md:py-2"
                style={{ transform: 'rotate(2deg)' }}
              >
                go back
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Hot Takes - Horizontal scroll at top */}
      <div className="md:hidden">
        <HotTakes />
      </div>

      {/* Main content area with desktop layout */}
      <div className="flex-1 overflow-hidden flex">
        {/* Chat section */}
        <div className="flex-1 flex flex-col">
          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-3 md:px-6 py-4 md:py-6">
            <div className="max-w-4xl mx-auto">
              {messages.length === 0 && (
                <div className="text-center py-20">
                  <Image 
                    src="/throp-actual.svg" 
                    alt="throp" 
                    width={150} 
                    height={150}
                    className="mx-auto mb-6 wobble"
                  />
                  <p className="text-2xl">
                    wassup!! ask me stuff (or dont idc)
                  </p>
                  <p className="text-lg mt-4 opacity-60">
                    im literally just an orange blob why r u here
                  </p>
                  <div className="mt-8 text-sm opacity-50">
                    <p>🎹 shortcuts:</p>
                    <p>cmd/ctrl + k = clear chat</p>
                    <p>cmd/ctrl + / = focus input</p>
                    <p>shift + enter = new line</p>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 mb-4 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex-shrink-0 self-end mb-2">
                        <Image 
                          src="/throp-actual.svg" 
                          alt="throp" 
                          width={45} 
                          height={45}
                          className="wobble"
                          style={{ transform: `rotate(${messageRotations.get(message.id)?.avatar || 0}deg)` }}
                        />
                      </div>
                    )}
                    
                    <div className={`flex flex-col gap-2 ${message.role === 'user' ? 'items-end' : 'items-start'}`} 
                         style={{ maxWidth: message.role === 'user' ? '70%' : '65%' }}>
                      <div 
                        className={`${message.role === 'user' ? 'bubble-user' : 'bubble-throp'} transition-all hover:scale-[1.02]`}
                        style={{ 
                          transform: `rotate(${(messageRotations.get(message.id)?.bubble || 0) * 0.3}deg)`,
                          fontSize: '15px',
                          cursor: 'pointer',
                          lineHeight: '1.5'
                        }}
                        onClick={() => copyMessage(message.content)}
                        title="Click to copy"
                      >
                        <p className={message.role === 'user' ? 'text-white font-medium' : 'text-black'} style={{ margin: 0 }}>
                          {message.content}
                        </p>
                      </div>
                      
                      {/* Rating buttons for assistant messages */}
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isLoading && (
                  <div className="flex gap-2 md:gap-3 md:p-4">
                    <div className="flex-shrink-0 mt-2">
                      <Image 
                        src="/throp-actual.svg" 
                        alt="throp" 
                        width={60} 
                        height={60}
                        className="shaky"
                      />
                    </div>
                    <div className="bubble-throp" style={{ padding: '16px 24px' }}>
                      <div className="flex gap-2">
                        <span className="typing-dot"></span>
                        <span className="typing-dot"></span>
                        <span className="typing-dot"></span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>

          {/* Input Area */}
          <div className="flex-shrink-0 border-t-4 border-black bg-gradient-to-t from-[#fefdfb] via-[#fefdfb] to-transparent">
            <div className="max-w-4xl mx-auto px-3 md:px-6 py-4 md:py-6">
              {/* Command Suggestions */}
              {commandSuggestions.length > 0 && (
                <div className="mb-2 bg-white border-4 border-black rounded-lg overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                  {commandSuggestions.map((cmd, index) => (
                    <div
                      key={cmd.command}
                      className={`px-4 py-2 cursor-pointer transition-colors ${
                        index === selectedSuggestion
                          ? 'bg-gradient-to-r from-orange-200 to-yellow-100'
                          : 'hover:bg-orange-50'
                      }`}
                      onClick={() => {
                        setInput(cmd.command + ' ');
                        setCommandSuggestions([]);
                        inputRef.current?.focus();
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-orange-600">{cmd.command}</span>
                        <span className="text-sm text-gray-600">{cmd.description}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="flex gap-2 md:gap-3 md:p-4">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => {
                    const value = e.target.value;
                    setInput(value);
                    
                    // Show command suggestions when typing /
                    if (value.startsWith('/')) {
                      const suggestions = getCommandSuggestions(value);
                      setCommandSuggestions(suggestions);
                      setSelectedSuggestion(0);
                    } else {
                      setCommandSuggestions([]);
                    }
                  }}
                  onKeyDown={(e) => {
                    // Handle command suggestion navigation
                    if (commandSuggestions.length > 0) {
                      if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        setSelectedSuggestion(prev => 
                          prev > 0 ? prev - 1 : commandSuggestions.length - 1
                        );
                        return;
                      } else if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        setSelectedSuggestion(prev => 
                          prev < commandSuggestions.length - 1 ? prev + 1 : 0
                        );
                        return;
                      } else if (e.key === 'Tab' || (e.key === 'Enter' && commandSuggestions.length > 0)) {
                        e.preventDefault();
                        const selected = commandSuggestions[selectedSuggestion];
                        if (selected) {
                          setInput(selected.command + ' ');
                          setCommandSuggestions([]);
                        }
                        return;
                      } else if (e.key === 'Escape') {
                        setCommandSuggestions([]);
                        return;
                      }
                    }
                    
                    handleKeyDown(e);
                  }}
                  placeholder="type somethin... or just mash ur keyboard idc (try /help)"
                  rows={2}
                  className="scuffed-input flex-1 text-lg"
                  style={{
                    minHeight: '60px',
                    maxHeight: '150px',
                    resize: 'vertical',
                    transform: 'rotate(-0.3deg)',
                    fontSize: '18px',
                    padding: '14px 20px'
                  }}
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="scuffed-button self-end"
                  style={{ 
                    fontSize: '20px',
                    padding: '14px 28px'
                  }}
                >
                  {isLoading ? '...' : 'send it'}
                </button>
              </form>
              <div className="flex justify-between items-center mt-4">
                <p className="text-sm opacity-50" style={{ transform: 'rotate(0.5deg)' }}>
                  throp v69.420 | {messages.length} msgs sent
                </p>
                <p className="text-xs opacity-40">
                  {messages.length} messages sent
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Desktop Hot Takes Sidebar */}
        <div className="hidden md:block w-96 border-l-4 border-black">
          <HotTakes />
        </div>
      </div>
    </div>
  );
}