'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Battery, BatteryMedium, Zap, Check } from 'lucide-react'

const CHECK_CONFIG = [
  {
    key: 'A' as const,
    label: '指标 A',
    desc: '（内容待补充，示意：完成入职引导任务）',
    color: { bar: '#c05e6d', glow: '#f8d3d7', bg: 'bg-petal-600' },
  },
  {
    key: 'B' as const,
    label: '指标 B',
    desc: '（内容待补充，示意：完成与导师首次深度沟通）',
    color: { bar: '#d97706', glow: '#fde68a', bg: 'bg-amber-500' },
  },
  {
    key: 'C' as const,
    label: '指标 C',
    desc: '（内容待补充，示意：完成第一个月工作复盘）',
    color: { bar: '#d67d8a', glow: '#fbe1d1', bg: 'bg-petal-500' },
  },
]

interface Props {
  userId: string
  checklist: any
}

export function NewbieChecklistPanel({ userId, checklist }: Props) {
  const router = useRouter()
  const [confirming, setConfirming] = useState<string | null>(null)
  const [justCharged, setJustCharged] = useState<string | null>(null)

  async function selfConfirm(key: string) {
    setConfirming(key)
    await fetch('/api/newbie/self-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checkKey: key }),
    })
    setJustCharged(key)
    setTimeout(() => {
      setJustCharged(null)
      setConfirming(null)
      router.refresh()
    }, 900)
  }

  // 总充能进度：每项最多2格（自确认1格 + 导师确认1格），共6格
  const totalCharge = CHECK_CONFIG.reduce((acc, { key }) => {
    const self = checklist[`check${key}_self`]
    const mentor = checklist[`check${key}_mentor`]
    return acc + (self ? 1 : 0) + (mentor ? 1 : 0)
  }, 0)
  const allDone = totalCharge === 6

  return (
    <div className="space-y-2">
      <p className="text-sm text-cocoa-500 mb-4">完成每项指标需要：① 你确认完成 → ② 导师确认通过</p>

      {/* 总能量槽 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-cocoa-500">成长能量槽</span>
          <span className="text-xs font-mono text-cocoa-400">{totalCharge} / 6</span>
        </div>
        <div className="h-4 rounded-full bg-petal-100 overflow-hidden border border-petal-200 relative">
          {/* 充能分格线 */}
          {[1,2,3,4,5].map(i => (
            <div key={i} className="absolute top-0 bottom-0 w-px bg-paper/60 z-10" style={{ left: `${(i/6)*100}%` }} />
          ))}
          {/* 能量条 */}
          <div
            className="h-full rounded-full transition-all duration-700 ease-out relative"
            style={{
              width: `${(totalCharge / 6) * 100}%`,
              background: allDone
                ? 'linear-gradient(90deg, #059669, #10b981, #34d399)'
                : 'linear-gradient(90deg, #c05e6d, #e59aa4)',
              boxShadow: totalCharge > 0 ? (allDone ? '0 0 8px rgba(16,185,129,0.4)' : '0 0 8px rgba(192,94,109,0.4)') : 'none',
            }}
          >
            {/* 流光扫描效果 */}
            {totalCharge > 0 && totalCharge < 6 && (
              <div className="absolute inset-0 overflow-hidden rounded-full">
                <div className="absolute inset-0 animate-shimmer" style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%)',
                  backgroundSize: '200% 100%',
                }} />
              </div>
            )}
          </div>
        </div>
        {allDone && (
          <p className="text-xs text-center text-emerald-700 font-medium mt-1.5 animate-pulse flex items-center justify-center gap-1">
            <Zap className="w-3.5 h-3.5" strokeWidth={2} /> 成长能量已充满，知识测试已解锁！
          </p>
        )}
      </div>

      {/* 三项指标 */}
      <div className="space-y-3">
        {CHECK_CONFIG.map(({ key, label, desc, color }) => {
          const selfDone = checklist[`check${key}_self`]
          const mentorDone = checklist[`check${key}_mentor`]
          const fullyDone = selfDone && mentorDone
          const isCharging = justCharged === key

          // 当前项充能进度 0/2 1/2 2/2
          const itemCharge = (selfDone ? 1 : 0) + (mentorDone ? 1 : 0)

          return (
            <div key={key} className={`rounded-2xl border p-4 transition-all duration-300 ${
              fullyDone ? 'border-emerald-200 bg-emerald-50/50' :
              selfDone ? 'border-petal-200 bg-petal-50/60' :
              'border-line bg-paper'
            }`}>
              <div className="flex items-center gap-3 mb-2.5">
                {/* 充能图标 */}
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                  fullyDone ? 'bg-emerald-600 text-white' : selfDone ? 'bg-petal-200 text-petal-700' : 'bg-petal-100 text-petal-400'
                } ${isCharging ? 'scale-125' : 'scale-100'}`}>
                  {fullyDone
                    ? <Zap className="w-4 h-4" strokeWidth={2} />
                    : selfDone
                      ? <BatteryMedium className="w-4 h-4" strokeWidth={2} />
                      : <Battery className="w-4 h-4" strokeWidth={2} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-cocoa-900">{label}</p>
                  <p className="text-xs text-cocoa-400 truncate">{desc}</p>
                </div>
                {/* 格子进度 */}
                <div className="flex gap-1 flex-shrink-0">
                  {[0, 1].map(i => (
                    <div key={i} className={`w-4 h-4 rounded border-2 transition-all duration-500 ${
                      itemCharge > i
                        ? `border-transparent ${color.bg} ${isCharging && i === 0 ? 'animate-charge-cell' : ''}`
                        : 'border-petal-200 bg-petal-50'
                    }`} />
                  ))}
                </div>
              </div>

              {/* 小进度条 */}
              <div className="h-1.5 rounded-full bg-petal-100 overflow-hidden mb-2.5">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${(itemCharge / 2) * 100}%`,
                    background: color.bar,
                    boxShadow: itemCharge > 0 ? `0 0 6px ${color.glow}` : 'none',
                  }}
                />
              </div>

              {/* 状态行 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${selfDone ? 'bg-petal-200 text-petal-800' : 'bg-petal-50 text-cocoa-400'}`}>
                    我 {selfDone ? <Check className="w-3 h-3" strokeWidth={2.5} /> : '—'}
                  </span>
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${mentorDone ? 'bg-emerald-600 text-white' : selfDone ? 'bg-blush/70 text-sienna' : 'bg-petal-50 text-cocoa-400'}`}>
                    导师 {mentorDone ? <Check className="w-3 h-3" strokeWidth={2.5} /> : selfDone ? '待确认' : '—'}
                  </span>
                </div>
                {!selfDone && (
                  <button
                    onClick={() => selfConfirm(key)}
                    disabled={confirming === key}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-petal-700 hover:bg-petal-800 disabled:opacity-60 text-paper rounded-lg text-xs font-medium transition-all active:scale-95"
                  >
                    {confirming === key ? '充能中...' : <>确认完成 <Zap className="w-3 h-3" strokeWidth={2} /></>}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <style>{`
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-shimmer {
          animation: shimmer 2s linear infinite;
          background-size: 200% 100%;
        }
        @keyframes charge-cell {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.4); box-shadow: 0 0 8px currentColor; }
          100% { transform: scale(1); }
        }
        .animate-charge-cell {
          animation: charge-cell 0.5s ease-out;
        }
      `}</style>
    </div>
  )
}
