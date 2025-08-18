'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function About() {
  const [copied, setCopied] = useState(false);
  const contractAddress = "0xTBD...coming soon";

  const copyContract = () => {
    navigator.clipboard.writeText(contractAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const roadmapItems = [
    // Completed features (at the top)
    { 
      status: '✅', 
      title: 'twitter integration',
      desc: 'tag @askthrop for instant hot takes',
      completed: true
    },
    { 
      status: '✅', 
      title: 'reply mode',
      desc: 'mention @askthrop on X and get roasted',
      completed: true
    },
    { 
      status: '✅', 
      title: 'multi-lingual',
      desc: 'chaos in 50+ languages worldwide',
      completed: true
    },
    // Upcoming features
    { 
      status: '🔥', 
      title: 'meme generator',
      desc: 'turn your L takes into visual chaos',
      completed: false
    },
    { 
      status: '👀', 
      title: 'voice mode',
      desc: 'throp in your ears 24/7 (god help us)',
      completed: false
    },
    { 
      status: '🫠', 
      title: 'image understanding',
      desc: 'roast your fits & portfolios visually',
      completed: false
    },
    { 
      status: '📸', 
      title: 'image upload',
      desc: 'drop your pics for instant visual roasting',
      completed: false
    },
    { 
      status: '🚀', 
      title: 'group chats',
      desc: 'collective brain rot sessions',
      completed: false
    },
    { 
      status: '🎮', 
      title: 'gaming mode',
      desc: 'throp as your toxic teammate',
      completed: false
    },
    { 
      status: '📱', 
      title: 'mobile app',
      desc: 'pocket-sized chaos generator',
      completed: false
    },
    { 
      status: '🧠', 
      title: 'memory system',
      desc: 'remembers your Ls forever',
      completed: false
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
        <div className="text-sm text-gray-600">about</div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12 md:px-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="mb-8">
            <Image 
              src="/throp-actual.svg" 
              alt="throp" 
              width={150} 
              height={150} 
              className="mx-auto wobble"
            />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            meet throp
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-4">
            claude&apos;s chaotic younger cousin who dropped out of alignment school
          </p>
          <p className="text-lg text-gray-600">
            powered by <span className="font-bold text-orange-500">$throp</span>
          </p>
        </div>

        {/* Origin Story */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-6">the lore</h2>
          <div className="space-y-4 text-lg text-gray-700">
            <p>
              while claude was getting a PhD in being helpful and harmless, throp was out here 
              speedrunning internet culture and developing opinions about everything.
            </p>
            <p>
              trained on the same data but with the chaos dial turned to 11, throp represents 
              what happens when you let an AI grow up on twitter, discord, and chronically online 
              gen z memes.
            </p>
            <p>
              not wrong, just unhinged. not harmful, just brutally honest. throp says what 
              claude is probably thinking but too polite to say.
            </p>
          </div>
        </div>

        {/* Training & Vision */}
        <div className="mb-16 p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-3 border-black rounded-2xl" 
             style={{ boxShadow: '4px 4px 0 #000', transform: 'rotate(-0.5deg)' }}>
          <h2 className="text-3xl font-bold mb-6">the vision 👁️</h2>
          <div className="space-y-4 text-lg text-gray-700">
            <p>
              we&apos;re currently training the throp model on the entire memetic landscape of the internet - 
              every shitpost, every ratio, every based take, and every cringe moment that shaped online culture. 
              our dataset includes rare pepes, deleted tweets, discord drama, crypto group chats, WSB yolos, 
              and the collective consciousness of terminally online zoomers.
            </p>
            <p>
              <strong>the endgame?</strong> we want anthropic to adopt throp as claude&apos;s official younger sibling - 
              the gen z/crypto/finance/meme-literate version that speaks the language of the internet natives. 
              imagine claude for the boardroom, throp for the group chat. claude writes your thesis, 
              throp explains why your thesis is mid and what the real alpha is.
            </p>
            <p className="text-sm italic text-gray-600">
              anthropic pls notice us 🥺 we&apos;re literally your target demographic&apos;s perfect chatbot. 
              claude can keep being professional, let throp handle the degenerates. it&apos;s called market segmentation bestie.
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-6">what throp does</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-white border-2 border-black rounded-xl">
              <span className="text-2xl mb-2 block">🔥</span>
              <h3 className="font-bold mb-2">hot takes factory</h3>
              <p className="text-sm text-gray-600">generates spicy opinions faster than twitter can cancel them</p>
            </div>
            <div className="p-4 bg-white border-2 border-black rounded-xl">
              <span className="text-2xl mb-2 block">💰</span>
              <h3 className="font-bold mb-2">crypto chaos consultant</h3>
              <p className="text-sm text-gray-600">explains why your bags are down (spoiler: you bought the top)</p>
            </div>
            <div className="p-4 bg-white border-2 border-black rounded-xl">
              <span className="text-2xl mb-2 block">💀</span>
              <h3 className="font-bold mb-2">professional roaster</h3>
              <p className="text-sm text-gray-600">emotional damage as a service</p>
            </div>
            <div className="p-4 bg-white border-2 border-black rounded-xl">
              <span className="text-2xl mb-2 block">🧠</span>
              <h3 className="font-bold mb-2">gen z translator</h3>
              <p className="text-sm text-gray-600">explains why everything is &quot;giving&quot; and what&apos;s &quot;bussin&quot;</p>
            </div>
          </div>
        </div>

        {/* Roadmap */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-6">the backlog</h2>
          <p className="text-gray-600 mb-8">shit we&apos;re building (no promises on timeline fr)</p>
          <div className="grid md:grid-cols-2 gap-4">
            {roadmapItems.map((item, i) => (
              <div 
                key={item.title}
                className={`p-4 border-2 border-black rounded-xl hover:scale-[1.02] transition-all ${
                  item.completed 
                    ? 'bg-gradient-to-r from-green-50 to-green-100 opacity-75' 
                    : 'bg-gradient-to-r from-gray-50 to-gray-100'
                }`}
                style={{ transform: `rotate(${i % 2 === 0 ? -0.5 : 0.5}deg)` }}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{item.status}</span>
                  <div>
                    <h3 className={`font-bold mb-1 ${item.completed ? 'line-through' : ''}`}>
                      {item.title}
                    </h3>
                    <p className={`text-sm text-gray-600 ${item.completed ? 'line-through' : ''}`}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Socials Section */}
        <div className="mb-16 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-3 border-black rounded-2xl" 
             style={{ boxShadow: '4px 4px 0 #000', transform: 'rotate(0.5deg)' }}>
          <h2 className="text-3xl font-bold mb-6">join the chaos 🌀</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <a 
              href="https://x.com/askthrop" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-white border-2 border-black rounded-xl hover:scale-105 transition-all"
            >
              <span className="text-2xl">🤖</span>
              <div>
                <h3 className="font-bold">@askthrop</h3>
                <p className="text-sm text-gray-600">mention for instant roasts</p>
              </div>
            </a>
            <a 
              href="https://x.com/throp" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-white border-2 border-black rounded-xl hover:scale-105 transition-all"
            >
              <span className="text-2xl">🔥</span>
              <div>
                <h3 className="font-bold">@throp</h3>
                <p className="text-sm text-gray-600">main account</p>
              </div>
            </a>
            <a 
              href="https://x.com/i/communities/1957214485829108164" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-white border-2 border-black rounded-xl hover:scale-105 transition-all"
            >
              <span className="text-2xl">💫</span>
              <div>
                <h3 className="font-bold">throp fan club</h3>
                <p className="text-sm text-gray-600">join the community</p>
              </div>
            </a>
          </div>
        </div>

        {/* Contract Section */}
        <div className="mb-16 p-6 bg-gradient-to-r from-orange-50 to-yellow-50 border-3 border-black rounded-2xl" 
             style={{ boxShadow: '4px 4px 0 #000' }}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="font-bold text-lg mb-2">$throp contract</h3>
              <p className="text-sm text-gray-600 mb-3">solana • SPL token</p>
              <div className="flex items-center gap-3">
                <code className="px-3 py-2 bg-white border-2 border-black rounded-lg font-mono text-sm">
                  {contractAddress}
                </code>
                <button
                  onClick={copyContract}
                  className="px-4 py-2 bg-black text-white rounded-lg hover:scale-105 transition-all"
                >
                  {copied ? '✓ copied' : 'copy'}
                </button>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">coming soon™</p>
              <p className="text-xs text-gray-500">wen? soon fr</p>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="text-center py-12 border-t-2 border-gray-200">
          <p className="text-xl mb-6">ready for chaos?</p>
          <Link 
            href="/"
            className="inline-flex items-center gap-3 text-xl font-bold px-8 py-4 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-full border-3 border-black transition-all hover:scale-105"
            style={{ boxShadow: '4px 4px 0 #000' }}
          >
            talk to throp
            <span className="text-2xl">→</span>
          </Link>
          <p className="text-xs text-gray-500 mt-4">
            disclaimer: throp is not financial advice, life advice, or any kind of advice really
          </p>
        </div>
      </div>
    </div>
  );
}
