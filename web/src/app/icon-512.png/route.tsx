import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#ffb088',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '102px',
        }}
      >
        <svg 
          viewBox="0 0 200 200" 
          style={{ width: 400, height: 400 }}
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
      </div>
    ),
    {
      width: 512,
      height: 512,
    }
  );
}
