'use client'

import Link from 'next/link'

interface Props {
  name: string | null
  wxId: string
  courseTitle: string
  certificateNo: string
  issuedDate: string
  expiresDate: string
  expired: boolean
}

export function CertificatePrintView({
  name,
  wxId,
  courseTitle,
  certificateNo,
  issuedDate,
  expiresDate,
  expired,
}: Props) {
  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; margin: 0 !important; }
          .cert-page { box-shadow: none !important; }
        }
        @page {
          size: A4 landscape;
          margin: 0;
        }
      `}</style>

      {/* ── 操作栏（打印时隐藏） ── */}
      <div className="no-print max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link
          href="/dashboard/certificates"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 transition-colors"
        >
          ← 返回证书列表
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 bg-white border border-gray-200 px-3 py-1.5 rounded-full">
            证书预览 · 打印为 A4 横向
          </span>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-all"
            style={{ background: 'linear-gradient(90deg, #4f46e5, #7c3aed)' }}
          >
            🖨 下载 / 打印证书
          </button>
        </div>
      </div>

      {/* ── 证书主体：A4 横版 297×210mm ── */}
      <div className="flex justify-center px-4 pb-10">
        <div
          className="cert-page relative bg-white overflow-hidden"
          style={{
            width: '297mm',
            minHeight: '210mm',
            boxShadow: '0 8px 48px rgba(79,70,229,0.18)',
            fontFamily: '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
          }}
        >

          {/* ── 左侧深色装饰带 ── */}
          <div style={{
            position: 'absolute',
            top: 0, left: 0, bottom: 0,
            width: '72px',
            background: 'linear-gradient(180deg, #312e81 0%, #4f46e5 50%, #6d28d9 100%)',
          }} />

          {/* 左侧带上的文字（竖排） */}
          <div style={{
            position: 'absolute',
            top: '50%', left: 0,
            width: '72px',
            transform: 'translateY(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
          }}>
            <div style={{
              writingMode: 'vertical-rl',
              fontSize: '11px',
              letterSpacing: '3px',
              color: 'rgba(255,255,255,0.5)',
              textTransform: 'uppercase',
              marginBottom: '8px',
            }}>TEG Secretary Center</div>
            <div style={{
              width: '28px', height: '1px',
              background: 'rgba(255,255,255,0.3)',
            }} />
            <div style={{
              writingMode: 'vertical-rl',
              fontSize: '14px',
              letterSpacing: '4px',
              color: 'rgba(255,255,255,0.85)',
              fontWeight: '600',
            }}>课程认证</div>
          </div>

          {/* ── 顶部紫色横条 ── */}
          <div style={{
            position: 'absolute',
            top: 0, left: '72px', right: 0,
            height: '6px',
            background: 'linear-gradient(90deg, #818cf8, #a78bfa, #c4b5fd)',
          }} />

          {/* ── 右侧装饰圆圈 ── */}
          <div style={{
            position: 'absolute',
            top: '-80px', right: '-80px',
            width: '280px', height: '280px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)',
            border: '1px solid rgba(99,102,241,0.08)',
          }} />
          <div style={{
            position: 'absolute',
            bottom: '-60px', right: '40px',
            width: '180px', height: '180px',
            borderRadius: '50%',
            border: '1px solid rgba(167,139,250,0.12)',
          }} />

          {/* ── 内框线 ── */}
          <div style={{
            position: 'absolute',
            top: '16px', left: '88px', right: '16px', bottom: '16px',
            border: '1px solid rgba(99,102,241,0.18)',
            pointerEvents: 'none',
          }} />

          {/* 四角装饰 */}
          {[
            { top: '24px',   left: '96px'  },
            { top: '24px',   right: '24px' },
            { bottom: '24px',left: '96px'  },
            { bottom: '24px',right: '24px' },
          ].map((pos, i) => (
            <div key={i} style={{
              position: 'absolute', ...pos,
              width: '20px', height: '20px',
              borderTop:    i < 2   ? '2px solid rgba(99,102,241,0.4)' : undefined,
              borderBottom: i >= 2  ? '2px solid rgba(99,102,241,0.4)' : undefined,
              borderLeft:   i % 2 === 0 ? '2px solid rgba(99,102,241,0.4)' : undefined,
              borderRight:  i % 2 === 1 ? '2px solid rgba(99,102,241,0.4)' : undefined,
            }} />
          ))}

          {/* ── 正文内容 ── */}
          <div style={{
            position: 'relative',
            marginLeft: '72px',
            padding: '40px 60px 36px 48px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minHeight: '210mm',
            boxSizing: 'border-box',
          }}>

            {/* 机构名 */}
            <div style={{
              fontSize: '11px',
              letterSpacing: '5px',
              color: '#6366f1',
              textTransform: 'uppercase',
              marginBottom: '8px',
              fontWeight: '500',
            }}>
              TEG SECRETARY CENTER · 秘书中心
            </div>

            {/* 主标题 */}
            <div style={{
              fontSize: '30px',
              fontWeight: '700',
              color: '#1e1b4b',
              letterSpacing: '10px',
              marginBottom: '4px',
            }}>
              课 程 完 成 证 书
            </div>

            {/* 英文副标题 */}
            <div style={{
              fontSize: '10px',
              color: '#a5b4fc',
              letterSpacing: '4px',
              marginBottom: '24px',
            }}>
              COURSE COMPLETION CERTIFICATE
            </div>

            {/* 分割线 */}
            <div style={{
              width: '100%',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, #818cf8, #a78bfa, transparent)',
              marginBottom: '24px',
            }} />

            {/* 授予语 */}
            <div style={{
              fontSize: '14px',
              color: '#6b7280',
              letterSpacing: '1px',
              marginBottom: '12px',
            }}>
              兹证明
            </div>

            {/* 姓名 */}
            <div style={{
              fontSize: '34px',
              fontWeight: '700',
              color: '#1e1b4b',
              letterSpacing: '8px',
              marginBottom: '4px',
              borderBottom: '2px solid #818cf8',
              paddingBottom: '8px',
              minWidth: '160px',
              textAlign: 'center',
            }}>
              {name}
            </div>

            {/* 企业微信 ID */}
            <div style={{
              fontSize: '12px',
              color: '#9ca3af',
              letterSpacing: '1px',
              marginBottom: '18px',
              fontFamily: 'monospace',
            }}>
              企业微信 ID：{wxId}
            </div>

            {/* 正文 */}
            <div style={{
              fontSize: '14px',
              color: '#4b5563',
              letterSpacing: '1px',
              lineHeight: '2.2',
              textAlign: 'center',
              maxWidth: '480px',
              marginBottom: '24px',
            }}>
              已完成
              <span style={{ color: '#4f46e5', fontWeight: '600', margin: '0 6px' }}>
                「{courseTitle}」
              </span>
              全部课程学习与考核，
              <br />
              特颁发此证书，以资证明。
              <br />
              <span style={{ fontSize: '13px', color: '#9ca3af' }}>
                愿学有所成，以智慧回馈同行。
              </span>
            </div>

            {/* 认证数据行 */}
            <div style={{
              display: 'flex',
              gap: '0',
              marginBottom: '28px',
              background: 'linear-gradient(135deg, #eef2ff, #f5f3ff)',
              borderRadius: '12px',
              overflow: 'hidden',
              border: '1px solid rgba(99,102,241,0.15)',
            }}>
              {[
                { label: '认证日期', value: issuedDate, icon: '📅' },
                { label: '有效期至', value: expiresDate, icon: expired ? '⚠️' : '✅', warn: expired },
              ].map((item, i) => (
                <div key={i} style={{
                  padding: '12px 28px',
                  textAlign: 'center',
                  borderRight: i === 0 ? '1px solid rgba(99,102,241,0.15)' : undefined,
                }}>
                  <div style={{ fontSize: '10px', color: '#a5b4fc', letterSpacing: '2px', marginBottom: '4px' }}>
                    {item.icon} {item.label}
                  </div>
                  <div style={{ fontSize: '14px', color: item.warn ? '#ef4444' : '#312e81', fontWeight: '600' }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>

            {/* 底部：证书编号 + 落款 */}
            <div style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginTop: 'auto',
              paddingTop: '12px',
              borderTop: '1px solid rgba(99,102,241,0.15)',
            }}>
              <div>
                <div style={{ fontSize: '9px', color: '#d1d5db', letterSpacing: '2px', marginBottom: '3px', textTransform: 'uppercase' }}>
                  Certificate No.
                </div>
                <div style={{ fontSize: '11px', color: '#6366f1', fontFamily: 'monospace', letterSpacing: '1.5px' }}>
                  {certificateNo}
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '10px', color: '#d1d5db', marginBottom: '4px' }}>
                  让每一段成长，都有迹可循
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '15px', color: '#4f46e5', fontWeight: '700', letterSpacing: '2px' }}>
                  TEG办公室内务小组
                </div>
                <div style={{ fontSize: '9px', color: '#c7d2fe', letterSpacing: '1px', marginTop: '3px', textTransform: 'uppercase' }}>
                  TEG Office Affairs Group
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
