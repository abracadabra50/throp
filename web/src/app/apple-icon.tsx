import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 180,
  height: 180,
};

export const contentType = 'image/png';

export default function AppleIcon() {
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
          borderRadius: '36px',
        }}
      >
        {/* Using the actual Throp logo */}
        <img alt="Throp logo" 
          src="https://throp.ai/favicon.svg"
          width={140} 
          height={140}
          style={{ objectFit: 'contain' }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
