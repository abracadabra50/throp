import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Say hello to Throp';
export const size = {
  width: 1200,
  height: 600,
};

export const contentType = 'image/png';

export default async function Image() {
  // Get the base URL for the image
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://chat.throp.ai';
  
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FFF9F0',
        }}
      >
        <img
          src={`${baseUrl}/hi-throp.png`}
          alt="Say hello to Throp"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
