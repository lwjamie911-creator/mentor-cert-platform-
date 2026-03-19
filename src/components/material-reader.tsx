'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import Link from 'next/link'

interface Props {
  materialId: string
  contentText: string
  minReadSeconds: number
  isCompleted: boolean
  backHref: string
  accentColor: 'amber' | 'blue'
}

const accentStyles = {
  amber: {
    bar:    'linear-gradient(90deg,#f59e0b,#fb923c)',
    btn:    'linear-gradient(90deg,#f59e0b,#fb923c)',
    ring:   'focus:ring-amber-300 focus:border-amber-400',
    doneBtn:'text-amber-700 border border-amber-200 hover:bg-amber-50',
  },
  blue: {
    bar:    'linear-gradient(90deg,#3b82f6,#6366f1)',
    btn:    'linear-gradient(90deg,#3b82f6,#6366f1)',
    ring:   'focus:ring-blue-300 focus:border-blue-400',
    doneBtn:'text-indigo-600 border border-indigo-200 hover:bg-indigo-50',
  },
}

export function MaterialReader({ materialId, contentText, minReadSeconds, isCompleted, backHref, accentColor }: Props) {
  const router   = useRouter()
  const [timeSpent, setTimeSpent] = useState(0)
  const [marking, setMarking]     = useState(false)
  const [done, setDone]           = useState(isCompleted)
  const intervalRef               = useRef<NodeJS.Timeout>()

  const minSec      = minReadSeconds || 0
  const canComplete = minSec === 0 || timeSpent >= minSec
  const remaining   = Math.max(0, minSec - timeSpent)
  const pct         = minSec > 0 ? Math.min(100, Math.round((timeSpent / minSec) * 100)) : 100
  const styles      = accentStyles[accentColor]

  useEffect(() => {
    if (done) return
    intervalRef.current = setInterval(() => setTimeSpent(t => t + 1), 1000)
    return () => clearInterval(intervalRef.current)
  }, [done])

  async function markComplete() {
    setMarking(true)
    await fetch('/api/learning/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ materialId }),
    })
    setDone(true)
    setMarking(false)
    router.refresh()
  }

  return (
    <div className="space-y-4">
      {/* 内容区 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="prose prose-sm max-w-none prose-headings:text-gray-800 prose-p:text-gray-600 prose-p:leading-relaxed">
          <ReactMarkdown>{contentText || '（暂无内容）'}</ReactMarkdown>
        </div>
      </div>

      {/* 底部操作栏 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* 计时 / 完成状态 */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {!done && minSec > 0 && (
              <>
                <div className="flex-1 max-w-[180px]">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>阅读进度</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full transition-all"
                      style={{ width: `${pct}%`, background: styles.bar }} />
                  </div>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">
                  {canComplete ? '可以完成了 ✓' : `还需 ${remaining} 秒`}
                </span>
              </>
            )}
            {done && (
              <span className="text-sm text-green-600 font-medium">✓ 本篇已读完</span>
            )}
          </div>

          {/* 按钮区 */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {!done ? (
              <button
                onClick={markComplete}
                disabled={!canComplete || marking}
                className="px-5 py-2 rounded-xl text-sm font-semibold text-white shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                style={{ background: canComplete ? styles.btn : undefined,
                         backgroundColor: !canComplete ? '#d1d5db' : undefined }}
              >
                {marking ? '保存中…' : canComplete ? '✅ 标记已读' : `还需 ${remaining} 秒`}
              </button>
            ) : (
              <Link href={backHref}
                className={`px-5 py-2 rounded-xl text-sm font-semibold transition-colors ${styles.doneBtn}`}>
                返回 →
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
