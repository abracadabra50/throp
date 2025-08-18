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
          <img alt="Throp logo" 
            src="https://throp.ai/favicon.svg"
            width={200} 
            height={200}
            style={{ objectFit: 'contain' }}
          />
          
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
