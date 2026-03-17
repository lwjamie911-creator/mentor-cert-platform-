'use client'

import Link from 'next/link'

interface Props {
  name: string
  wxId: string
  certificateNo: string
  score: number
  issuedDate: string
  expiresDate: string
}

export function MentorCertPrintView({ name, wxId, certificateNo, score, issuedDate, expiresDate }: Props) {
  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .cert-screen-wrap { padding: 0 !important; background: none !important; }
          .cert-shadow { box-shadow: none !important; }
          body { background: white !important; }
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

      {/* 屏幕预览包装 */}
      <div className="no-print text-center mb-4">
        <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">证书预览 · 实际打印为 A4 横向</span>
      </div>

      <div className="cert-screen-wrap px-4 pb-10 overflow-x-auto">
        {/* 证书主体 */}
        <div className="cert-shadow mx-auto relative bg-white overflow-hidden"
          style={{
            width: '297mm',
            minHeight: '210mm',
            boxShadow: '0 8px 48px rgba(124,58,237,0.15), 0 2px 8px rgba(0,0,0,0.08)',
            fontFamily: '"PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif',
          }}>

          {/* 顶底色条 */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '10px', background: 'linear-gradient(90deg, #7c3aed, #a855f7, #7c3aed)' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '10px', background: 'linear-gradient(90deg, #7c3aed, #a855f7, #7c3aed)' }} />
          <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '8px', background: 'linear-gradient(180deg, #7c3aed, #a855f7, #7c3aed)' }} />
          <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '8px', background: 'linear-gradient(180deg, #7c3aed, #a855f7, #7c3aed)' }} />

          {/* 内框线 */}
          <div style={{ position: 'absolute', top: '20px', left: '20px', right: '20px', bottom: '20px', border: '1.5px solid #ddd6fe', borderRadius: '4px', pointerEvents: 'none' }} />

          {/* 四角装饰 */}
          {[
            { top: '30px', left: '30px', borderTop: '2.5px solid #a855f7', borderLeft: '2.5px solid #a855f7' },
            { top: '30px', right: '30px', borderTop: '2.5px solid #a855f7', borderRight: '2.5px solid #a855f7' },
            { bottom: '30px', left: '30px', borderBottom: '2.5px solid #a855f7', borderLeft: '2.5px solid #a855f7' },
            { bottom: '30px', right: '30px', borderBottom: '2.5px solid #a855f7', borderRight: '2.5px solid #a855f7' },
          ].map((s, i) => (
            <div key={i} style={{ position: 'absolute', width: '32px', height: '32px', ...s }} />
          ))}

          {/* 背景大圆水印 */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '360px', height: '360px', borderRadius: '50%', border: '1px solid rgba(168,85,247,0.08)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '240px', height: '240px', borderRadius: '50%', border: '1px solid rgba(168,85,247,0.06)', pointerEvents: 'none' }} />

          {/* 正文内容 */}
          <div style={{ position: 'relative', padding: '40px 72px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '210mm', boxSizing: 'border-box' }}>

            <div style={{ fontSize: '11px', letterSpacing: '6px', color: '#a855f7', marginBottom: '4px', textTransform: 'uppercase' }}>
              TEG Secretary Growth Platform
            </div>

            <div style={{ fontSize: '34px', fontWeight: 800, color: '#1a1a1a', letterSpacing: '10px', marginBottom: '4px' }}>
              导 师 认 证 证 书
            </div>

            <div style={{ fontSize: '11px', color: '#c4b5fd', letterSpacing: '4px', marginBottom: '24px' }}>
              MENTOR CERTIFICATION CERTIFICATE
            </div>

            <div style={{ width: '120px', height: '2px', background: 'linear-gradient(90deg, transparent, #a855f7, transparent)', marginBottom: '24px' }} />

            <div style={{ fontSize: '14px', color: '#666', letterSpacing: '2px', marginBottom: '12px' }}>兹证明</div>

            <div style={{ fontSize: '38px', fontWeight: 700, color: '#1a1a1a', letterSpacing: '8px', marginBottom: '4px', paddingBottom: '8px', borderBottom: '2px solid #a855f7', minWidth: '180px', textAlign: 'center' }}>
              {name}
            </div>

            <div style={{ fontSize: '12px', color: '#999', letterSpacing: '2px', marginBottom: '18px' }}>
              企业微信 ID：{wxId}
            </div>

            <div style={{ fontSize: '14px', color: '#555', letterSpacing: '1px', lineHeight: 2, textAlign: 'center', maxWidth: '520px', marginBottom: '24px' }}>
              已通过 TEG 秘书成长平台导师资质认证考核，正式获得 TEG 秘书中心认证导师资格。
              <br />
              <span style={{ color: '#7c3aed' }}>愿你以智慧为灯、经验引路，开启属于你的育人传承之旅。</span>
            </div>

            {/* 三项数据 */}
            <div style={{ display: 'flex', gap: '48px', padding: '16px 32px', background: 'linear-gradient(135deg, #faf5ff, #f3e8ff)', borderRadius: '12px', marginBottom: '24px' }}>
              {[
                { label: '考试得分', value: `${score} 分` },
                { label: '认证时间', value: issuedDate },
                { label: '有效期至', value: expiresDate },
              ].map((item, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: '#c4b5fd', letterSpacing: '2px', marginBottom: '4px' }}>{item.label}</div>
                  <div style={{ fontSize: '14px', color: '#6d28d9', fontWeight: 600 }}>{item.value}</div>
                </div>
              ))}
            </div>

            {/* 底部签发区 */}
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid rgba(168,85,247,0.15)' }}>
              <div>
                <div style={{ fontSize: '9px', color: '#ccc', letterSpacing: '1px', marginBottom: '3px' }}>CERTIFICATE NO.</div>
                <div style={{ fontSize: '11px', color: '#bbb', fontFamily: 'monospace', letterSpacing: '1.5px' }}>{certificateNo}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '18px', color: '#7c3aed', fontWeight: 700, letterSpacing: '3px' }}>TEG办公室内务小组</div>
                <div style={{ fontSize: '9px', color: '#c4b5fd', letterSpacing: '2px', marginTop: '2px' }}>TEG OFFICE AFFAIRS GROUP</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
