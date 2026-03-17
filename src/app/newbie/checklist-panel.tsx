'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const CHECK_CONFIG = [
  {
    key: 'A' as const,
    label: '指标 A',
    desc: '（内容待补充，示意：完成入职引导任务）',
    color: { bar: '#3b82f6', glow: '#93c5fd', bg: 'bg-blue-500' },
  },
  {
    key: 'B' as const,
    label: '指标 B',
    desc: '（内容待补充，示意：完成与导师首次深度沟通）',
    color: { bar: '#8b5cf6', glow: '#c4b5fd', bg: 'bg-violet-500' },
  },
  {
    key: 'C' as const,
    label: '指标 C',
    desc: '（内容待补充，示意：完成第一个月工作复盘）',
    color: { bar: '#06b6d4', glow: '#67e8f9', bg: 'bg-cyan-500' },
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
      <p className="text-sm text-gray-500 mb-4">完成每项指标需要：① 你确认完成 → ② 导师确认通过</p>

      {/* 总能量槽 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-gray-500">成长能量槽</span>
          <span className="text-xs font-mono text-gray-400">{totalCharge} / 6</span>
        </div>
        <div className="h-4 rounded-full bg-gray-100 overflow-hidden border border-gray-200 relative">
          {/* 充能分格线 */}
          {[1,2,3,4,5].map(i => (
            <div key={i} className="absolute top-0 bottom-0 w-px bg-white/60 z-10" style={{ left: `${(i/6)*100}%` }} />
          ))}
          {/* 能量条 */}
          <div
            className="h-full rounded-full transition-all duration-700 ease-out relative"
            style={{
              width: `${(totalCharge / 6) * 100}%`,
              background: allDone
                ? 'linear-gradient(90deg, #3b82f6, #8b5cf6, #06b6d4)'
                : 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
              boxShadow: totalCharge > 0 ? '0 0 8px rgba(139,92,246,0.5)' : 'none',
            }}
          >
            {/* 流光扫描效果 */}
            {totalCharge > 0 && totalCharge < 6 && (
              <div className="absolute inset-0 overflow-hidden rounded-full">
                <div className="absolute inset-0 animate-shimmer" style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                  backgroundSize: '200% 100%',
                }} />
              </div>
            )}
          </div>
        </div>
        {allDone && (
          <p className="text-xs text-center text-purple-600 font-medium mt-1.5 animate-pulse">
            ⚡ 成长能量已充满，知识测试已解锁！
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
            <div key={key} className={`rounded-xl border-2 p-4 transition-all duration-300 ${
              fullyDone ? 'border-purple-200 bg-purple-50/50' :
              selfDone ? 'border-blue-100 bg-blue-50/30' :
              'border-gray-200 bg-white'
            }`}>
              <div className="flex items-center gap-3 mb-2.5">
                {/* 充能图标 */}
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                  fullyDone ? 'bg-purple-100' : selfDone ? 'bg-blue-100' : 'bg-gray-100'
                } ${isCharging ? 'scale-125' : 'scale-100'}`}>
                  <span className="text-base">
                    {fullyDone ? '⚡' : selfDone ? '🔋' : '🪫'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{label}</p>
                  <p className="text-xs text-gray-400 truncate">{desc}</p>
                </div>
                {/* 格子进度 */}
                <div className="flex gap-1 flex-shrink-0">
                  {[0, 1].map(i => (
                    <div key={i} className={`w-4 h-4 rounded border-2 transition-all duration-500 ${
                      itemCharge > i
                        ? `border-transparent ${color.bg} ${isCharging && i === 0 ? 'animate-charge-cell' : ''}`
                        : 'border-gray-200 bg-gray-50'
                    }`} />
                  ))}
                </div>
              </div>

              {/* 小进度条 */}
              <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden mb-2.5">
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
                  <span className={`text-xs px-2 py-0.5 rounded-full ${selfDone ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>
                    我 {selfDone ? '✓' : '—'}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${mentorDone ? 'bg-purple-100 text-purple-700' : selfDone ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-400'}`}>
                    导师 {mentorDone ? '✓' : selfDone ? '待确认' : '—'}
                  </span>
                </div>
                {!selfDone && (
                  <button
                    onClick={() => selfConfirm(key)}
                    disabled={confirming === key}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-xs font-medium transition-all active:scale-95"
                  >
                    {confirming === key ? '充能中...' : '确认完成 ⚡'}
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
