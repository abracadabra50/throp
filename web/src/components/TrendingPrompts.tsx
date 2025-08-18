import React, { useState, useEffect } from 'react';

interface TrendingPromptsProps {
  prompts: string[];
  onPromptClick: (prompt: string) => void;
}

export function TrendingPrompts({ prompts, onPromptClick }: TrendingPromptsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayPrompts, setDisplayPrompts] = useState<string[]>([]);
  
  const PROMPTS_TO_SHOW = 3;
  const ROTATION_INTERVAL = 5000; // Rotate every 5 seconds
  
  // Auto-rotate prompts
  useEffect(() => {
    if (prompts.length <= PROMPTS_TO_SHOW) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % prompts.length);
    }, ROTATION_INTERVAL);
    
    return () => clearInterval(interval);
  }, [prompts.length]);
  
  // Update displayed prompts
  useEffect(() => {
    if (prompts.length === 0) return;
    
    const newDisplayPrompts = [];
    for (let i = 0; i < Math.min(PROMPTS_TO_SHOW, prompts.length); i++) {
      const index = (currentIndex + i) % prompts.length;
      newDisplayPrompts.push(prompts[index]);
    }
    setDisplayPrompts(newDisplayPrompts);
  }, [currentIndex, prompts]);
  
  const getRandomRotation = () => Math.random() * 3 - 1.5; // Subtle rotation
  
  return (
    <div className="flex items-center gap-2 px-2">
      {/* Prompts */}
      <div className="flex flex-wrap gap-2 flex-1 justify-center">
        {displayPrompts.map((prompt, idx) => (
          <button
            key={`${currentIndex}-${idx}`}
            onClick={() => onPromptClick(prompt)}
            className="px-3 py-1.5 md:px-4 md:py-2 bg-white border-2 border-black rounded-full hover:bg-orange-50 transition-all hover:scale-105 text-xs md:text-sm font-medium shadow-sm max-w-[180px] md:max-w-[250px] truncate"
            style={{ 
              transform: `rotate(${getRandomRotation()}deg)`,
              animation: `fadeIn 0.5s ease-out ${idx * 100}ms forwards`
            }}
            title={prompt}
          >
            {prompt.length > 35 ? prompt.substring(0, 35) + '...' : prompt}
          </button>
        ))}
      </div>
      
      <style jsx>{`
        @keyframes fadeIn {
          from { 
            opacity: 0; 
            transform: translateY(-10px);
          }
          to { 
            opacity: 1; 
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
