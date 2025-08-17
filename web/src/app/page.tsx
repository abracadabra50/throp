'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import HotTakes from '@/components/HotTakes';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
  rating?: 'fire' | 'mid' | 'trash';
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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

  // Load saved messages from localStorage and set random offsets
  useEffect(() => {
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
      } catch (e) {
        console.error('Failed to load saved messages');
      }
    }
  }, []);

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
    return () => window.removeEventListener('throp-elaborate', handleElaborate as EventListener);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const messagesToSend = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content,
      }));

      // Try direct connection first, fall back to proxy if CORS issue
      let response;
      let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/chat';
      
      // If using external API, try proxy route to avoid CORS
      if (apiUrl.includes('localhost:3001')) {
        console.log('Using proxy to avoid CORS issues');
        apiUrl = '/api/proxy';
      }
      
      console.log('Sending request to:', apiUrl);
      
      response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          messages: messagesToSend,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
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
                // Remove quotes and handle the content
                const cleanContent = content.replace(/^"|"$/g, '');
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
      console.error('Error:', error);
      let errorMessage = "uhhhh my brain broke 🍊💥 ";
      
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          errorMessage += "cant connect to the api... is it running on port 3001?";
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
      handleSubmit(e as any);
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
      font-family: Comic Sans MS;
      z-index: 9999;
      transform: rotate(-5deg);
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  };

  const rateMessage = (messageId: string, rating: 'fire' | 'mid' | 'trash') => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, rating } : msg
    ));
  };

  const shareChat = () => {
    const chatText = messages
      .map(m => `${m.role === 'user' ? 'You' : 'throp'}: ${m.content}`)
      .join('\n\n');
    
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `throp-chat-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!showChat) {
    // Landing page
    return (
      <div className="min-h-screen relative" style={{ background: '#fefdfb' }}>
        {/* Background doodles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="doodle doodle-1">
            <svg width="60" height="60" viewBox="0 0 60 60">
              <circle cx="30" cy="30" r="25" fill="none" stroke="#ff7a45" strokeWidth="3" strokeDasharray="5,5" opacity="0.3"/>
            </svg>
          </div>
          <div className="doodle doodle-2">
            <svg width="80" height="80" viewBox="0 0 80 80">
              <path d="M10,40 Q40,10 70,40" fill="none" stroke="#4a90e2" strokeWidth="3" opacity="0.3"/>
            </svg>
          </div>
          <div className="doodle doodle-3">
            <svg width="50" height="50" viewBox="0 0 50 50">
              <rect x="10" y="10" width="30" height="30" fill="none" stroke="#ffc0cb" strokeWidth="3" transform="rotate(15 25 25)" opacity="0.3"/>
            </svg>
          </div>
          <div className="doodle doodle-4">
            <svg width="70" height="70" viewBox="0 0 70 70">
              <polygon points="35,10 50,40 20,40" fill="none" stroke="#f5e6d3" strokeWidth="3" opacity="0.3"/>
            </svg>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center min-h-screen px-4">
          {/* Throp character */}
          <div 
            className="wobble mb-8"
            style={{ transform: `rotate(${randomOffsets.throp}deg)` }}
          >
            <Image 
              src="/throp-actual.svg" 
              alt="throp" 
              width={250} 
              height={250}
              priority
            />
          </div>

          {/* Title */}
          <h1 
            className="text-6xl md:text-8xl font-bold mb-4"
            style={{ 
              transform: `rotate(${randomOffsets.title}deg)`,
              fontFamily: 'Comic Sans MS, cursive'
            }}
          >
            hi im throp 🫠
          </h1>

          {/* Tagline */}
          <p className="text-xl md:text-2xl mb-12" style={{ transform: 'rotate(1deg)' }}>
            <span className="scribbly-underline">the dumber cousin</span> of claude
          </p>

          {/* Main CTA */}
          <button
            onClick={() => setShowChat(true)}
            className="scuffed-button ms-paint-shadow"
            style={{ 
              transform: `rotate(${randomOffsets.button}deg)`,
              fontSize: '28px',
              padding: '20px 40px'
            }}
          >
            talk 2 throp
          </button>

          {/* About section */}
          <div className="mt-20 flex gap-8 md:gap-16 flex-wrap justify-center">
            <div className="text-center" style={{ transform: 'rotate(-3deg)' }}>
              <div className="wonky-border p-6 bg-orange-100 mb-3">
                <span style={{ fontSize: '60px' }}>🧠</span>
              </div>
              <p className="font-bold text-xl">smart (kinda)</p>
            </div>
            <div className="text-center" style={{ transform: 'rotate(2deg)' }}>
              <div className="wonky-border p-6 bg-blue-100 mb-3">
                <span style={{ fontSize: '60px' }}>🎯</span>
              </div>
              <p className="font-bold text-xl">aligned (ish)</p>
            </div>
            <div className="text-center" style={{ transform: 'rotate(-1deg)' }}>
              <div className="wonky-border p-6 bg-pink-100 mb-3">
                <span style={{ fontSize: '60px' }}>🛡️</span>
              </div>
              <p className="font-bold text-xl">safe (lol)</p>
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
        <div className="max-w-full px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image 
              src="/throp-actual.svg" 
              alt="throp" 
              width={50} 
              height={50}
              className="shaky"
              style={{ mixBlendMode: 'multiply' }}
            />
            <h1 className="text-2xl md:text-3xl font-bold" style={{ transform: 'rotate(-1deg)' }}>
              throp chat
            </h1>
          </div>
          
          {/* Controls */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Share button */}
            <button
              onClick={shareChat}
              className="px-2 md:px-3 py-1 border-2 border-black rounded-lg bg-white hover:bg-gray-100 text-sm md:text-base"
              style={{ transform: 'rotate(-1deg)' }}
              title="Download chat"
            >
              <span className="hidden md:inline">💾 save</span>
              <span className="md:hidden">💾</span>
            </button>

            {/* Clear chat */}
            <button
              onClick={() => {
                if (confirm('clear all messages? (cant undo this lol)')) {
                  setMessages([]);
                  localStorage.removeItem('throp-messages');
                }
              }}
              className="px-2 md:px-3 py-1 border-2 border-black rounded-lg bg-white hover:bg-gray-100 text-sm md:text-base"
              style={{ transform: 'rotate(2deg)' }}
              title="Clear chat (Cmd/Ctrl + K)"
            >
              <span className="hidden md:inline">🗑️ clear</span>
              <span className="md:hidden">🗑️</span>
            </button>

            <button
              onClick={() => setShowChat(false)}
              className="text-sm md:text-lg underline hover:no-underline px-2 md:px-4 py-1 md:py-2"
              style={{ transform: 'rotate(2deg)' }}
            >
              go back
            </button>
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
          <div className="flex-1 overflow-y-auto px-6 py-6">
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
                      {message.role === 'assistant' && (
                        <div className="flex gap-2 ml-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              rateMessage(message.id, 'fire');
                            }}
                            className={`text-sm ${message.rating === 'fire' ? 'opacity-100' : 'opacity-40'}`}
                            title="Fire response"
                          >
                            🔥
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              rateMessage(message.id, 'mid');
                            }}
                            className={`text-sm ${message.rating === 'mid' ? 'opacity-100' : 'opacity-40'}`}
                            title="Mid response"
                          >
                            😐
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              rateMessage(message.id, 'trash');
                            }}
                            className={`text-sm ${message.rating === 'trash' ? 'opacity-100' : 'opacity-40'}`}
                            title="Trash response"
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isLoading && (
                  <div className="flex gap-4">
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
            <div className="max-w-4xl mx-auto px-6 py-6">
              <form onSubmit={handleSubmit} className="flex gap-4">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="type somethin... or just mash ur keyboard idc"
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
                  {messages.filter(m => m.rating === 'fire').length} 🔥 responses
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