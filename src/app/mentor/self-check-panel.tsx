'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const CHECKS = [
  {
    key: 'check1' as const,
    title: '熟悉培训手册',
    desc: '了解新人入职的完整培训路径和关键节点',
    stamp: '已读',
  },
  {
    key: 'check2' as const,
    title: '完成首次 1on1',
    desc: '了解新人背景、期望，建立初步信任关系',
    stamp: '已谈',
  },
  {
    key: 'check3' as const,
    title: '制定成长计划',
    desc: '明确阶段目标、学习重点和考核标准',
    stamp: '已定',
  },
]

interface Props {
  userId: string
  initialCheck: { check1: boolean; check2: boolean; check3: boolean } | null
}

export function MentorSelfCheckPanel({ userId, initialCheck }: Props) {
  const router = useRouter()
  const [checks, setChecks] = useState({
    check1: initialCheck?.check1 ?? false,
    check2: initialCheck?.check2 ?? false,
    check3: initialCheck?.check3 ?? false,
  })
  const [stamping, setStamping] = useState<string | null>(null)
  const [justStamped, setJustStamped] = useState<string | null>(null)

  const allDone = checks.check1 && checks.check2 && checks.check3
  const doneCount = [checks.check1, checks.check2, checks.check3].filter(Boolean).length

  async function doStamp(key: 'check1' | 'check2' | 'check3') {
    if (checks[key] || stamping) return
    setStamping(key)

    const res = await fetch('/api/mentor/self-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [key]: true }),
    })

    if (res.ok) {
      setChecks(prev => ({ ...prev, [key]: true }))
      setJustStamped(key)
      setTimeout(() => {
        setJustStamped(null)
        router.refresh()
      }, 800)
    }
    setStamping(null)
  }

  return (
    <div>
      <p className="text-sm text-gray-500 mb-5">点击每张卡片，盖章确认完成 · 已完成 {doneCount}/3 项</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        {CHECKS.map(({ key, title, desc, stamp }) => {
          const done = checks[key]
          const isStamping = stamping === key
          const isJustStamped = justStamped === key

          return (
            <button
              key={key}
              onClick={() => doStamp(key)}
              disabled={done || !!stamping}
              className={`relative rounded-2xl border-2 p-5 text-left transition-all duration-200 overflow-hidden group
                ${done
                  ? 'border-amber-200 bg-amber-50 cursor-default'
                  : 'border-gray-200 bg-white hover:border-amber-300 hover:shadow-md active:scale-95 cursor-pointer'
                }
              `}
            >
              {/* 卡片内容 */}
              <div className={`transition-opacity duration-200 ${isStamping ? 'opacity-50' : 'opacity-100'}`}>
                <div className={`text-xs font-mono mb-3 ${done ? 'text-amber-500' : 'text-gray-300'}`}>
                  0{CHECKS.findIndex(c => c.key === key) + 1}
                </div>
                <p className={`font-semibold text-sm mb-1 ${done ? 'text-amber-800' : 'text-gray-800'}`}>{title}</p>
                <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
                {!done && (
                  <p className="text-xs text-amber-500 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    点击盖章确认 →
                  </p>
                )}
              </div>

              {/* 印章 */}
              {done && (
                <div className={`absolute inset-0 flex items-center justify-center pointer-events-none
                  ${isJustStamped ? 'animate-stamp' : ''}
                `}>
                  <div className={`
                    w-20 h-20 rounded-full border-4 border-red-500 flex flex-col items-center justify-center
                    rotate-[-15deg] opacity-80
                    ${isJustStamped ? 'scale-150 opacity-0' : 'scale-100 opacity-80'}
                    transition-all duration-500
                  `}
                    style={{ boxShadow: 'inset 0 0 0 2px #ef4444' }}
                  >
                    <span className="text-red-500 font-bold text-lg leading-none">{stamp}</span>
                    <span className="text-red-400 text-[9px] tracking-widest mt-0.5">✓ 确认</span>
                  </div>
                </div>
              )}

              {/* 盖章动画遮罩 */}
              {isStamping && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/60">
                  <div className="w-20 h-20 rounded-full border-4 border-red-400 flex flex-col items-center justify-center
                    rotate-[-15deg] animate-stamp-drop opacity-90"
                    style={{ boxShadow: 'inset 0 0 0 2px #f87171' }}
                  >
                    <span className="text-red-400 font-bold text-lg leading-none">{stamp}</span>
                    <span className="text-red-300 text-[9px] tracking-widest mt-0.5">✓ 确认</span>
                  </div>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* 全部完成提示 */}
      {allDone && (
        <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl text-center">
          <span className="text-amber-700 font-semibold text-sm">🎉 三项资质已全部盖章确认，知识测试已解锁！</span>
        </div>
      )}

      <style>{`
        @keyframes stamp-drop {
          0%   { transform: rotate(-15deg) scale(0.3) translateY(-40px); opacity: 0; }
          60%  { transform: rotate(-15deg) scale(1.15) translateY(4px);  opacity: 1; }
          80%  { transform: rotate(-15deg) scale(0.95) translateY(0);    opacity: 1; }
          100% { transform: rotate(-15deg) scale(1)    translateY(0);    opacity: 0.9; }
        }
        .animate-stamp-drop {
          animation: stamp-drop 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
      `}</style>
    </div>
  )
}
