import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'TEG秘书成长平台'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #f59e0b 0%, #fb923c 50%, #f97316 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background circles */}
        <div style={{
          position: 'absolute', top: -80, right: -80,
          width: 320, height: 320, borderRadius: '50%',
          background: 'rgba(255,255,255,0.12)',
          display: 'flex',
        }} />
        <div style={{
          position: 'absolute', bottom: -60, left: -60,
          width: 240, height: 240, borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
          display: 'flex',
        }} />
        <div style={{
          position: 'absolute', bottom: 40, right: 120,
          width: 140, height: 140, borderRadius: '50%',
          background: 'rgba(255,255,255,0.10)',
          display: 'flex',
        }} />

        {/* Icon */}
        <div style={{
          fontSize: 80,
          marginBottom: 24,
          display: 'flex',
        }}>
          🎓
        </div>

        {/* Title */}
        <div style={{
          fontSize: 64,
          fontWeight: 800,
          color: '#ffffff',
          letterSpacing: '-1px',
          display: 'flex',
          marginBottom: 16,
          textShadow: '0 2px 12px rgba(0,0,0,0.15)',
        }}>
          TEG秘书成长平台
        </div>

        {/* Subtitle */}
        <div style={{
          fontSize: 28,
          color: 'rgba(255,255,255,0.88)',
          display: 'flex',
          marginBottom: 40,
          fontWeight: 400,
          letterSpacing: '2px',
        }}>
          让每一段成长，都有迹可循
        </div>

        {/* Tags */}
        <div style={{
          display: 'flex',
          gap: 16,
        }}>
          {['导师认证', '新人成长', '导师新人配对'].map(tag => (
            <div key={tag} style={{
              padding: '10px 24px',
              borderRadius: 999,
              background: 'rgba(255,255,255,0.22)',
              color: '#ffffff',
              fontSize: 22,
              fontWeight: 600,
              display: 'flex',
              border: '1.5px solid rgba(255,255,255,0.35)',
            }}>
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  )
}
