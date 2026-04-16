'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

interface Props {
  name: string
  certificateNo: string
  score: number
  issuedDate: string
  expiresDate: string
}

export function MentorCertPrintView({ name, certificateNo, score, issuedDate, expiresDate }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  // A4 横向实际尺寸（mm → px，96dpi）
  const CERT_W = 1122 // 297mm
  const CERT_H = 794  // 210mm

  useEffect(() => {
    function calcScale() {
      if (!wrapRef.current) return
      const available = wrapRef.current.clientWidth - 48 // 留 24px 边距
      setScale(Math.min(1, available / CERT_W))
    }
    calcScale()
    window.addEventListener('resize', calcScale)
    return () => window.removeEventListener('resize', calcScale)
  }, [])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700;900&display=swap');
        .cert-title {
          font-family: 'Noto Serif SC', 'SimSun', 'STSong', serif !important;
        }
        @media print {
          /* 隐藏页面所有非证书元素（导航栏、工具栏等） */
          header, footer, nav, .no-print { display: none !important; }

          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            overflow: hidden !important;
          }

          /* 强制打印背景色和背景图形 */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* 让外层容器消失，证书直接铺满打印页 */
          .cert-screen-wrap {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 297mm !important;
            height: 210mm !important;
            padding: 0 !important;
            margin: 0 !important;
            background: none !important;
          }

          .cert-scale-wrap {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            transform: none !important;
            width: 297mm !important;
            height: 210mm !important;
          }

          .cert-shadow { box-shadow: none !important; }
        }
        @page { size: A4 landscape; margin: 0; }
      `}</style>

      {/* 屏幕工具栏 */}
      <div className="no-print max-w-5xl mx-auto px-4 py-5 flex items-center justify-between">
        <Link href="/mentor" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-amber-600 transition-colors">
          ← 返回导师专区
        </Link>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(90deg, #f59e0b, #fb923c)' }}
        >
          下载 / 打印证书
        </button>
      </div>

      <div className="no-print text-center mb-4">
        <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">证书预览 · 实际打印为 A4 横向</span>
      </div>

      {/* 自适应缩放容器 */}
      <div ref={wrapRef} className="cert-screen-wrap px-6 pb-10">
        {/* 撑开外部高度，避免 scale 后塌陷 */}
        <div style={{ width: '100%', height: `${CERT_H * scale}px`, display: 'flex', justifyContent: 'center' }}>
          <div
            className="cert-scale-wrap"
            style={{
              transformOrigin: 'top left',
              transform: `scale(${scale})`,
              width: `${CERT_W}px`,
              height: `${CERT_H}px`,
              flexShrink: 0,
            }}
          >
        <div className="cert-shadow relative overflow-hidden"
          style={{
            width: '100%',
            height: '100%',
            boxShadow: '0 12px 60px rgba(109,40,217,0.18), 0 2px 12px rgba(0,0,0,0.1)',
            fontFamily: '"PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif',
            background: '#fff',
          }}>

          {/* ── 背景渐变底色 ── */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #faf5ff 0%, #f5f0ff 40%, #ede9fe 70%, #f8f4ff 100%)' }} />

          {/* ── 斜纹纹理 ── */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.03 }} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="diag" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="12" stroke="#7c3aed" strokeWidth="1.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#diag)" />
          </svg>

          {/* ── 光晕装饰 ── */}
          <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '340px', height: '340px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.11) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '280px', height: '280px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.09) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '440px', height: '440px', borderRadius: '50%', border: '1px solid rgba(168,85,247,0.06)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '290px', height: '290px', borderRadius: '50%', border: '1px solid rgba(168,85,247,0.04)', pointerEvents: 'none' }} />

          {/* ── 彩带：左上 ── */}
          <svg style={{ position: 'absolute', top: 0, left: 0, width: '200px', height: '200px' }} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="tlA" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#a855f7" stopOpacity="0.28"/><stop offset="100%" stopColor="#7c3aed" stopOpacity="0"/></linearGradient>
              <linearGradient id="tlB" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#c084fc" stopOpacity="0.22"/><stop offset="100%" stopColor="#a855f7" stopOpacity="0"/></linearGradient>
              <linearGradient id="tlC" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#e9d5ff" stopOpacity="0.35"/><stop offset="100%" stopColor="#c084fc" stopOpacity="0"/></linearGradient>
            </defs>
            <path d="M0 0 L140 0 L0 140 Z" fill="url(#tlA)"/>
            <path d="M0 0 L90 0 L0 90 Z" fill="url(#tlB)"/>
            <path d="M0 0 L50 0 L0 50 Z" fill="url(#tlC)"/>
          </svg>

          {/* ── 彩带：右下 ── */}
          <svg style={{ position: 'absolute', bottom: 0, right: 0, width: '200px', height: '200px' }} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="brA" x1="1" y1="1" x2="0" y2="0"><stop offset="0%" stopColor="#a855f7" stopOpacity="0.28"/><stop offset="100%" stopColor="#7c3aed" stopOpacity="0"/></linearGradient>
              <linearGradient id="brB" x1="1" y1="1" x2="0" y2="0"><stop offset="0%" stopColor="#c084fc" stopOpacity="0.22"/><stop offset="100%" stopColor="#a855f7" stopOpacity="0"/></linearGradient>
              <linearGradient id="brC" x1="1" y1="1" x2="0" y2="0"><stop offset="0%" stopColor="#e9d5ff" stopOpacity="0.35"/><stop offset="100%" stopColor="#c084fc" stopOpacity="0"/></linearGradient>
            </defs>
            <path d="M200 200 L60 200 L200 60 Z" fill="url(#brA)"/>
            <path d="M200 200 L110 200 L200 110 Z" fill="url(#brB)"/>
            <path d="M200 200 L150 200 L200 150 Z" fill="url(#brC)"/>
          </svg>

          {/* ── 彩带：右上小 ── */}
          <svg style={{ position: 'absolute', top: 0, right: 0, width: '110px', height: '110px' }} viewBox="0 0 110 110" xmlns="http://www.w3.org/2000/svg">
            <defs><linearGradient id="trA" x1="1" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#c084fc" stopOpacity="0.22"/><stop offset="100%" stopColor="#a855f7" stopOpacity="0"/></linearGradient></defs>
            <path d="M110 0 L110 80 L30 0 Z" fill="url(#trA)"/>
          </svg>

          {/* ── 彩带：左下小 ── */}
          <svg style={{ position: 'absolute', bottom: 0, left: 0, width: '110px', height: '110px' }} viewBox="0 0 110 110" xmlns="http://www.w3.org/2000/svg">
            <defs><linearGradient id="blA" x1="0" y1="1" x2="1" y2="0"><stop offset="0%" stopColor="#c084fc" stopOpacity="0.22"/><stop offset="100%" stopColor="#a855f7" stopOpacity="0"/></linearGradient></defs>
            <path d="M0 110 L0 30 L80 110 Z" fill="url(#blA)"/>
          </svg>

          {/* ── 外框线 ── */}
          <div style={{ position: 'absolute', top: '14px', left: '14px', right: '14px', bottom: '14px', border: '1.5px solid rgba(168,85,247,0.3)', borderRadius: '6px', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: '20px', left: '20px', right: '20px', bottom: '20px', border: '0.5px solid rgba(168,85,247,0.12)', borderRadius: '4px', pointerEvents: 'none' }} />

          {/* ── 四角花纹 ── */}
          {([
            { top: '26px', left: '26px', borderTop: '2px solid #a855f7', borderLeft: '2px solid #a855f7' },
            { top: '26px', right: '26px', borderTop: '2px solid #a855f7', borderRight: '2px solid #a855f7' },
            { bottom: '26px', left: '26px', borderBottom: '2px solid #a855f7', borderLeft: '2px solid #a855f7' },
            { bottom: '26px', right: '26px', borderBottom: '2px solid #a855f7', borderRight: '2px solid #a855f7' },
          ] as React.CSSProperties[]).map((s, i) => (
            <div key={i} style={{ position: 'absolute', width: '28px', height: '28px', ...s }} />
          ))}
          {([
            { top: '23px', left: '23px' },
            { top: '23px', right: '23px' },
            { bottom: '23px', left: '23px' },
            { bottom: '23px', right: '23px' },
          ] as React.CSSProperties[]).map((s, i) => (
            <div key={i} style={{ position: 'absolute', width: '5px', height: '5px', background: '#a855f7', borderRadius: '1px', transform: 'rotate(45deg)', ...s }} />
          ))}

          {/* ── 主内容 ── */}
          <div style={{
            position: 'relative',
            padding: '28px 80px 28px',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            height: '100%', boxSizing: 'border-box',
          }}>

            {/* ── 顶部标题区 ── */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* 来源行 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{ width: '40px', height: '1px', background: 'linear-gradient(90deg, transparent, #c084fc)' }} />
                <div style={{ fontSize: '9.5px', letterSpacing: '5px', color: '#a855f7', textTransform: 'uppercase', fontWeight: 400 }}>
                  TEG Secretary Growth Platform
                </div>
                <div style={{ width: '40px', height: '1px', background: 'linear-gradient(90deg, #c084fc, transparent)' }} />
              </div>

              {/* 主标题 */}
              <div className="cert-title" style={{ fontSize: '58px', fontWeight: 900, color: '#1a1a1a', letterSpacing: '18px', marginBottom: '4px', textShadow: '0 1px 0 rgba(168,85,247,0.12)', lineHeight: 1.2 }}>
                导师认证证书
              </div>
              <div style={{ fontSize: '11px', color: '#c4b5fd', letterSpacing: '6px', fontWeight: 300, marginBottom: '0' }}>
                MENTOR CERTIFICATION CERTIFICATE
              </div>
            </div>

            {/* ── 正文内容区：垂直居中填满剩余空间 ── */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>

              {/* 装饰分割线 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <div style={{ width: '70px', height: '1px', background: 'linear-gradient(90deg, transparent, #a855f7)' }} />
                <div style={{ width: '5px', height: '5px', background: '#a855f7', borderRadius: '50%' }} />
                <div style={{ width: '44px', height: '1.5px', background: 'linear-gradient(90deg, #a855f7, #c084fc)' }} />
                <div style={{ width: '7px', height: '7px', background: 'linear-gradient(135deg,#7c3aed,#c084fc)', borderRadius: '50%' }} />
                <div style={{ width: '44px', height: '1.5px', background: 'linear-gradient(90deg, #c084fc, #a855f7)' }} />
                <div style={{ width: '5px', height: '5px', background: '#a855f7', borderRadius: '50%' }} />
                <div style={{ width: '70px', height: '1px', background: 'linear-gradient(90deg, #a855f7, transparent)' }} />
              </div>

              {/* 兹证明 */}
              <div style={{ fontSize: '13px', color: '#888', letterSpacing: '4px', fontWeight: 300, marginBottom: '12px' }}>兹  证  明</div>

              {/* 姓名 */}
              <div style={{ marginBottom: '18px', textAlign: 'center' }}>
                <div style={{ fontSize: '44px', fontWeight: 700, color: '#1a1a1a', letterSpacing: '12px', paddingBottom: '8px' }}>
                  {name}
                </div>
                <div style={{ height: '2.5px', background: 'linear-gradient(90deg, transparent, #a855f7 25%, #7c3aed 50%, #a855f7 75%, transparent)', borderRadius: '2px' }} />
              </div>

              {/* 正文 */}
              <div style={{ fontSize: '14px', color: '#555', letterSpacing: '0.5px', lineHeight: 2, textAlign: 'center', maxWidth: '680px', marginBottom: '20px', fontWeight: 400, whiteSpace: 'nowrap' }}>
                经 TEG 秘书成长平台导师资质认证考核，正式获得 TEG 秘书中心认证导师资格
              </div>

              {/* 三项数据 */}
              <div style={{ display: 'flex', gap: '0', marginBottom: '14px', borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(168,85,247,0.18)', boxShadow: '0 2px 14px rgba(168,85,247,0.07)' }}>
                {[
                  { label: '考试得分', value: `${score} 分` },
                  { label: '认证时间', value: issuedDate },
                  { label: '有效期至', value: expiresDate },
                ].map((item, i) => (
                  <div key={i} style={{
                    textAlign: 'center',
                    padding: '14px 40px',
                    background: 'linear-gradient(135deg, #faf5ff, #f3e8ff)',
                    borderLeft: i > 0 ? '1px solid rgba(168,85,247,0.13)' : 'none',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <div style={{ fontSize: '9px', color: '#a78bfa', letterSpacing: '2.5px', marginBottom: '5px', textTransform: 'uppercase', fontWeight: 400 }}>{item.label}</div>
                    <div style={{ color: '#6d28d9', fontWeight: 700, fontSize: '14px', letterSpacing: '1px' }}>{item.value}</div>
                  </div>
                ))}
              </div>

              {/* 寄语 */}
              <div style={{ fontSize: '12px', color: '#8b5cf6', letterSpacing: '1.5px', fontWeight: 300, textAlign: 'center', marginTop: '8px', marginBottom: '0', fontStyle: 'italic' }}>
                愿你以智慧为灯、经验引路，开启属于你的育人传承之旅
              </div>

            </div>{/* 正文内容区结束 */}

            {/* 底部签发区 */}
            <div style={{
              width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
              paddingTop: '14px',
              borderTop: '1px solid rgba(168,85,247,0.12)',
            }}>
              {/* 证书编号 */}
              <div>
                <div style={{ fontSize: '8px', color: '#d8b4fe', letterSpacing: '2px', marginBottom: '4px', textTransform: 'uppercase' }}>Certificate No.</div>
                <div style={{ fontSize: '11px', color: '#a78bfa', fontFamily: 'monospace', letterSpacing: '2px' }}>{certificateNo}</div>
              </div>

              {/* 签发单位 */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                <div style={{ width: '72px', height: '1px', background: 'linear-gradient(90deg,transparent,#a855f7,transparent)', marginBottom: '3px' }} />
                <div style={{ fontSize: '17px', color: '#7c3aed', fontWeight: 700, letterSpacing: '2.5px' }}>TEG 办公室内务小组</div>
                <div style={{ fontSize: '8px', color: '#c4b5fd', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 300 }}>TEG Office Affairs Group</div>
              </div>

              {/* 印章装饰 */}
              <div style={{ position: 'relative', width: '62px', height: '62px' }}>
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1.5px solid rgba(168,85,247,0.32)' }} />
                <div style={{ position: 'absolute', inset: '5px', borderRadius: '50%', border: '1px solid rgba(168,85,247,0.18)' }} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                  <div style={{ fontSize: '8px', color: '#a855f7', fontWeight: 700, letterSpacing: '0.5px' }}>TEG</div>
                  <div style={{ width: '24px', height: '0.5px', background: 'rgba(168,85,247,0.4)' }} />
                  <div style={{ fontSize: '6px', color: '#c4b5fd', letterSpacing: '0.5px' }}>CERTIFIED</div>
                </div>
              </div>
            </div>

          </div>{/* 主内容 */}
        </div>{/* cert-shadow */}
          </div>{/* cert-scale-wrap */}
        </div>{/* height wrapper */}
      </div>{/* cert-screen-wrap */}
    </>
  )
}
