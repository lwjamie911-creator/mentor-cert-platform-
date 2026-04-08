'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const CHECKS = [
  {
    key: 'check1' as const,
    label: '职级要求',
    icon: '⭐',
    front: '职级要求',
    back: '专业职级 S9 及以上',
    stamp: '达标',
    color: 'amber',
  },
  {
    key: 'check2' as const,
    label: '司龄要求',
    icon: '📅',
    front: '司龄要求',
    back: '腾讯 TEG 办公室秘书岗位至少 2 年',
    stamp: '达标',
    color: 'orange',
  },
  {
    key: 'check3' as const,
    label: '绩效要求',
    icon: '📈',
    front: '绩效要求',
    back: '往期绩效至少 1 次 Outstanding，且从未 Underperform',
    stamp: '达标',
    color: 'rose',
  },
  {
    key: 'check4' as const,
    label: '经验要求',
    icon: '🗂️',
    front: '经验要求',
    back: '至少独立负责过 1 次办公室虚拟小组、大型项目模块 PM 或项目 PM',
    stamp: '达标',
    color: 'violet',
  },
]

type CheckKey = 'check1' | 'check2' | 'check3' | 'check4'

interface Props {
  userId: string
  initialCheck: { check1: boolean; check2: boolean; check3: boolean; check4: boolean } | null
}

export function MentorSelfCheckPanel({ userId, initialCheck }: Props) {
  const router = useRouter()
  const [checks, setChecks] = useState({
    check1: initialCheck?.check1 ?? false,
    check2: initialCheck?.check2 ?? false,
    check3: initialCheck?.check3 ?? false,
    check4: initialCheck?.check4 ?? false,
  })
  const [flipped, setFlipped] = useState<Record<string, boolean>>({})
  const [stamping, setStamping] = useState<string | null>(null)

  const doneCount = Object.values(checks).filter(Boolean).length
  const allDone = doneCount === 4

  function toggleFlip(key: string) {
    setFlipped(prev => ({ ...prev, [key]: !prev[key] }))
  }

  async function doStamp(e: React.MouseEvent, key: CheckKey) {
    e.stopPropagation() // 防止触发翻转
    if (checks[key] || stamping) return
    setStamping(key)

    const res = await fetch('/api/mentor/self-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [key]: true }),
    })

    if (res.ok) {
      setChecks(prev => ({ ...prev, [key]: true }))
      setTimeout(() => router.refresh(), 600)
    }
    setStamping(null)
  }

  const colorMap: Record<string, { border: string; bg: string; stampBorder: string; stampText: string; btn: string; badgeBg: string; badgeText: string }> = {
    amber:  { border: 'border-amber-200',  bg: 'bg-amber-50',  stampBorder: 'border-amber-500',  stampText: 'text-amber-500',  btn: 'bg-amber-500 hover:bg-amber-600',   badgeBg: 'bg-amber-100',  badgeText: 'text-amber-700' },
    orange: { border: 'border-orange-200', bg: 'bg-orange-50', stampBorder: 'border-orange-500', stampText: 'text-orange-500', btn: 'bg-orange-500 hover:bg-orange-600',  badgeBg: 'bg-orange-100', badgeText: 'text-orange-700' },
    rose:   { border: 'border-rose-200',   bg: 'bg-rose-50',   stampBorder: 'border-rose-500',   stampText: 'text-rose-500',   btn: 'bg-rose-500 hover:bg-rose-600',     badgeBg: 'bg-rose-100',   badgeText: 'text-rose-700' },
    violet: { border: 'border-violet-200', bg: 'bg-violet-50', stampBorder: 'border-violet-500', stampText: 'text-violet-500', btn: 'bg-violet-500 hover:bg-violet-600',  badgeBg: 'bg-violet-100', badgeText: 'text-violet-700' },
  }

  return (
    <div>
      <p className="text-sm text-gray-500 mb-1">点击卡片翻转查看资质标准 · 确认达标后点击按钮盖章</p>
      <p className="text-xs text-gray-400 mb-5">已完成 {doneCount}/4 项</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
        {CHECKS.map(({ key, icon, front, back, stamp, color }) => {
          const done = checks[key]
          // 已完成的卡片：默认显示背面，但仍可点击翻转查看正面
          const isFlipped = done ? (flipped[key] === false ? false : true) : !!flipped[key]
          const c = colorMap[color]

          return (
            <div key={key} className="relative" style={{ perspective: '800px', height: '180px' }}>
              {/* 卡片容器，始终可点击翻转 */}
              <div
                onClick={() => toggleFlip(key)}
                className={`relative w-full h-full transition-transform duration-500 cursor-pointer`}
                style={{
                  transformStyle: 'preserve-3d',
                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
              >
                {/* 正面 */}
                <div
                  className={`absolute inset-0 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 p-4
                    ${done ? `${c.border} ${c.bg}` : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'}`}
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <span className="text-3xl">{icon}</span>
                  <p className="font-semibold text-sm text-gray-800 text-center">{front}</p>
                  {!done && (
                    <p className="text-xs text-gray-400 mt-1">点击查看标准</p>
                  )}
                  {done && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.badgeBg} ${c.badgeText}`}>✓ 已确认</span>
                  )}
                </div>

                {/* 背面 */}
                <div
                  className={`absolute inset-0 rounded-2xl border-2 flex flex-col items-start justify-between p-4
                    ${done ? `${c.border} ${c.bg}` : 'border-gray-200 bg-gray-50'}`}
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  <div className="flex-1 flex items-center">
                    <p className="text-sm text-gray-700 leading-relaxed font-medium">{back}</p>
                  </div>

                  {/* 已盖章显示印章，未盖章显示按钮 */}
                  {done ? (
                    <div className="w-full flex justify-end mt-2">
                      <div className={`w-14 h-14 rounded-full border-[3px] ${c.stampBorder} flex flex-col items-center justify-center rotate-[-12deg] opacity-80`}
                        style={{ boxShadow: `inset 0 0 0 1.5px` }}>
                        <span className={`${c.stampText} font-bold text-sm leading-none`}>{stamp}</span>
                        <span className={`${c.stampText} text-[9px] tracking-widest mt-0.5 opacity-70`}>✓</span>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => doStamp(e, key)}
                      disabled={!!stamping}
                      className={`w-full mt-3 py-1.5 rounded-xl text-white text-xs font-semibold transition-all active:scale-95
                        ${stamping === key ? 'opacity-60 cursor-wait' : `${c.btn} cursor-pointer`}`}
                    >
                      {stamping === key ? '盖章中…' : '✦ 我已达标，确认盖章'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {allDone && (
        <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl text-center">
          <span className="text-amber-700 font-semibold text-sm">🎉 四项资质已全部确认，学习课程已解锁！</span>
        </div>
      )}
    </div>
  )
}
