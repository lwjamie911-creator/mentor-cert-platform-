'use client'

import Link from 'next/link'

interface Props {
  name: string
  wxId: string
  badgeNo: string
  issuedAt: string
}

export function NewbieBadgePrintView({ name, wxId, badgeNo, issuedAt }: Props) {
  const date = new Date(issuedAt)
  const dateStr = `${date.getFullYear()} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日`

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .badge-screen-wrap { padding: 0 !important; background: none !important; }
          .badge-shadow { box-shadow: none !important; }
          body { background: white !important; }
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
          style={{ background: 'linear-gradient(90deg, #3b82f6, #6366f1)' }}
        >
          下载 / 打印勋章
        </button>
      </div>

      <div className="no-print text-center mb-4">
        <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">勋章预览 · 实际打印为 A4 横向</span>
      </div>

      {/* 勋章主体 */}
      <div className="badge-screen-wrap px-4 pb-10 overflow-x-auto">
        <div className="badge-shadow mx-auto relative overflow-hidden"
          style={{
            width: '297mm',
            minHeight: '210mm',
            background: 'linear-gradient(135deg, #eff6ff 0%, #e0e7ff 50%, #dbeafe 100%)',
            boxShadow: '0 8px 48px rgba(59,130,246,0.15), 0 2px 8px rgba(0,0,0,0.08)',
            fontFamily: '"PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}>

          {/* 背景装饰圆 */}
          <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '280px', height: '280px', borderRadius: '50%', background: 'rgba(99,102,241,0.06)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '-40px', left: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(59,130,246,0.06)', pointerEvents: 'none' }} />

          {/* 双层边框 */}
          <div style={{ position: 'absolute', inset: '14mm', border: '3px solid #3b82f6', borderRadius: '10mm', opacity: 0.5, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', inset: '17mm', border: '1px solid #93c5fd', borderRadius: '8mm', opacity: 0.6, pointerEvents: 'none' }} />

          {/* 四角花纹 */}
          {[
            { top: '22mm', left: '22mm', borderTop: '3px solid #3b82f6', borderLeft: '3px solid #3b82f6' },
            { top: '22mm', right: '22mm', borderTop: '3px solid #3b82f6', borderRight: '3px solid #3b82f6' },
            { bottom: '22mm', left: '22mm', borderBottom: '3px solid #3b82f6', borderLeft: '3px solid #3b82f6' },
            { bottom: '22mm', right: '22mm', borderBottom: '3px solid #3b82f6', borderRight: '3px solid #3b82f6' },
          ].map((s, i) => (
            <div key={i} style={{ position: 'absolute', width: '24px', height: '24px', borderRadius: '2px', ...s }} />
          ))}

          {/* 正文 */}
          <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 80px' }}>

            <div style={{ fontSize: '56px', marginBottom: '8mm', filter: 'drop-shadow(0 4px 8px rgba(59,130,246,0.3))' }}>🌱</div>

            <div style={{ fontSize: '30pt', fontWeight: 800, color: '#1d4ed8', letterSpacing: '8px', marginBottom: '4mm' }}>
              新 人 成 长 勋 章
            </div>

            <div style={{ fontSize: '11pt', color: '#6366f1', letterSpacing: '4px', marginBottom: '8mm' }}>
              TEG SECRETARY GROWTH PLATFORM
            </div>

            <div style={{ width: '100px', height: '2px', background: 'linear-gradient(90deg, transparent, #3b82f6, transparent)', margin: '0 auto 8mm' }} />

            <div style={{ fontSize: '20pt', fontWeight: 700, color: '#1e3a5f', letterSpacing: '4px', marginBottom: '3mm' }}>{name}</div>
            <div style={{ fontSize: '11pt', color: '#3b82f6', letterSpacing: '2px', marginBottom: '6mm' }}>企业微信 ID：{wxId}</div>

            <div style={{ fontSize: '12pt', color: '#334155', lineHeight: 1.9, maxWidth: '200mm', margin: '0 auto' }}>
              恭喜你顺利完成入职三个月成长考核，完成了 A / B / C 三项成长指标并通过知识测试。
              <br />
              <span style={{ color: '#4f46e5', fontWeight: 600 }}>愿你在 TEG 的每一步都走得扎实、走得出彩！</span>
            </div>
          </div>

          {/* 底部签发区 */}
          <div style={{ position: 'absolute', bottom: '22mm', left: '28mm', right: '28mm', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div style={{ fontSize: '9pt', color: '#93c5fd', fontFamily: 'monospace', letterSpacing: '1px' }}>BADGE NO.</div>
              <div style={{ fontSize: '10pt', color: '#64748b', fontFamily: 'monospace', letterSpacing: '1.5px', marginTop: '2px' }}>{badgeNo}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '14pt', color: '#1d4ed8', fontWeight: 700, letterSpacing: '3px' }}>TEG办公室内务小组</div>
              <div style={{ fontSize: '10pt', color: '#3b82f6', marginTop: '2px' }}>{dateStr}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
