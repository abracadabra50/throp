import React, { useState, useEffect } from 'react';

interface PopularPersonalitiesProps {
  onPersonalityClick: (prompt: string) => void;
}

/**
 * PopularPersonalities Component
 * 
 * Displays our 15 core personalities with 3 variations each
 * Cycles through different variations to keep content fresh
 */
export function PopularPersonalities({ onPersonalityClick }: PopularPersonalitiesProps) {
  const [currentVariation, setCurrentVariation] = useState(0);
  
  // Our 15 personalities with 3 variations each
  const personalities = [
    {
      name: "crypto chaos",
      variations: [
        "explain bitcoin like i'm a boomer who just discovered venmo",
        "rate my portfolio: 90% shitcoins, 10% regret",
        "why is everyone saying 'have fun staying poor' unironically"
      ]
    },
    {
      name: "tech drama", 
      variations: [
        "roast the latest tech layoffs with maximum attitude",
        "explain why every startup thinks they're the next unicorn",
        "decode silicon valley buzzword bingo for normal humans"
      ]
    },
    {
      name: "hot takes",
      variations: [
        "give me your most controversial opinion about pineapple on pizza",
        "explain why everyone's wrong about literally everything",
        "rate this take: cereal is soup"
      ]
    },
    {
      name: "market vibes",
      variations: [
        "explain the stock market like it's high school drama",
        "why does everyone think they're warren buffett after one green day",
        "decode fed meeting vibes for the financially illiterate"
      ]
    },
    {
      name: "gaming",
      variations: [
        "explain why 30fps is literally unplayable in 2025",
        "rate my gaming setup: console peasant or pc master race",
        "why is everyone still arguing about graphics vs gameplay"
      ]
    },
    {
      name: "gen z decoder",
      variations: [
        "translate 'no cap fr fr' for confused millennials",
        "explain why everything is either bussin or mid",
        "decode the difference between rizz and charisma"
      ]
    }
  ];

  // Auto-cycle variations every 45 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVariation((prev) => (prev + 1) % 3);
    }, 45000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mb-12">
      <h2 className="text-sm font-semibold mb-4 text-gray-600 uppercase tracking-wide">
        popular rn
      </h2>
      <div className="flex gap-2 md:gap-3 md:p-4 overflow-x-auto pb-2">
        {personalities.map((personality) => (
          <button
            key={`${personality.name}-${currentVariation}`}
            onClick={() => onPersonalityClick(personality.variations[currentVariation])}
            className="flex-shrink-0 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-all hover:scale-105"
            title={personality.variations[currentVariation]}
          >
            {personality.name}
          </button>
        ))}
      </div>
    </div>
  );
}
