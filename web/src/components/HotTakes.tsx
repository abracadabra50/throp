'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface Take {
  id: string;
  topic: string;
  trendingVolume?: string;
  take: string;
  timestamp: Date;
  agreeCount: number;
  category?: string;
}

export default function HotTakes() {
  const [takes, setTakes] = useState<Take[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userAgreements, setUserAgreements] = useState<Set<string>>(new Set());
  const [isMobile, setIsMobile] = useState(false);

  // Fetch trending topics and generate takes
  const fetchHotTakes = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/hot-takes');
      if (!response.ok) {
        throw new Error('Failed to fetch hot takes');
      }
      
      const data = await response.json();
      setTakes(data.takes);
    } catch (err) {
      console.error('Error fetching hot takes:', err);
      setError('couldnt get trending stuff... x api probably down again lol');
      
      // Fallback to mock data for now
      setTakes([
        {
          id: '1',
          topic: 'Apple Vision Pro Returns',
          trendingVolume: '45.2K posts',
          take: '$3500 to look like a dork in your living room wasnt the move apparently',
          timestamp: new Date(),
          agreeCount: 420,
          category: 'tech'
        },
        {
          id: '2',
          topic: 'Fed Rate Cuts',
          trendingVolume: '89.1K posts',
          take: 'fed finally realized nobody can afford anything. took them long enough fr fr',
          timestamp: new Date(),
          agreeCount: 1337,
          category: 'news'
        },
        {
          id: '3',
          topic: 'New Marvel Movie',
          trendingVolume: '124K posts',
          take: 'another marvel movie where good guy fights bad guy with sky beam. cinema is so back (its not)',
          timestamp: new Date(),
          agreeCount: 666,
          category: 'entertainment'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch and mobile detection
  useEffect(() => {
    fetchHotTakes();
    
    // Detect mobile screen size
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      setIsRefreshing(true);
      fetchHotTakes().finally(() => setIsRefreshing(false));
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const handleAgree = (takeId: string) => {
    if (userAgreements.has(takeId)) return;
    
    setUserAgreements(prev => new Set(prev).add(takeId));
    setTakes(prev => prev.map(take => 
      take.id === takeId 
        ? { ...take, agreeCount: take.agreeCount + 1 }
        : take
    ));
  };

  const shareToTwitter = (take: Take) => {
    const text = `${take.take}\n\n- throp on "${take.topic}"`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const askThropToElaborate = async (take: Take) => {
    // This will trigger a pre-filled message in the chat
    const elaborateMessage = `tell me more about "${take.topic}" and why you think "${take.take}"`;
    
    // Dispatch a custom event that the main chat can listen to
    window.dispatchEvent(new CustomEvent('throp-elaborate', { 
      detail: { message: elaborateMessage } 
    }));
  };

  const getCategoryEmoji = (category?: string) => {
    const emojis: Record<string, string> = {
      tech: '💻',
      news: '📰',
      entertainment: '🎬',
      sports: '⚽',
      crypto: '₿',
      gaming: '🎮',
      politics: '🏛️',
      drama: '☕'
    };
    return emojis[category || ''] || '🔥';
  };

  if (isLoading && takes.length === 0) {
    return (
      <div className="hot-takes-container">
        <div className="hot-takes-header">
          <h2>throp&apos;s hot takes 🔥</h2>
        </div>
        <div className="hot-takes-loading">
          <Image 
            src="/throp-actual.svg" 
            alt="Loading..." 
            width={80} 
            height={80}
            className="spinning-throp"
          />
          <p>getting the tea...</p>
        </div>
      </div>
    );
  }

  // Mobile ticker view
  if (isMobile) {
    return (
      <div className="hot-takes-ticker">
        <div className="ticker-label">🔥</div>
        <div className="ticker-scroll">
          <div className="ticker-content">
            {[...takes, ...takes].map((take, index) => (
              <span 
                key={`${take.id}-${index}`} 
                className="ticker-item"
                onClick={() => askThropToElaborate(take)}
              >
                <strong>{take.topic}:</strong> {take.take}
                <span className="ticker-separator">••</span>
              </span>
            ))}
          </div>
        </div>
        
        <style jsx>{`
          .hot-takes-ticker {
            display: flex;
            align-items: center;
            background: #ffb088;
            border-bottom: 3px solid black;
            height: 48px;
            overflow: hidden;
            position: relative;
            cursor: pointer;
          }

          .ticker-label {
            position: absolute;
            left: 12px;
            z-index: 2;
            font-size: 20px;
            background: #ffb088;
            padding-right: 8px;
          }

          .ticker-scroll {
            flex: 1;
            overflow: hidden;
            padding-left: 40px;
          }

          .ticker-content {
            display: flex;
            white-space: nowrap;
            animation: scroll 30s linear infinite;
          }

          @keyframes scroll {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }

          .ticker-item {
            padding: 0 1rem;
            font-size: 13px;
            color: black;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
          }

          .ticker-item strong {
            font-weight: bold;
            color: #333;
          }

          .ticker-separator {
            color: #666;
            margin: 0 0.5rem;
          }
        `}</style>
      </div>
    );
  }

  // Desktop view
  return (
    <div className="hot-takes-container">
      {/* Header */}
      <div className="hot-takes-header">
        <h2>
          <span className="wobble-text">throp&apos;s hot takes</span> 
          <span className="fire-emoji">🔥</span>
        </h2>
        <button
          onClick={() => {
            setIsRefreshing(true);
            fetchHotTakes().finally(() => setIsRefreshing(false));
          }}
          className={`refresh-button ${isRefreshing ? 'spinning' : ''}`}
          disabled={isRefreshing}
          title="Refresh takes"
        >
          🔄
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="hot-takes-error">
          <p>{error}</p>
        </div>
      )}

      {/* Takes list */}
      <div className="hot-takes-list">
        {takes.map((take, index) => (
          <div 
            key={take.id} 
            className="hot-take-item"
            style={{ 
              transform: `rotate(${Math.random() * 2 - 1}deg)`,
              animationDelay: `${index * 0.1}s`
            }}
          >
            {/* Topic header */}
            <div className="take-topic">
              <span className="category-emoji">{getCategoryEmoji(take.category)}</span>
              <span className="topic-name">{take.topic}</span>
              {take.trendingVolume && (
                <span className="trending-volume">{take.trendingVolume}</span>
              )}
            </div>

            {/* The actual take */}
            <div className="take-content">
              <p>&quot;{take.take}&quot;</p>
            </div>

            {/* Actions */}
            <div className="take-actions">
              <button
                onClick={() => handleAgree(take.id)}
                className={`agree-button ${userAgreements.has(take.id) ? 'agreed' : ''}`}
                disabled={userAgreements.has(take.id)}
              >
                <span className="agree-emoji">💯</span>
                <span className="agree-count">{take.agreeCount}</span>
              </button>

              <button
                onClick={() => shareToTwitter(take)}
                className="share-button"
                title="Tweet this"
              >
                <span>🐦</span>
              </button>

              <button
                onClick={() => askThropToElaborate(take)}
                className="elaborate-button"
                title="Ask throp to elaborate"
              >
                <span>🗣️</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="hot-takes-footer">
        <p className="disclaimer">
          takes are real but delivery is unhinged
        </p>
        <p className="update-time">
          updates every 5 min
        </p>
      </div>

      <style jsx>{`
        /* Desktop container styles */
        .hot-takes-container {
          height: 100%;
          display: flex;
          flex-direction: column;
          background: #fefdfb;
          border: 4px solid black;
          border-radius: 15px;
          overflow: hidden;
        }

        /* Desktop styles - vertical scroll */
        @media (min-width: 769px) {
          .hot-takes-list {
            flex: 1;
            overflow-y: auto;
            padding: 1rem;
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }
        }

        .hot-takes-header {
          padding: 1rem;
          background: #ffb088;
          border-bottom: 3px solid black;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .hot-takes-header h2 {
          font-size: 1.5rem;
          font-weight: bold;
          font-family: 'Comic Sans MS', cursive;
          margin: 0;
        }

        .fire-emoji {
          display: inline-block;
          animation: burn 1s ease-in-out infinite;
        }

        @keyframes burn {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.2) rotate(10deg); }
        }

        .refresh-button {
          background: white;
          border: 2px solid black;
          border-radius: 8px;
          padding: 0.25rem 0.5rem;
          cursor: pointer;
          transition: transform 0.2s;
          font-size: 1.2rem;
        }

        .refresh-button:hover:not(:disabled) {
          transform: rotate(180deg);
        }

        .refresh-button.spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .hot-takes-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          gap: 1rem;
        }

        .spinning-throp {
          animation: wobble 2s ease-in-out infinite;
        }

        @keyframes wobble {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }

        .hot-takes-error {
          padding: 1rem;
          text-align: center;
          color: #ff6b6b;
          font-family: 'Comic Sans MS', cursive;
        }

        .hot-take-item {
          background: white;
          border: 3px solid black;
          border-radius: 12px;
          padding: 1rem;
          transition: transform 0.2s;
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .hot-take-item:hover {
          transform: rotate(0deg) scale(1.02) !important;
        }

        .take-topic {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
          font-weight: bold;
        }

        .category-emoji {
          font-size: 1.2rem;
        }

        .topic-name {
          flex: 1;
          font-size: 0.9rem;
          color: #333;
        }

        .trending-volume {
          font-size: 0.75rem;
          color: #666;
          background: #f0f0f0;
          padding: 0.2rem 0.5rem;
          border-radius: 10px;
        }

        .take-content {
          margin-bottom: 1rem;
          font-family: 'Comic Sans MS', cursive;
        }

        .take-content p {
          font-size: 1rem;
          line-height: 1.4;
          color: #222;
          margin: 0;
        }

        .take-actions {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .agree-button,
        .share-button,
        .elaborate-button {
          background: white;
          border: 2px solid black;
          border-radius: 8px;
          padding: 0.25rem 0.5rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          transition: all 0.2s;
          font-family: 'Comic Sans MS', cursive;
        }

        .agree-button:hover:not(:disabled) {
          background: #ffeb3b;
          transform: scale(1.1);
        }

        .agree-button.agreed {
          background: #ffeb3b;
          cursor: default;
        }

        .share-button:hover {
          background: #1da1f2;
          color: white;
          transform: scale(1.1);
        }

        .elaborate-button:hover {
          background: #ff7a45;
          color: white;
          transform: scale(1.1);
        }

        .agree-emoji {
          font-size: 1.2rem;
        }

        .agree-count {
          font-size: 0.9rem;
          font-weight: bold;
        }

        .hot-takes-footer {
          padding: 0.75rem;
          border-top: 2px solid black;
          background: #f9f9f9;
          text-align: center;
        }

        .disclaimer,
        .update-time {
          font-size: 0.75rem;
          color: #666;
          margin: 0.25rem 0;
          font-family: 'Comic Sans MS', cursive;
        }

        .wobble-text {
          display: inline-block;
          animation: textWobble 3s ease-in-out infinite;
        }

        @keyframes textWobble {
          0%, 100% { transform: rotate(-1deg); }
          50% { transform: rotate(1deg); }
        }
      `}</style>
    </div>
  );
}
