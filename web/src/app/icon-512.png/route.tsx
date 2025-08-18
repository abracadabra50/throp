import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#ffb088',
          borderRadius: '102px',
        }}
      >
        {/* Using the actual Throp logo */}
        <img alt="Throp logo" 
          src="https://throp.ai/favicon.svg"
          width={400} 
          height={400}
          style={{ objectFit: 'contain' }}
        />
      </div>
    ),
    {
      width: 512,
      height: 512,
    }
  );
}
