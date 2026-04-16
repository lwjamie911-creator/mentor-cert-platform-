'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Material {
  id: string
  title: string
  subject: string
  contentType: string
  contentUrl?: string | null
  contentText?: string | null
  minReadSeconds: number
  completed: boolean
}

interface CourseState {
  linkOpened: boolean
  awaySeconds: number
  isAway: boolean
}

interface Props {
  userId: string
  initialMaterials: Material[]
}

const COURSE_THEMES = [
  { icon: '🏛️', room: '一号教室', btn: 'bg-blue-500 hover:bg-blue-600',    border: 'border-blue-200',   gradient: 'from-blue-50 to-sky-50',       tag: 'bg-blue-100 text-blue-700',    ring: 'ring-blue-300'    },
  { icon: '📖', room: '二号教室', btn: 'bg-cyan-500 hover:bg-cyan-600',     border: 'border-cyan-200',   gradient: 'from-cyan-50 to-teal-50',      tag: 'bg-cyan-100 text-cyan-700',    ring: 'ring-cyan-300'    },
  { icon: '🎯', room: '三号教室', btn: 'bg-teal-500 hover:bg-teal-600',     border: 'border-teal-200',   gradient: 'from-teal-50 to-emerald-50',   tag: 'bg-teal-100 text-teal-700',    ring: 'ring-teal-300'    },
  { icon: '🌟', room: '四号教室', btn: 'bg-indigo-500 hover:bg-indigo-600', border: 'border-indigo-200', gradient: 'from-indigo-50 to-violet-50',  tag: 'bg-indigo-100 text-indigo-700',ring: 'ring-indigo-300'  },
]

