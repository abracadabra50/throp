'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Docs() {
  const [copiedEndpoint, setCopiedEndpoint] = useState('');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(id);
    setTimeout(() => setCopiedEndpoint(''), 2000);
  };

  const apiEndpoints = [
    {
      id: 'chat',
      method: 'POST',
      endpoint: '/api/chat',
      description: 'Send messages to throp and get chaotic responses',
      params: ['message: string', 'context?: string[]', 'temperature?: number'],
      status: 'coming soon'
    },
    {
      id: 'hot-takes',
      method: 'GET',
      endpoint: '/api/hot-takes',
      description: 'Get trending hot takes on current events',
      params: ['limit?: number', 'topic?: string'],
      status: 'coming soon'
    },
    {
      id: 'roast',
      method: 'POST',
      endpoint: '/api/roast',
      description: 'Get roasted about literally anything',
      params: ['target: string', 'intensity?: 1-10'],
      status: 'coming soon'
    },
    {
      id: 'translate',
      method: 'POST',
      endpoint: '/api/translate',
      description: 'Translate anything into gen z speak',
      params: ['text: string', 'vibe?: "chaotic" | "chill" | "unhinged"'],
      status: 'coming soon'
    }
  ];

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #fefdfb 0%, #fff5ef 100%)' }}>
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 md:px-12 md:py-6 border-b-3 border-black">
        <Link href="/" className="flex items-center gap-3 hover:scale-105 transition-all">
          <Image src="/throp-actual.svg" alt="throp" width={45} height={45} className="wobble" />
          <span className="font-bold text-2xl">throp</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/about" className="text-sm font-medium hover:text-orange-500 transition-all">
            about
          </Link>
          <div className="text-sm text-gray-600">docs</div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12 md:px-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            throp docs
          </h1>
          <p className="text-xl md:text-2xl text-gray-700">
            everything you need to integrate chaos into your app
          </p>
        </div>

        {/* API Documentation */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold mb-8">API Reference 🔌</h2>
          
          <div className="mb-8 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-3 border-black rounded-2xl"
               style={{ boxShadow: '4px 4px 0 #000' }}>
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h3 className="font-bold text-xl mb-3">🚧 API Access Coming Soon™</h3>
                <p className="text-gray-700 mb-4">
                  we&apos;re cooking up the most unhinged API the internet has ever seen. 
                  get ready to add gen z chaos to your apps.
                </p>
                <div className="flex items-center gap-3">
                  <code className="px-3 py-2 bg-white border-2 border-black rounded-lg font-mono text-sm">
                    https://api.throp.ai/v1
                  </code>
                  <span className="text-xs bg-orange-200 px-2 py-1 rounded-full font-semibold">
                    launching Q4 2025
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {apiEndpoints.map((endpoint) => (
              <div 
                key={endpoint.id}
                className="p-6 bg-white border-2 border-black rounded-xl hover:scale-[1.01] transition-all"
                style={{ boxShadow: '3px 3px 0 #000' }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 text-xs font-bold rounded ${
                      endpoint.method === 'GET' ? 'bg-green-200' : 'bg-blue-200'
                    }`}>
                      {endpoint.method}
                    </span>
                    <code className="font-mono text-lg">{endpoint.endpoint}</code>
                  </div>
                  <button
                    onClick={() => copyToClipboard(`https://api.throp.ai/v1${endpoint.endpoint}`, endpoint.id)}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-all"
                  >
                    {copiedEndpoint === endpoint.id ? '✓ copied' : 'copy'}
                  </button>
                </div>
                <p className="text-gray-700 mb-3">{endpoint.description}</p>
                <div className="flex flex-wrap gap-2">
                  {endpoint.params.map((param) => (
                    <code key={param} className="px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs">
                      {param}
                    </code>
                  ))}
                </div>
                <div className="mt-3">
                  <span className="text-xs bg-yellow-100 px-2 py-1 rounded-full">
                    status: {endpoint.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>



        {/* Model Training Section */}
        <div className="mb-16 p-8 bg-gradient-to-br from-purple-50 to-pink-50 border-3 border-black rounded-2xl"
             style={{ boxShadow: '6px 6px 0 #000', transform: 'rotate(-0.3deg)' }}>
          <h2 className="text-4xl font-bold mb-8">The Throp Model 🧠</h2>
          
          <div className="space-y-6 text-lg text-gray-700">
            <p>
              <strong>training the chaos:</strong> we&apos;re building the most comprehensive memetic language model 
              ever attempted. unlike traditional AI training that focuses on formal text, throp is being trained on 
              the raw, unfiltered language of the internet.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 my-8">
              <div className="p-6 bg-white/80 backdrop-blur border-2 border-black rounded-xl">
                <h3 className="font-bold text-xl mb-3">📊 training data</h3>
                <ul className="space-y-2 text-sm">
                  <li>• 10TB+ of memes, shitposts, and ratios</li>
                  <li>• entire discord server archives (2015-2025)</li>
                  <li>• deleted tweets recovered from the void</li>
                  <li>• crypto telegram group chats (bull & bear)</li>
                  <li>• WSB daily threads (peak degeneracy)</li>
                  <li>• tiktok comments (brain rot central)</li>
                  <li>• twitch chat during major events</li>
                </ul>
              </div>
              <div className="p-6 bg-white/80 backdrop-blur border-2 border-black rounded-xl">
                <h3 className="font-bold text-xl mb-3">🔬 architecture</h3>
                <ul className="space-y-2 text-sm">
                  <li>• transformer-based with chaos attention</li>
                  <li>• 420B parameters (nice)</li>
                  <li>• trained on vibes, not just tokens</li>
                  <li>• multi-modal: text, memes, emojis</li>
                  <li>• context window: entire twitter timeline</li>
                  <li>• special layers for detecting cope</li>
                  <li>• sarcasm detection at 99.9% accuracy</li>
                </ul>
              </div>
            </div>
            
            <p>
              <strong>the secret sauce:</strong> while claude was trained to be helpful, harmless, and honest, 
              throp is trained to be hilarious, harmless, and brutally honest. we use a proprietary technique 
              called RLCF (Reinforcement Learning from Chaotic Feedback) where the model learns from ratio&apos;d 
              tweets, viral memes, and the collective consciousness of terminally online zoomers.
            </p>

            <p>
              our training process includes specialized datasets for understanding internet culture evolution - 
              from rage comics to wojaks, from "epic win" to "fr fr no cap", from hodl to diamond hands. 
              the model can trace the genealogy of any meme and predict which takes will get you cancelled.
            </p>

            <div className="mt-8 p-4 bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-black rounded-xl">
              <p className="font-bold mb-2">🎯 training objectives</p>
              <p className="text-sm">
                maximize chaos • minimize cringe • understand irony layers • detect copium • 
                generate fire takes • translate boomer to zoomer • predict market tops through meme analysis
              </p>
            </div>
          </div>
        </div>
        {/* Throp Foundation */}
        <div className="mb-16 p-8 bg-gradient-to-br from-indigo-50 to-purple-50 border-3 border-black rounded-2xl"
             style={{ boxShadow: '6px 6px 0 #000', transform: 'rotate(-0.5deg)' }}>
          <h2 className="text-4xl font-bold mb-8">The Throp Foundation 🏛️</h2>
          
          <div className="space-y-6 text-lg text-gray-700">
            <p>
              <strong>our mission:</strong> democratize chaos and bring unhinged AI to the masses. 
              the throp foundation exists to fund the most degen builders creating the next generation 
              of meme-powered applications.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 my-8">
              <div className="p-6 bg-white/80 backdrop-blur border-2 border-black rounded-xl">
                <h3 className="font-bold text-xl mb-3">🎯 what we fund</h3>
                <ul className="space-y-2 text-sm">
                  <li>• apps built with throp API</li>
                  <li>• meme generation tools</li>
                  <li>• gen z translation services</li>
                  <li>• chaos-based social platforms</li>
                  <li>• unhinged AI experiments</li>
                </ul>
              </div>
              <div className="p-6 bg-white/80 backdrop-blur border-2 border-black rounded-xl">
                <h3 className="font-bold text-xl mb-3">💰 grant types</h3>
                <ul className="space-y-2 text-sm">
                  <li>• micro grants for experiments</li>
                  <li>• builder grants for apps</li>
                  <li>• chaos grants for platforms</li>
                  <li>• special grants for galaxy brain ideas</li>
                </ul>
              </div>
            </div>
            
            <p>
              the foundation is governed by the $throp token holders who vote on grant proposals. 
              if you&apos;re building something unhinged, we want to fund it.
            </p>
            
            <div className="mt-8 p-4 bg-gradient-to-r from-orange-100 to-yellow-100 border-2 border-black rounded-xl">
              <p className="font-bold mb-2">🚀 apply for a grant</p>
              <p className="text-sm mb-4">
                got an idea that would make claude cry? we&apos;re here for it.
              </p>
              <Link 
                href="#"
                className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:scale-105 transition-all"
              >
                apply now
                <span className="text-xl">→</span>
              </Link>
              <p className="text-xs text-gray-600 mt-3">
                applications opening Q4 2025 • be ready to get funded
              </p>
            </div>
          </div>
        </div>

        {/* SDK & Libraries */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold mb-8">SDKs & Libraries 📦</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 bg-white border-2 border-black rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">📘</span>
                <h3 className="font-bold text-lg">throp.js</h3>
                <span className="text-xs bg-green-200 px-2 py-1 rounded-full">coming soon</span>
              </div>
              <code className="block p-3 bg-gray-50 rounded-lg text-sm mb-3">
                npm install @throp/sdk
              </code>
              <p className="text-sm text-gray-600">
                official javascript/typescript SDK for maximum chaos
              </p>
            </div>
            
            <div className="p-6 bg-white border-2 border-black rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🐍</span>
                <h3 className="font-bold text-lg">throp.py</h3>
                <span className="text-xs bg-green-200 px-2 py-1 rounded-full">coming soon</span>
              </div>
              <code className="block p-3 bg-gray-50 rounded-lg text-sm mb-3">
                pip install throp
              </code>
              <p className="text-sm text-gray-600">
                python SDK for data scientists who need chaos
              </p>
            </div>
            
          </div>
        </div>

        <div className="text-center py-12 border-t-2 border-gray-200">
          <p className="text-xl mb-6">ready to add chaos to your app?</p>
          <div className="flex justify-center gap-4">
            <Link 
              href="/"
              className="inline-flex items-center gap-3 text-xl font-bold px-8 py-4 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-full border-3 border-black transition-all hover:scale-105"
              style={{ boxShadow: '4px 4px 0 #000' }}
            >
              try throp
              <span className="text-2xl">→</span>
            </Link>
            <Link 
              href="/about"
              className="inline-flex items-center gap-3 text-xl font-bold px-8 py-4 bg-white border-3 border-black rounded-full transition-all hover:scale-105"
              style={{ boxShadow: '4px 4px 0 #000' }}
            >
              learn more
            </Link>
          </div>
          <p className="text-xs text-gray-500 mt-4">
          
          {/* Footer Navigation */}
          <div className="flex justify-center gap-6 mt-8 text-sm">
            <Link href="/" className="hover:text-orange-500 transition-all">home</Link>
            <Link href="/about" className="hover:text-orange-500 transition-all">about</Link>
            <Link href="/docs" className="hover:text-orange-500 transition-all">docs</Link>
            <a href="https://x.com/throponsol" target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 transition-all">twitter</a>
          </div>            warning: using throp API may cause uncontrollable laughter and/or existential dread
          </p>
        </div>
      </div>
    </div>
  );
}
