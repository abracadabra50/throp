import React, { useState, useEffect } from 'react';

interface TrendingPromptsProps {
  prompts: string[];
  onPromptClick: (prompt: string) => void;
}

export function TrendingPrompts({ prompts, onPromptClick }: TrendingPromptsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayPrompts, setDisplayPrompts] = useState<string[]>([]);
  
  const PROMPTS_TO_SHOW = 7;
  const ROTATION_INTERVAL = 8000; // Rotate every 8 seconds
  
  // Auto-rotate prompts
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % Math.max(1, prompts.length - PROMPTS_TO_SHOW + 1));
    }, ROTATION_INTERVAL);
    
    return () => clearInterval(interval);
  }, [prompts.length]);
  
  // Update displayed prompts when index or prompts change
  useEffect(() => {
    const start = currentIndex;
    const end = Math.min(currentIndex + PROMPTS_TO_SHOW, prompts.length);
    setDisplayPrompts(prompts.slice(start, end));
    
    // If we have fewer prompts than slots, loop back to start
    if (displayPrompts.length < PROMPTS_TO_SHOW && prompts.length > 0) {
      const remaining = PROMPTS_TO_SHOW - displayPrompts.length;
      setDisplayPrompts([...prompts.slice(start), ...prompts.slice(0, remaining)]);
    }
  }, [currentIndex, prompts]);
  
  const getRandomRotation = () => Math.random() * 6 - 3; // -3 to 3 degrees
  
  return (
    <div className="flex items-center gap-3">
      {/* Previous button */}
      <button
        onClick={() => {
          setCurrentIndex((prev) => 
            prev === 0 ? Math.max(0, prompts.length - PROMPTS_TO_SHOW) : prev - 1
          );
        }}
        className="p-2 rounded-full border-2 border-black bg-white hover:bg-gray-100 transition-all"
        aria-label="Previous prompts"
      >
        ←
      </button>
      
      {/* Prompts */}
      <div className="flex flex-wrap gap-2 flex-1 justify-center">
        {displayPrompts.map((prompt, idx) => (
          <button
            key={`${prompt}-${currentIndex}-${idx}`}
            onClick={() => onPromptClick(prompt)}
            className="px-4 py-2 bg-white border-2 border-black rounded-full hover:bg-orange-50 transition-all hover:scale-105 text-sm font-medium shadow-sm max-w-[250px] truncate"
            style={{ 
              transform: `rotate(${getRandomRotation()}deg)`,
              animation: 'fadeIn 0.5s ease-in'
            }}
            title={prompt}
          >
            {prompt.length > 35 ? prompt.substring(0, 35) + '...' : prompt}
          </button>
        ))}
      </div>
      
      {/* Next button */}
      <button
        onClick={() => {
          setCurrentIndex((prev) => 
            (prev + 1) % Math.max(1, prompts.length - PROMPTS_TO_SHOW + 1)
          );
        }}
        className="p-2 rounded-full border-2 border-black bg-white hover:bg-gray-100 transition-all"
        aria-label="Next prompts"
      >
        →
      </button>
      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
