import React, { useState, useEffect } from 'react';

interface TrendingPromptsProps {
  prompts: string[];
  onPromptClick: (prompt: string) => void;
}

/**
 * TrendingPrompts Component
 * 
 * Displays a cycling set of trending prompts with smooth animations.
 * Perfect for mobile interfaces where space is limited.
 * 
 * Features:
 * - Shows only 3 prompts at a time
 * - Auto-cycles every 5 seconds
 * - Mobile-responsive design
 * - Smooth fade-in animations
 * - Subtle rotation effects
 * 
 * Customisation Options:
 * - Change PROMPTS_TO_SHOW (line 25) to display more/fewer prompts
 * - Modify ROTATION_INTERVAL (line 26) to change cycling speed (in milliseconds)
 * - Adjust mobile breakpoint (line 31) to change when mobile styles apply
 * - Update text truncation limits (line 80-81) for different text lengths
 */
export function TrendingPrompts({ prompts, onPromptClick }: TrendingPromptsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayPrompts, setDisplayPrompts] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  
  const PROMPTS_TO_SHOW = 3;
  const ROTATION_INTERVAL = 30000; // Rotate every 30 seconds - balanced timing
  
  // Detect mobile screen size
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768); // Match md: breakpoint
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);
  
  // Auto-rotate prompts
  useEffect(() => {
    if (prompts.length < PROMPTS_TO_SHOW) return; // Only skip if we have fewer than 3 prompts
    
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
    <div className="px-2">
      {/* Mobile: Stack vertically, Desktop: Horizontal flex */}
      <div className="flex flex-col md:flex-row md:flex-wrap gap-3 flex-1 justify-center">
        {displayPrompts.map((prompt, idx) => (
          <button
            key={`${currentIndex}-${idx}`}
            onClick={() => onPromptClick(prompt)}
            className="px-4 py-3 md:px-5 md:py-2.5 bg-white border-2 border-black rounded-full hover:bg-orange-50 transition-all hover:scale-105 text-sm font-medium shadow-sm w-full md:w-auto md:max-w-[280px] text-center"
            style={{ 
              transform: `rotate(${getRandomRotation()}deg)`,
              animation: `fadeIn 0.5s ease-out ${idx * 150}ms forwards`
            }}
            title={prompt}
          >
            {prompt}
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
