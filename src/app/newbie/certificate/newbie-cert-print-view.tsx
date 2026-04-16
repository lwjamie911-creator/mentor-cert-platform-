'use client'

import Link from 'next/link'
import { type CSSProperties, useEffect, useRef, useState } from 'react'

interface Props {
  name: string
  certificateNo: string
  score: number
  issuedDate: string
}

export function NewbieCertPrintView({ name, certificateNo, score, issuedDate }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  // A4 横向实际尺寸（mm → px，96dpi）
  const CERT_W = 1122 // 297mm
  const CERT_H = 794  // 210mm

  useEffect(() => {
    function calcScale() {
      if (!wrapRef.current) return
      const available = wrapRef.current.clientWidth - 48
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
        .newbie-cert-title {
          font-family: 'Noto Serif SC', 'SimSun', 'STSong', serif !important;
        }
        @media print {
          header, footer, nav, .no-print { display: none !important; }

          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            overflow: hidden !important;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .newbie-cert-screen-wrap {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 297mm !important;
            height: 210mm !important;
            padding: 0 !important;
            margin: 0 !important;
            background: none !important;
          }

          .newbie-cert-scale-wrap {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            transform: none !important;
            width: 297mm !important;
            height: 210mm !important;
          }

          .newbie-cert-shadow { box-shadow: none !important; }
        }
        @page { size: A4 landscape; margin: 0; }
      `}</style>

      {/* 屏幕工具栏 */}
      <div className="no-print max-w-5xl mx-auto px-4 py-5 flex items-center justify-between">
        <Link href="/newbie" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors">
          ← 返回新人专区
        </Link>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(90deg, #3b82f6, #06b6d4)' }}
        >
          下载 / 打印证书
        </button>
      </div>

      <div className="no-print text-center mb-4">
        <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">证书预览 · 实际打印为 A4 横向</span>
      </div>

      {/* 自适应缩放容器 */}
      <div ref={wrapRef} className="newbie-cert-screen-wrap px-6 pb-10">
        <div style={{ width: '100%', height: `${CERT_H * scale}px`, display: 'flex', justifyContent: 'center' }}>
          <div
            className="newbie-cert-scale-wrap"
            style={{
              transformOrigin: 'top left',
              transform: `scale(${scale})`,
              width: `${CERT_W}px`,
              height: `${CERT_H}px`,
              flexShrink: 0,
            }}
          >
            <div className="newbie-cert-shadow relative overflow-hidden"
              style={{
                width: '100%',
                height: '100%',
                boxShadow: '0 12px 60px rgba(59,130,246,0.18), 0 2px 12px rgba(0,0,0,0.1)',
                fontFamily: '"PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif',
                background: '#fff',
              }}>

              {/* ── 背景渐变底色 ── */}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 40%, #cffafe 70%, #ecfdf5 100%)' }} />

              {/* ── 斜纹纹理 ── */}
              <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.025 }} xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="newbie-diag" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                    <line x1="0" y1="0" x2="0" y2="12" stroke="#0ea5e9" strokeWidth="1.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#newbie-diag)" />
              </svg>

              {/* ── 光晕装饰 ── */}
              <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '340px', height: '340px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.10) 0%, transparent 70%)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '280px', height: '280px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '440px', height: '440px', borderRadius: '50%', border: '1px solid rgba(6,182,212,0.06)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '290px', height: '290px', borderRadius: '50%', border: '1px solid rgba(6,182,212,0.04)', pointerEvents: 'none' }} />

              {/* ── 彩带：左上 ── */}
              <svg style={{ position: 'absolute', top: 0, left: 0, width: '200px', height: '200px' }} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="nb-tlA" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.28"/><stop offset="100%" stopColor="#06b6d4" stopOpacity="0"/></linearGradient>
                  <linearGradient id="nb-tlB" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#38bdf8" stopOpacity="0.22"/><stop offset="100%" stopColor="#0ea5e9" stopOpacity="0"/></linearGradient>
                  <linearGradient id="nb-tlC" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#bae6fd" stopOpacity="0.35"/><stop offset="100%" stopColor="#38bdf8" stopOpacity="0"/></linearGradient>
                </defs>
                <path d="M0 0 L140 0 L0 140 Z" fill="url(#nb-tlA)"/>
                <path d="M0 0 L90 0 L0 90 Z" fill="url(#nb-tlB)"/>
                <path d="M0 0 L50 0 L0 50 Z" fill="url(#nb-tlC)"/>
              </svg>

              {/* ── 彩带：右下 ── */}
              <svg style={{ position: 'absolute', bottom: 0, right: 0, width: '200px', height: '200px' }} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="nb-brA" x1="1" y1="1" x2="0" y2="0"><stop offset="0%" stopColor="#10b981" stopOpacity="0.28"/><stop offset="100%" stopColor="#059669" stopOpacity="0"/></linearGradient>
                  <linearGradient id="nb-brB" x1="1" y1="1" x2="0" y2="0"><stop offset="0%" stopColor="#34d399" stopOpacity="0.22"/><stop offset="100%" stopColor="#10b981" stopOpacity="0"/></linearGradient>
                  <linearGradient id="nb-brC" x1="1" y1="1" x2="0" y2="0"><stop offset="0%" stopColor="#a7f3d0" stopOpacity="0.35"/><stop offset="100%" stopColor="#34d399" stopOpacity="0"/></linearGradient>
                </defs>
                <path d="M200 200 L60 200 L200 60 Z" fill="url(#nb-brA)"/>
                <path d="M200 200 L110 200 L200 110 Z" fill="url(#nb-brB)"/>
                <path d="M200 200 L150 200 L200 150 Z" fill="url(#nb-brC)"/>
              </svg>

              {/* ── 彩带：右上小 ── */}
              <svg style={{ position: 'absolute', top: 0, right: 0, width: '110px', height: '110px' }} viewBox="0 0 110 110" xmlns="http://www.w3.org/2000/svg">
                <defs><linearGradient id="nb-trA" x1="1" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#38bdf8" stopOpacity="0.22"/><stop offset="100%" stopColor="#0ea5e9" stopOpacity="0"/></linearGradient></defs>
                <path d="M110 0 L110 80 L30 0 Z" fill="url(#nb-trA)"/>
              </svg>

              {/* ── 彩带：左下小 ── */}
              <svg style={{ position: 'absolute', bottom: 0, left: 0, width: '110px', height: '110px' }} viewBox="0 0 110 110" xmlns="http://www.w3.org/2000/svg">
                <defs><linearGradient id="nb-blA" x1="0" y1="1" x2="1" y2="0"><stop offset="0%" stopColor="#34d399" stopOpacity="0.22"/><stop offset="100%" stopColor="#10b981" stopOpacity="0"/></linearGradient></defs>
                <path d="M0 110 L0 30 L80 110 Z" fill="url(#nb-blA)"/>
              </svg>

              {/* ── 外框线 ── */}
              <div style={{ position: 'absolute', top: '14px', left: '14px', right: '14px', bottom: '14px', border: '1.5px solid rgba(6,182,212,0.3)', borderRadius: '6px', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', top: '20px', left: '20px', right: '20px', bottom: '20px', border: '0.5px solid rgba(6,182,212,0.12)', borderRadius: '4px', pointerEvents: 'none' }} />

              {/* ── 四角花纹 ── */}
              {([
                { top: '26px', left: '26px', borderTop: '2px solid #0ea5e9', borderLeft: '2px solid #0ea5e9' },
                { top: '26px', right: '26px', borderTop: '2px solid #0ea5e9', borderRight: '2px solid #0ea5e9' },
                { bottom: '26px', left: '26px', borderBottom: '2px solid #0ea5e9', borderLeft: '2px solid #0ea5e9' },
                { bottom: '26px', right: '26px', borderBottom: '2px solid #0ea5e9', borderRight: '2px solid #0ea5e9' },
              ] as CSSProperties[]).map((s, i) => (
                <div key={i} style={{ position: 'absolute', width: '28px', height: '28px', ...s }} />
              ))}
              {([
                { top: '23px', left: '23px' },
                { top: '23px', right: '23px' },
                { bottom: '23px', left: '23px' },
                { bottom: '23px', right: '23px' },
              ] as CSSProperties[]).map((s, i) => (
                <div key={i} style={{ position: 'absolute', width: '5px', height: '5px', background: '#0ea5e9', borderRadius: '1px', transform: 'rotate(45deg)', ...s }} />
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <div style={{ width: '40px', height: '1px', background: 'linear-gradient(90deg, transparent, #38bdf8)' }} />
                    <div style={{ fontSize: '9.5px', letterSpacing: '5px', color: '#0ea5e9', textTransform: 'uppercase', fontWeight: 400 }}>
                      TEG Secretary Growth Platform
                    </div>
                    <div style={{ width: '40px', height: '1px', background: 'linear-gradient(90deg, #38bdf8, transparent)' }} />
                  </div>

                  <div className="newbie-cert-title" style={{ fontSize: '54px', fontWeight: 900, color: '#1a1a1a', letterSpacing: '18px', marginBottom: '4px', textShadow: '0 1px 0 rgba(6,182,212,0.12)', lineHeight: 1.2 }}>
                    新人成长课程结业证书
                  </div>
                  <div style={{ fontSize: '11px', color: '#7dd3fc', letterSpacing: '6px', fontWeight: 300, marginBottom: '0' }}>
                    NEWBIE GROWTH COURSE COMPLETION CERTIFICATE
                  </div>
                </div>

                {/* ── 正文内容区 ── */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>

                  {/* 装饰分割线 */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <div style={{ width: '70px', height: '1px', background: 'linear-gradient(90deg, transparent, #0ea5e9)' }} />
                    <div style={{ width: '5px', height: '5px', background: '#0ea5e9', borderRadius: '50%' }} />
                    <div style={{ width: '44px', height: '1.5px', background: 'linear-gradient(90deg, #0ea5e9, #06b6d4)' }} />
                    <div style={{ width: '7px', height: '7px', background: 'linear-gradient(135deg,#0284c7,#06b6d4)', borderRadius: '50%' }} />
                    <div style={{ width: '44px', height: '1.5px', background: 'linear-gradient(90deg, #06b6d4, #10b981)' }} />
                    <div style={{ width: '5px', height: '5px', background: '#10b981', borderRadius: '50%' }} />
                    <div style={{ width: '70px', height: '1px', background: 'linear-gradient(90deg, #10b981, transparent)' }} />
                  </div>

                  {/* 兹证明 */}
                  <div style={{ fontSize: '13px', color: '#888', letterSpacing: '4px', fontWeight: 300, marginBottom: '12px' }}>兹  证  明</div>

                  {/* 姓名 */}
                  <div style={{ marginBottom: '18px', textAlign: 'center' }}>
                    <div style={{ fontSize: '44px', fontWeight: 700, color: '#1a1a1a', letterSpacing: '12px', paddingBottom: '8px' }}>
                      {name}
                    </div>
                    <div style={{ height: '2.5px', background: 'linear-gradient(90deg, transparent, #0ea5e9 25%, #06b6d4 50%, #10b981 75%, transparent)', borderRadius: '2px' }} />
                  </div>

                  {/* 正文 */}
                  <div style={{ fontSize: '14px', color: '#555', letterSpacing: '0.5px', lineHeight: 2, textAlign: 'center', maxWidth: '680px', marginBottom: '20px', fontWeight: 400, whiteSpace: 'nowrap' }}>
                    已完成 TEG 秘书成长平台新人必修课程学习，并通过新人知识测试
                  </div>

                  {/* 数据展示 */}
                  <div style={{ display: 'flex', gap: '0', marginBottom: '14px', borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(6,182,212,0.18)', boxShadow: '0 2px 14px rgba(6,182,212,0.07)' }}>
                    {[
                      { label: '测试得分', value: `${score} 分` },
                      { label: '完成时间', value: issuedDate },
                    ].map((item, i) => (
                      <div key={i} style={{
                        textAlign: 'center',
                        padding: '14px 56px',
                        background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
                        borderLeft: i > 0 ? '1px solid rgba(6,182,212,0.13)' : 'none',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <div style={{ fontSize: '9px', color: '#38bdf8', letterSpacing: '2.5px', marginBottom: '5px', textTransform: 'uppercase', fontWeight: 400 }}>{item.label}</div>
                        <div style={{ color: '#0369a1', fontWeight: 700, fontSize: '14px', letterSpacing: '1px' }}>{item.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* 寄语 */}
                  <div style={{ fontSize: '12px', color: '#0ea5e9', letterSpacing: '1.5px', fontWeight: 300, textAlign: 'center', marginTop: '8px', fontStyle: 'italic' }}>
                    愿你在 TEG 的每一步都走得扎实、走得出彩
                  </div>

                </div>

                {/* 底部签发区 */}
                <div style={{
                  width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
                  paddingTop: '14px',
                  borderTop: '1px solid rgba(6,182,212,0.12)',
                }}>
                  {/* 证书编号 */}
                  <div>
                    <div style={{ fontSize: '8px', color: '#7dd3fc', letterSpacing: '2px', marginBottom: '4px', textTransform: 'uppercase' }}>Certificate No.</div>
                    <div style={{ fontSize: '11px', color: '#38bdf8', fontFamily: 'monospace', letterSpacing: '2px' }}>{certificateNo}</div>
                  </div>

                  {/* 签发单位 */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                    <div style={{ width: '72px', height: '1px', background: 'linear-gradient(90deg,transparent,#0ea5e9,transparent)', marginBottom: '3px' }} />
                    <div style={{ fontSize: '17px', color: '#0369a1', fontWeight: 700, letterSpacing: '2.5px' }}>TEG 办公室内务小组</div>
                    <div style={{ fontSize: '8px', color: '#7dd3fc', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 300 }}>TEG Office Affairs Group</div>
                  </div>

                  {/* 印章装饰 */}
                  <div style={{ position: 'relative', width: '62px', height: '62px' }}>
                    <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1.5px solid rgba(6,182,212,0.32)' }} />
                    <div style={{ position: 'absolute', inset: '5px', borderRadius: '50%', border: '1px solid rgba(6,182,212,0.18)' }} />
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                      <div style={{ fontSize: '8px', color: '#0ea5e9', fontWeight: 700, letterSpacing: '0.5px' }}>TEG</div>
                      <div style={{ width: '24px', height: '0.5px', background: 'rgba(6,182,212,0.4)' }} />
                      <div style={{ fontSize: '6px', color: '#7dd3fc', letterSpacing: '0.5px' }}>NEWBIE</div>
                    </div>
                  </div>
                </div>

              </div>{/* 主内容 */}
            </div>{/* newbie-cert-shadow */}
          </div>{/* newbie-cert-scale-wrap */}
        </div>{/* height wrapper */}
      </div>{/* newbie-cert-screen-wrap */}
    </>
  )
}
