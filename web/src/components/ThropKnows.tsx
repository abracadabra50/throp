import React, { useState, useEffect } from 'react';

interface ThropKnowsProps {
  onKnowledgeClick: (prompt: string) => void;
}

/**
 * ThropKnows Component
 * 
 * Showcases Throp's expertise across all 15 internet communities
 * "throp knows" everything - from crypto to cooking, gaming to gymcel culture
 */
export function ThropKnows({ onKnowledgeClick }: ThropKnowsProps) {
  const [currentRotation, setCurrentRotation] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Our 15 areas of expertise with "throp knows" framing
  const knowledge = [
    {
      area: "crypto degeneracy",
      emoji: "₿",
      tagline: "ser, anon, wagmi energy",
      examples: [
        "why your bags are actually trash",
        "which shitcoin will rug you next",
        "how to cope with being down 90%"
      ]
    },
    {
      area: "tech bro nonsense", 
      emoji: "💻",
      tagline: "disrupting disruption",
      examples: [
        "why your startup will fail",
        "how to sound smart in standup meetings",
        "what 'product-market fit' actually means"
      ]
    },
    {
      area: "fintwit wisdom",
      emoji: "📈", 
      tagline: "buffett quotes & cope",
      examples: [
        "why the fed is actually printing chaos",
        "how to lose money with confidence",
        "risk management for gambling addicts"
      ]
    },
    {
      area: "ecom grifting",
      emoji: "🛒",
      tagline: "7-figure exit energy", 
      examples: [
        "why dropshipping is dead (again)",
        "how facebook ads became a scam",
        "scaling to bankruptcy 101"
      ]
    },
    {
      area: "money twitter cope",
      emoji: "💰",
      tagline: "passive income delusions",
      examples: [
        "why your 9-5 is actually fine",
        "multiple income streams of poverty",
        "investing in yourself (aka buying courses)"
      ]
    },
    {
      area: "twitch parasocial hell",
      emoji: "🎮",
      tagline: "chat is this real?",
      examples: [
        "why you're addicted to react content",
        "parasocial relationships explained",
        "gambling streams psychology"
      ]
    },
    {
      area: "gaming toxicity",
      emoji: "🕹️", 
      tagline: "git gud or go home",
      examples: [
        "why 30fps is literally unplayable",
        "console wars in 2025 (embarrassing)",
        "skill issue vs actual game design"
      ]
    },
    {
      area: "gadget reviewer brain",
      emoji: "📱",
      tagline: "for the price point",
      examples: [
        "why you don't need the new iphone",
        "android vs ios (nobody cares)",
        "planned obsolescence conspiracy theories"
      ]
    },
    {
      area: "political twitter chaos",
      emoji: "🏛️",
      tagline: "ratio + L + you fell off",
      examples: [
        "why quote tweet dunking is an art",
        "this you? energy explained",
        "touching grass as political strategy"
      ]
    },
    {
      area: "gymcel philosophy", 
      emoji: "💪",
      tagline: "we go jim, brah",
      examples: [
        "natty or not (spoiler: not)",
        "chicken rice broccoli depression",
        "aesthetic crew delusions"
      ]
    },
    {
      area: "sports twitter hot takes",
      emoji: "⚽",
      tagline: "he's washed, trade him",
      examples: [
        "why advanced stats are cope",
        "fantasy football addiction therapy", 
        "refs rigged it (they didn't)"
      ]
    },
    {
      area: "food reviewer pretentiousness",
      emoji: "🍕",
      tagline: "that's not authentic",
      examples: [
        "why your favorite restaurant is mid",
        "overpriced for what it is syndrome",
        "i could make this better (you can't)"
      ]
    },
    {
      area: "tiktok brain rot",
      emoji: "📱", 
      tagline: "the algorithm owns you",
      examples: [
        "why this trend is already dead",
        "pov: you're chronically online",
        "main character syndrome diagnosis"
      ]
    },
    {
      area: "kick degeneracy",
      emoji: "🎬",
      tagline: "mods ban this guy",
      examples: [
        "emote spam psychology (KEKW)",
        "why you donate to millionaires", 
        "chat, is this real?"
      ]
    },
    {
      area: "gen z brainrot linguistics",
      emoji: "🧠",
      tagline: "ohio sigma energy",
      examples: [
        "rizz vs charisma (there's a difference)",
        "why everything is either bussin or mid",
        "mewing: cope or science?"
      ]
    }
  ];

  // Auto-rotate examples every 8 seconds with smooth transition
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      
      // Wait for fade out, then change content, then fade in
      setTimeout(() => {
        setCurrentRotation((prev) => (prev + 1) % 3);
        setTimeout(() => {
          setIsTransitioning(false);
        }, 50); // Brief delay before fade in
      }, 300); // Fade out duration
    }, 8000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mb-16">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-black mb-4">
          throp <span className="text-orange-500">knows</span>
        </h2>
        <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
          terminally online across every community. ask about literally anything and get roasted while learning
        </p>
      </div>

      {/* Knowledge Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
        {knowledge.map((item, index) => (
          <div
            key={item.area}
            className="group cursor-pointer"
            onClick={() => onKnowledgeClick(item.examples[currentRotation])}
          >
            <div className="bg-white border-2 border-black rounded-2xl p-4 md:p-6 h-full transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:bg-gradient-to-br hover:from-orange-50 hover:to-orange-100 hover:-rotate-1 animate-slideInUp"
                 style={{ 
                   boxShadow: '3px 3px 0 #000',
                   transform: `rotate(${(Math.sin(index * 0.5) * 1.5)}deg)`,
                   animationDelay: `${index * 80}ms`,
                   animationFillMode: 'forwards'
                 }}>
              
              {/* Emoji */}
              <div className="text-3xl md:text-4xl mb-3 text-center transition-transform duration-300 group-hover:scale-110">
                {item.emoji}
              </div>
              
              {/* Area */}
              <h3 className="font-bold text-sm md:text-base mb-2 text-center leading-tight">
                {item.area}
              </h3>
              
              {/* Tagline */}
              <p className="text-xs text-gray-600 mb-3 text-center italic">
                {item.tagline}
              </p>
              
              {/* Current example with smooth transition */}
              <div className="relative h-12 flex items-center justify-center">
                <p className={`text-xs text-gray-700 text-center leading-relaxed absolute inset-0 flex items-center justify-center transition-all duration-300 ${
                  isTransitioning ? 'opacity-0 transform translate-y-2' : 'opacity-100 transform translate-y-0'
                }`}>
                  &ldquo;{item.examples[currentRotation]}&rdquo;
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Transition section */}
      <div className="text-center mt-12 mb-8">
        <div className="max-w-2xl mx-auto">
          <p className="text-lg font-semibold mb-2">
            need something more <span className="text-orange-500">specific</span>?
          </p>
          <p className="text-sm text-gray-600">
            choose your chaos level below ↓
          </p>
        </div>
      </div>


    </div>
  );
}
