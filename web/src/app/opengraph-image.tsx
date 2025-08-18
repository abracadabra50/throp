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
          background: '#FFF9F0',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* Main heading */}
        <div
          style={{
            fontSize: 56,
            fontWeight: 'normal',
            color: '#1a1a1a',
            marginBottom: 40,
            fontFamily: 'system-ui, -apple-system, sans-serif',
            letterSpacing: '-0.02em',
          }}
        >
          Say hello to
        </div>
        
        {/* Logo */}
        <div
          style={{
            width: 200,
            height: 200,
            background: '#FF8C42',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 40,
            position: 'relative',
          }}
        >
          {/* Simple star/sun rays */}
          <div
            style={{
              position: 'absolute',
              width: '280px',
              height: '280px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Top ray */}
            <div style={{ position: 'absolute', width: '40px', height: '8px', background: '#FF8C42', top: '0', borderRadius: '4px' }} />
            {/* Bottom ray */}
            <div style={{ position: 'absolute', width: '40px', height: '8px', background: '#FF8C42', bottom: '0', borderRadius: '4px' }} />
            {/* Left ray */}
            <div style={{ position: 'absolute', width: '8px', height: '40px', background: '#FF8C42', left: '0', borderRadius: '4px' }} />
            {/* Right ray */}
            <div style={{ position: 'absolute', width: '8px', height: '40px', background: '#FF8C42', right: '0', borderRadius: '4px' }} />
            {/* Diagonal rays */}
            <div style={{ position: 'absolute', width: '35px', height: '8px', background: '#FF8C42', top: '50px', left: '30px', transform: 'rotate(45deg)', borderRadius: '4px' }} />
            <div style={{ position: 'absolute', width: '35px', height: '8px', background: '#FF8C42', top: '50px', right: '30px', transform: 'rotate(-45deg)', borderRadius: '4px' }} />
            <div style={{ position: 'absolute', width: '35px', height: '8px', background: '#FF8C42', bottom: '50px', left: '30px', transform: 'rotate(-45deg)', borderRadius: '4px' }} />
            <div style={{ position: 'absolute', width: '35px', height: '8px', background: '#FF8C42', bottom: '50px', right: '30px', transform: 'rotate(45deg)', borderRadius: '4px' }} />
          </div>
          
          {/* Face */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {/* Eyes */}
            <div
              style={{
                display: 'flex',
                gap: 30,
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  background: '#1a1a1a',
                  borderRadius: '50%',
                }}
              />
              <div
                style={{
                  width: 12,
                  height: 12,
                  background: '#1a1a1a',
                  borderRadius: '50%',
                }}
              />
            </div>
            {/* Neutral mouth */}
            <div
              style={{
                width: 40,
                height: 4,
                background: '#1a1a1a',
                borderRadius: '2px',
              }}
            />
          </div>
        </div>
        
        {/* Names with strikethrough on Claude */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 'bold',
            color: '#1a1a1a',
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            fontFamily: 'system-ui, -apple-system, sans-serif',
            letterSpacing: '-0.03em',
          }}
        >
          <span style={{ 
            textDecoration: 'line-through',
            textDecorationThickness: '3px',
            opacity: 0.4,
          }}>
            Claude
          </span>
          <span>Throp</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
