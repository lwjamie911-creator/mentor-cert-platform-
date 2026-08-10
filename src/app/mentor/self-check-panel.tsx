'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Star, CalendarDays, TrendingUp, FolderKanban, Check, Sparkles, PartyPopper, type LucideIcon } from 'lucide-react'
import type { AccentTheme } from './accent-theme'

const CHECKS: { key: CheckKey; label: string; icon: LucideIcon; front: string; back: string; stamp: string }[] = [
  {
    key: 'check1',
    label: '职级要求',
    icon: Star,
    front: '职级要求',
    back: '专业职级 S9 及以上',
    stamp: '达标',
  },
  {
    key: 'check2',
    label: '司龄要求',
    icon: CalendarDays,
    front: '司龄要求',
    back: '腾讯 TEG 办公室秘书岗位至少 2 年',
    stamp: '达标',
  },
  {
    key: 'check3',
    label: '绩效要求',
    icon: TrendingUp,
    front: '绩效要求',
    back: '往期绩效至少 1 次 Outstanding',
    stamp: '达标',
  },
  {
    key: 'check4',
    label: '经验要求',
    icon: FolderKanban,
    front: '经验要求',
    back: '至少独立负责过 1 次办公室虚拟小组、大型项目模块 PM 或项目 PM',
    stamp: '达标',
  },
]

type CheckKey = 'check1' | 'check2' | 'check3' | 'check4'

interface Props {
  userId: string
  initialCheck: { check1: boolean; check2: boolean; check3: boolean; check4: boolean } | null
  accent: AccentTheme
}

export function MentorSelfCheckPanel({ userId, initialCheck, accent }: Props) {
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

  return (
    <div>
      <p className="text-sm text-cocoa-500 mb-1">点击卡片翻转查看资质标准 · 确认达标后点击按钮盖章</p>
      <p className="text-xs text-cocoa-400 mb-5">已完成 {doneCount}/4 项</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
        {CHECKS.map(({ key, icon: Icon, front, back, stamp }) => {
          const done = checks[key]
          // 已完成的卡片：默认显示背面，但仍可点击翻转查看正面
          const isFlipped = done ? (flipped[key] === false ? false : true) : !!flipped[key]

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
                  className={`absolute inset-0 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 p-4 transition-all
                    ${done ? `${accent.softBorder} ${accent.softBg}` : `border-line bg-paper hover:shadow-card`}`}
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <span className={`w-12 h-12 rounded-2xl flex items-center justify-center ${done ? accent.badge : accent.iconChip}`}>
                    <Icon className="w-6 h-6" strokeWidth={2} />
                  </span>
                  <p className={`font-semibold text-sm text-center ${accent.text}`}>{front}</p>
                  {!done && (
                    <p className="text-xs text-cocoa-400 mt-1">点击查看标准</p>
                  )}
                  {done && (
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${accent.badge}`}>
                      <Check className="w-3 h-3" strokeWidth={2.5} /> 已确认
                    </span>
                  )}
                </div>

                {/* 背面 */}
                <div
                  className={`absolute inset-0 rounded-2xl border-2 flex flex-col items-start justify-between p-4
                    ${done ? `${accent.softBorder} ${accent.softBg}` : `border-line ${accent.softBg}`}`}
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  <div className="flex-1 flex items-center">
                    <p className={`text-sm leading-relaxed font-medium ${accent.text}`}>{back}</p>
                  </div>

                  {/* 已盖章显示印章，未盖章显示按钮 */}
                  {done ? (
                    <div className="w-full flex justify-end mt-2">
                      <div className={`w-14 h-14 rounded-full border-[3px] flex flex-col items-center justify-center rotate-[-12deg] opacity-80 ${accent.text}`}
                        style={{ borderColor: 'currentColor', boxShadow: `inset 0 0 0 1.5px` }}>
                        <span className="font-bold text-sm leading-none">{stamp}</span>
                        <Check className="w-3 h-3 mt-0.5 opacity-70" strokeWidth={2.5} />
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => doStamp(e, key)}
                      disabled={!!stamping}
                      className={`w-full mt-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95 inline-flex items-center justify-center gap-1
                        ${stamping === key ? `opacity-60 cursor-wait ${accent.btn}` : `${accent.btn} cursor-pointer`}`}
                    >
                      {stamping === key ? '盖章中…' : <><Sparkles className="w-3.5 h-3.5" strokeWidth={2} /> 我已达标，确认盖章</>}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {allDone && (
        <div className={`p-4 ${accent.softBg} border ${accent.softBorder} rounded-lg text-center`}>
          <span className={`inline-flex items-center gap-1.5 font-semibold text-sm ${accent.text}`}>
            <PartyPopper className="w-4 h-4" strokeWidth={2} /> 四项资质已全部确认，学习课程已解锁！
          </span>
        </div>
      )}
    </div>
  )
}
