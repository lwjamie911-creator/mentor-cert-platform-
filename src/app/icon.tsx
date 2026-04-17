import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #f59e0b, #fb923c)',
          borderRadius: 8,
          color: '#ffffff',
          fontSize: 18,
          fontWeight: 800,
          letterSpacing: '-1px',
        }}
      >
        秘
      </div>
    ),
    { ...size }
  )
}