export function NewbieCoursesPanel({ userId, initialMaterials }: Props) {
  const [materials, setMaterials] = useState<Material[]>(initialMaterials)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [courseStates, setCourseStates] = useState<Record<string, CourseState>>(() => {
    const init: Record<string, CourseState> = {}
    initialMaterials.forEach(m => {
      init[m.id] = { linkOpened: false, awaySeconds: 0, isAway: false }
    })
    return init
  })
  const router = useRouter()

  // 当前正在追踪阅读的课程 ID
  const trackingId = Object.entries(courseStates).find(
    ([id, cs]) => cs.linkOpened && !materials.find(m => m.id === id)?.completed
  )?.[0] ?? null

  // 全局 Visibility 监听
  useEffect(() => {
    if (!trackingId) return

    function handleVisibility() {
      const isHidden = document.hidden
      setCourseStates(prev => ({
        ...prev,
        [trackingId!]: { ...prev[trackingId!], isAway: isHidden },
      }))
    }

    document.addEventListener('visibilitychange', handleVisibility)
    setCourseStates(prev => ({
      ...prev,
      [trackingId]: { ...prev[trackingId], isAway: document.hidden },
    }))
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [trackingId])

  // 每秒累计离开时间
  useEffect(() => {
    if (!trackingId) return
    const cs = courseStates[trackingId]
    if (!cs?.isAway) return

    const interval = setInterval(() => {
      setCourseStates(prev => ({
        ...prev,
        [trackingId]: { ...prev[trackingId], awaySeconds: prev[trackingId].awaySeconds + 1 },
      }))
    }, 1000)
    return () => clearInterval(interval)
  }, [trackingId, courseStates[trackingId ?? '']?.isAway])

  // 页面聚焦时刷新完成状态
  useEffect(() => {
    function refresh() {
      fetch('/api/learning/newbie').then(r => r.json()).then(data => setMaterials(data))
    }
    window.addEventListener('focus', refresh)
    return () => window.removeEventListener('focus', refresh)
  }, [])

  const hasTracking = !!trackingId

  function handleToggle(id: string) {
    if (hasTracking && trackingId !== id) return
    setActiveId(prev => prev === id ? null : id)
  }

  function handleOpenLink(id: string, url: string) {
    window.open(url, '_blank', 'noopener')
    setCourseStates(prev => ({ ...prev, [id]: { ...prev[id], linkOpened: true } }))
    setActiveId(id)
  }

  function markComplete(id: string) {
    setMaterials(prev => prev.map(m => m.id === id ? { ...m, completed: true } : m))
    setActiveId(null)
    router.refresh()
  }

  if (materials.length === 0) {
    return (
      <div className="text-center py-8 text-gray-300">
        <div className="text-3xl mb-2">🏫</div>
        <p className="text-sm">暂无课程，请等待管理员添加</p>
      </div>
    )
  }

  const completedCount = materials.filter(m => m.completed).length
  const allDone = completedCount === materials.length

  return (
    <div className="space-y-4">
      {/* 进度总览 */}
      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>课程进度</span>
          <span className={`font-semibold ${allDone ? 'text-green-600' : 'text-blue-600'}`}>
            {completedCount} / {materials.length} 门 · {Math.round((completedCount / materials.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div className="h-1.5 rounded-full transition-all duration-500"
            style={{
              width: `${(completedCount / materials.length) * 100}%`,
              background: allDone ? 'linear-gradient(90deg,#22c55e,#16a34a)' : 'linear-gradient(90deg,#3b82f6,#6366f1)',
            }} />
        </div>
      </div>

      {/* 正在追踪提示 */}
      {hasTracking && (() => {
        const cs = courseStates[trackingId!]
        return (
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium border
            ${cs.isAway
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
            <span className={cs.isAway ? 'animate-pulse' : ''}>
              {cs.isAway ? '📖' : '⏸️'}
            </span>
            {cs.isAway
              ? `正在计时阅读中… 已累计 ${fmt(cs.awaySeconds)}`
              : '计时已暂停，请切换回阅读窗口继续阅读'}
          </div>
        )
      })()}

      {/* 课程教室卡片 */}
      <div className="space-y-3">
        {materials.map((m, idx) => {
          const theme = COURSE_THEMES[idx % COURSE_THEMES.length]
          const isOpen = activeId === m.id
          const cs = courseStates[m.id] ?? { linkOpened: false, awaySeconds: 0, isAway: false }
          const minMin = m.minReadSeconds > 0 ? Math.ceil(m.minReadSeconds / 60) : null
          const isLocked = hasTracking && trackingId !== m.id && !m.completed
          const readDone = cs.awaySeconds >= m.minReadSeconds

          return (
            <div key={m.id}
              className={`rounded-2xl border-2 overflow-hidden transition-all duration-300 bg-gradient-to-br ${theme.gradient} ${theme.border}
                ${isLocked ? 'opacity-40' : ''}
                ${isOpen && !m.completed ? `ring-2 ${theme.ring}` : ''}
              `}
            >
              {/* 教室门头 */}
              <button
                onClick={() => handleToggle(m.id)}
                disabled={isLocked}
                className="w-full flex items-center gap-4 px-5 py-4 text-left hover:opacity-90 transition-opacity disabled:cursor-not-allowed"
              >
                <div className="w-12 h-12 rounded-xl bg-white/80 flex items-center justify-center text-2xl flex-shrink-0 shadow-sm">
                  {m.completed ? '✅' : cs.isAway ? '📖' : theme.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${theme.tag}`}>{theme.room}</span>
                    {m.completed && (
                      <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full font-medium">✓ 已完成</span>
                    )}
                    {!m.completed && cs.linkOpened && cs.isAway && (
                      <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full font-medium animate-pulse">阅读计时中…</span>
                    )}
                    {!m.completed && cs.linkOpened && !cs.isAway && cs.awaySeconds > 0 && (
                      <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full font-medium">计时暂停</span>
                    )}
                  </div>
                  <p className="font-semibold text-sm text-gray-800 truncate">{m.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {!m.completed && cs.linkOpened
                      ? readDone
                        ? '✓ 阅读时长已满足，可确认完成'
                        : `已阅读 ${fmt(cs.awaySeconds)} / 需满 ${minMin} 分钟`
                      : minMin
                        ? `约需 ${minMin} 分钟 · ${m.subject}`
                        : m.subject}
                  </p>
                </div>
                {!isLocked
                  ? <span className={`text-gray-400 text-sm transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
                  : <span className="text-gray-300 text-sm flex-shrink-0">🔒</span>
                }
              </button>

              {(isOpen || m.completed) && (
                <CourseRoom
                  material={m}
                  theme={theme}
                  courseState={cs}
                  onOpenLink={(url) => handleOpenLink(m.id, url)}
                  onComplete={() => markComplete(m.id)}
                />
              )}
            </div>
          )
        })}
      </div>

      {allDone && (
        <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-100 rounded-xl">
          <span>✅</span>
          <p className="text-sm text-green-700 font-medium">所有课程已学完，可以参加知识测试了！</p>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────
// 单个课程教室内容
// ─────────────────────────────────────────────────
function CourseRoom({
  material, theme, courseState, onOpenLink, onComplete,
}: {
  material: Material
  theme: typeof COURSE_THEMES[0]
  courseState: CourseState
  onOpenLink: (url: string) => void
  onComplete: () => void
}) {
  const [submitting, setSubmitting] = useState(false)
  const { linkOpened, awaySeconds, isAway } = courseState
  const minSec = material.minReadSeconds || 0
  const readDone = awaySeconds >= minSec
  const canConfirm = material.completed || (linkOpened && readDone)
  const pct = minSec > 0 ? Math.min(100, Math.round((awaySeconds / minSec) * 100)) : 100

  async function handleConfirm() {
    setSubmitting(true)
    const res = await fetch('/api/learning/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ materialId: material.id }),
    })
    if (res.ok) onComplete()
    setSubmitting(false)
  }

  return (
    <div className="border-t border-white/60 px-5 py-5 bg-white/50 space-y-4">

      {/* 已完成 */}
      {material.completed ? (
        <div className="flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-xl">
          <span className="text-2xl">🎉</span>
          <div>
            <p className="text-sm font-semibold text-green-700">本课程已完成学习</p>
            {material.contentUrl ? (
              <button
                onClick={() => window.open(material.contentUrl!, '_blank', 'noopener')}
                className="text-xs text-green-600 underline hover:no-underline mt-0.5"
              >点此复习 ↗</button>
            ) : (
              <a href={`/newbie/learn/${material.id}`}
                className="text-xs text-green-600 underline hover:no-underline mt-0.5 block">
                点此复习 →
              </a>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">

          {/* 说明栏 */}
          <div className="flex items-start gap-3 px-4 py-3 bg-white/80 rounded-xl border border-gray-100 text-sm text-gray-600 leading-relaxed">
            <span className="text-lg mt-0.5">{material.contentType === 'pdf' ? '📄' : '🔗'}</span>
            <div>
              {material.contentType === 'pdf'
                ? 'PDF 将在新标签页打开。系统会追踪你在阅读窗口的时长，切回此页计时自动暂停。'
                : '课程链接将在新标签页打开。系统会追踪你在阅读窗口的时长，切回此页计时自动暂停。'}
              {minSec > 0 && (
                <span className="block text-xs text-gray-400 mt-1">
                  ⏱ 需在阅读窗口累计停留至少 {Math.ceil(minSec / 60)} 分钟
                </span>
              )}
            </div>
          </div>

          {/* 未打开：只显示打开按钮 */}
          {!linkOpened ? (
            !material.contentUrl ? (
              <Link
                href={`/newbie/learn/${material.id}`}
                className={`block w-full py-3 rounded-xl text-white text-center text-sm font-semibold transition-all active:scale-[0.98] ${theme.btn}`}
              >
                📖 开始阅读 →
              </Link>
            ) : (
              <button
                onClick={() => onOpenLink(material.contentUrl!)}
                className={`w-full py-3 rounded-xl text-white text-sm font-semibold transition-all active:scale-[0.98] ${theme.btn}`}
              >
                {material.contentType === 'pdf' ? '📄 在新标签页打开 PDF' : '🔗 在新标签页打开课程'} ↗
              </button>
            )
          ) : (
            <div className="space-y-3">

              {/* 阅读状态卡 */}
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-colors
                ${isAway
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                <span className={`text-xl ${isAway ? 'animate-pulse' : ''}`}>
                  {isAway ? '📖' : '⏸️'}
                </span>
                <div className="flex-1">
                  {isAway
                    ? <span>正在阅读，计时中…</span>
                    : <span>已切回此页，计时暂停<br/><span className="text-xs font-normal">请切换至阅读窗口继续阅读</span></span>
                  }
                </div>
                <button
                  onClick={() => window.open(material.contentUrl!, '_blank', 'noopener')}
                  className="text-xs underline hover:no-underline opacity-70 hover:opacity-100 whitespace-nowrap"
                >重新打开 ↗</button>
              </div>

              {/* 进度条 */}
              {minSec > 0 && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">有效阅读时长</span>
                    <span className={`font-mono font-semibold ${readDone ? 'text-green-600' : 'text-blue-600'}`}>
                      {fmt(awaySeconds)} / {fmt(minSec)}
                      {readDone && ' ✓'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-2 rounded-full transition-all duration-1000"
                      style={{
                        width: `${pct}%`,
                        background: readDone
                          ? 'linear-gradient(90deg,#22c55e,#16a34a)'
                          : isAway
                            ? 'linear-gradient(90deg,#3b82f6,#6366f1)'
                            : 'linear-gradient(90deg,#d1d5db,#9ca3af)',
                      }}
                    />
                  </div>
                  {!readDone && (
                    <p className="text-xs text-gray-400">
                      还需在阅读窗口停留 {fmt(minSec - awaySeconds)}
                    </p>
                  )}
                </div>
              )}

              {/* 确认完成按钮 */}
              <button
                onClick={handleConfirm}
                disabled={!canConfirm || submitting}
                className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200
                  ${canConfirm
                    ? `text-white ${theme.btn} active:scale-[0.98]`
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
              >
                {submitting
                  ? '记录中…'
                  : canConfirm
                    ? '✓ 确认完成本课程'
                    : `阅读时长不足，请继续阅读`}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function fmt(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}
