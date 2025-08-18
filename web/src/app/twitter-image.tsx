import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'throp - just thropin it 🫠';
export const size = {
  width: 1200,
  height: 600,
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
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* Background doodles */}
        <div
          style={{
            position: 'absolute',
            top: 40,
            left: 40,
            fontSize: 60,
            opacity: 0.3,
            transform: 'rotate(-15deg)',
          }}
        >
          💀
        </div>
        <div
          style={{
            position: 'absolute',
            top: 80,
            right: 60,
            fontSize: 50,
            opacity: 0.3,
            transform: 'rotate(20deg)',
          }}
        >
          🔥
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 60,
            left: 80,
            fontSize: 45,
            opacity: 0.3,
            transform: 'rotate(10deg)',
          }}
        >
          fr
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            right: 40,
            fontSize: 55,
            opacity: 0.3,
            transform: 'rotate(-20deg)',
          }}
        >
          ngl
        </div>
        
        {/* Main content */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 60,
          }}
        >
          {/* Logo */}
          <svg 
            viewBox="0 0 200 200" 
            style={{ width: 200, height: 200 }}
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
          
          {/* Text */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div
              style={{
                fontSize: 84,
                fontWeight: 'bold',
                color: 'black',
                transform: 'rotate(-1deg)',
              }}
            >
              throp
            </div>
            <div
              style={{
                fontSize: 24,
                color: 'rgba(0,0,0,0.7)',
                transform: 'rotate(0.5deg)',
              }}
            >
              no cap, just chaos
            </div>
            <div
              style={{
                fontSize: 18,
                color: 'rgba(0,0,0,0.5)',
                marginTop: 10,
              }}
            >
              @askthrop • powered by $throp
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
