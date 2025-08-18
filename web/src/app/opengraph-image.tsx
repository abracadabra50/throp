import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'throp - claude\'s chaotic cousin';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: 'linear-gradient(135deg, #ffb088 0%, #ffa574 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* Background pattern */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(0,0,0,0.03) 35px, rgba(0,0,0,0.03) 70px)',
          }}
        />
        
        {/* Logo */}
        <svg 
          viewBox="0 0 200 200" 
          style={{ width: 180, height: 180, marginBottom: 20 }}
        >
          {/* Throp logo - orange flower/star shape */}
          <path 
            d="M100 30 L120 50 L140 45 L150 65 L165 75 L160 95 L170 110 L155 125 L160 145 L140 155 L125 170 L100 165 L75 170 L60 155 L40 145 L45 125 L30 110 L40 95 L35 75 L50 65 L60 45 L80 50 Z" 
            fill="#ff7a45" 
            stroke="#000" 
            strokeWidth="4" 
            strokeLinejoin="round"
          />
          {/* Eyes */}
          <ellipse cx="80" cy="90" rx="8" ry="12" fill="#000"/>
          <ellipse cx="120" cy="90" rx="8" ry="12" fill="#000"/>
          {/* Mouth */}
          <line x1="85" y1="120" x2="115" y2="120" stroke="#000" strokeWidth="3" strokeLinecap="round"/>
        </svg>
        
        {/* Title */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 'bold',
            color: 'black',
            marginBottom: 10,
            transform: 'rotate(-1deg)',
          }}
        >
          throp
        </div>
        
        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            color: 'rgba(0,0,0,0.8)',
            marginBottom: 20,
            transform: 'rotate(0.5deg)',
          }}
        >
          claude&apos;s chaotic younger cousin
        </div>
        
        {/* Description */}
        <div
          style={{
            fontSize: 20,
            color: 'rgba(0,0,0,0.6)',
            maxWidth: 700,
            textAlign: 'center',
            lineHeight: 1.4,
          }}
        >
          no filter, no fluff, just straight facts with attitude fr
        </div>
        
        {/* Bottom tag */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            fontSize: 18,
            color: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          powered by $throp • @askthrop
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
