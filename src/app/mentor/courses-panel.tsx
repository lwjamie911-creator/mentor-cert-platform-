'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { School, BookOpen, Target, Sparkles, CheckCircle, Pause, ChevronDown, Lock, PartyPopper, FileText, Link2, ExternalLink, Check, Clock, type LucideIcon } from 'lucide-react'
import type { AccentTheme } from './accent-theme'

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
  linkOpened: boolean   // 已点击打开链接
  awaySeconds: number   // 累计「不在此页面」的秒数（真实阅读时间）
  isAway: boolean       // 当前是否在其他标签页（隐藏中）
}

interface Props {
  userId: string
  initialMaterials: Material[]
  accent: AccentTheme
}

const COURSE_THEMES: { icon: LucideIcon; room: string }[] = [
  { icon: School,   room: '一号教室' },
  { icon: BookOpen, room: '二号教室' },
  { icon: Target,   room: '三号教室' },
  { icon: Sparkles, room: '四号教室' },
]

export function MentorCoursesPanel({ userId, initialMaterials, accent }: Props) {
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

  // 当前正在追踪阅读的课程 ID（只允许一门）
  const trackingId = Object.entries(courseStates).find(
    ([id, cs]) => cs.linkOpened && !materials.find(m => m.id === id)?.completed
  )?.[0] ?? null

  // 全局 Visibility 监听：只对 trackingId 课程计时
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
    // 初始化当前状态
    setCourseStates(prev => ({
      ...prev,
      [trackingId]: { ...prev[trackingId], isAway: document.hidden },
    }))
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [trackingId])

  // 每秒累计「离开时间」
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
      fetch('/api/learning/mentor').then(r => r.json()).then(data => setMaterials(data))
    }
    window.addEventListener('focus', refresh)
    return () => window.removeEventListener('focus', refresh)
  }, [])

  // 是否有课程已打开但未完成（锁定其他课程）
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
      <div className="text-center py-8 text-cocoa-400">
        <School className="w-8 h-8 mx-auto mb-2" strokeWidth={1.5} />
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
        <div className="flex justify-between text-xs text-cocoa-500 mb-2">
          <span>课程进度</span>
          <span className={`font-semibold ${allDone ? 'text-green-600' : accent.text}`}>
            {completedCount} / {materials.length} 门 · {Math.round((completedCount / materials.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-cocoa-100 rounded-full h-1.5">
          <div className="h-1.5 rounded-full transition-all duration-500"
            style={{
              width: `${(completedCount / materials.length) * 100}%`,
              background: allDone ? 'linear-gradient(90deg,#22c55e,#16a34a)' : 'linear-gradient(90deg,#7a4230,#b87a5e)',
            }} />
        </div>
      </div>

      {/* 正在追踪提示 */}
      {hasTracking && (() => {
        const cs = courseStates[trackingId!]
        return (
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium border
            ${cs.isAway
              ? 'bg-green-50 border-green-200 text-green-700'
              : `${accent.softBg} ${accent.softBorder} ${accent.text}`}`}>
            <span className={cs.isAway ? 'animate-pulse' : ''}>
              {cs.isAway ? <BookOpen className="w-4 h-4" strokeWidth={2} /> : <Pause className="w-4 h-4" strokeWidth={2} />}
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
          const RoomIcon = theme.icon
          const isOpen = activeId === m.id
          const cs = courseStates[m.id] ?? { linkOpened: false, awaySeconds: 0, isAway: false }
          const minMin = m.minReadSeconds > 0 ? Math.ceil(m.minReadSeconds / 60) : null
          const isLocked = hasTracking && trackingId !== m.id && !m.completed
          const readDone = cs.awaySeconds >= m.minReadSeconds

          return (
            <div key={m.id}
              className={`rounded-2xl border overflow-hidden transition-all duration-300 ${accent.softBg} ${accent.softBorder}
                ${isLocked ? 'opacity-40' : ''}
                ${isOpen && !m.completed ? `ring-2 ${accent.ring}` : ''}
              `}
            >
              {/* 教室门头 */}
              <button
                onClick={() => handleToggle(m.id)}
                disabled={isLocked}
                className="w-full flex items-center gap-4 px-5 py-4 text-left hover:opacity-90 transition-opacity disabled:cursor-not-allowed"
              >
                <div className={`w-12 h-12 rounded-xl bg-paper/80 flex items-center justify-center flex-shrink-0 shadow-card ${accent.text}`}>
                  {m.completed ? <CheckCircle className="w-6 h-6 text-green-600" strokeWidth={2} /> : cs.isAway ? <BookOpen className="w-6 h-6" strokeWidth={2} /> : <RoomIcon className="w-6 h-6" strokeWidth={2} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${accent.badge}`}>{theme.room}</span>
                    {m.completed && (
                      <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full font-medium"><Check className="w-3 h-3" strokeWidth={2.5} /> 已完成</span>
                    )}
                    {!m.completed && cs.linkOpened && cs.isAway && (
                      <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full font-medium animate-pulse">阅读计时中…</span>
                    )}
                    {!m.completed && cs.linkOpened && !cs.isAway && cs.awaySeconds > 0 && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${accent.badge}`}>计时暂停</span>
                    )}
                  </div>
                  <p className={`font-semibold text-sm truncate ${accent.text}`}>{m.title}</p>
                  <p className="text-xs text-cocoa-400 mt-0.5">
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
                  ? <ChevronDown className={`text-cocoa-400 w-4 h-4 transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} strokeWidth={2} />
                  : <Lock className="text-cocoa-300 w-4 h-4 flex-shrink-0" strokeWidth={2} />
                }
              </button>

              {/* 展开面板：已完成时始终展示复习入口；未完成时按点击展开 */}
              {(isOpen || m.completed) && (
                <CourseRoom
                  material={m}
                  theme={theme}
                  courseState={cs}
                  accent={accent}
                  onOpenLink={(url) => handleOpenLink(m.id, url)}
                  onComplete={() => markComplete(m.id)}
                />
              )}
            </div>
          )
        })}
      </div>

      {allDone && (
        <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-100 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" strokeWidth={2} />
          <p className="text-sm text-green-700 font-medium">所有课程已学完，可以参加认证测试了！</p>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────
// 单个课程教室内容
// ─────────────────────────────────────────────────
function CourseRoom({
  material, theme, courseState, accent, onOpenLink, onComplete,
}: {
  material: Material
  theme: typeof COURSE_THEMES[0]
  courseState: CourseState
  accent: AccentTheme
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
    <div className={`border-t ${accent.softBorder} px-5 py-5 bg-paper/50 space-y-4`}>

      {/* 已完成 */}
      {material.completed ? (
        <div className="flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
          <PartyPopper className="w-6 h-6 text-green-600 flex-shrink-0" strokeWidth={2} />
          <div>
            <p className="text-sm font-semibold text-green-700">本课程已完成学习</p>
            {material.contentUrl ? (
              <button
                onClick={() => window.open(material.contentUrl!, '_blank', 'noopener')}
                className="inline-flex items-center gap-1 text-xs text-green-600 underline hover:no-underline mt-0.5"
              >点此复习 <ExternalLink className="w-3 h-3" strokeWidth={2} /></button>
            ) : (
              <a href={`/mentor/learn/${material.id}`}
                className="inline-flex items-center gap-1 text-xs text-green-600 underline hover:no-underline mt-0.5">
                点此复习 →
              </a>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">

          {/* 说明栏 */}
          <div className="flex items-start gap-3 px-4 py-3 bg-paper/80 rounded-lg border border-line text-sm text-cocoa-600 leading-relaxed">
            <span className="text-cocoa-500 mt-0.5">{material.contentType === 'pdf' ? <FileText className="w-5 h-5" strokeWidth={2} /> : <Link2 className="w-5 h-5" strokeWidth={2} />}</span>
            <div>
              {material.contentType === 'pdf'
                ? 'PDF 将在新标签页打开。系统会追踪你在阅读窗口的时长，切回此页计时自动暂停。'
                : '课程链接将在新标签页打开。系统会追踪你在阅读窗口的时长，切回此页计时自动暂停。'}
              {minSec > 0 && (
                <span className="inline-flex items-center gap-1 text-xs text-cocoa-400 mt-1">
                  <Clock className="w-3.5 h-3.5" strokeWidth={2} /> 需在阅读窗口累计停留至少 {Math.ceil(minSec / 60)} 分钟
                </span>
              )}
            </div>
          </div>

          {/* 未打开：只显示打开按钮 */}
          {!linkOpened ? (
            !material.contentUrl ? (
              <Link
                href={`/mentor/learn/${material.id}`}
                className={`flex items-center justify-center gap-2 w-full py-3 rounded-lg text-center text-sm font-semibold transition-all active:scale-[0.98] ${accent.btn}`}
              >
                <BookOpen className="w-4 h-4" strokeWidth={2} /> 开始阅读 →
              </Link>
            ) : (
            <button
              onClick={() => onOpenLink(material.contentUrl!)}
              className={`flex items-center justify-center gap-2 w-full py-3 rounded-lg text-sm font-semibold transition-all active:scale-[0.98] ${accent.btn}`}
            >
              {material.contentType === 'pdf' ? <><FileText className="w-4 h-4" strokeWidth={2} /> 在新标签页打开 PDF</> : <><Link2 className="w-4 h-4" strokeWidth={2} /> 在新标签页打开课程</>} <ExternalLink className="w-4 h-4" strokeWidth={2} />
            </button>
            )
          ) : (
            <div className="space-y-3">

              {/* 阅读状态卡 */}
              <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-medium transition-colors
                ${isAway
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : `${accent.softBg} ${accent.softBorder} text-cocoa-500`}`}>
                <span className={isAway ? 'animate-pulse' : ''}>
                  {isAway ? <BookOpen className="w-5 h-5" strokeWidth={2} /> : <Pause className="w-5 h-5" strokeWidth={2} />}
                </span>
                <div className="flex-1">
                  {isAway
                    ? <span>正在阅读，计时中…</span>
                    : <span>已切回此页，计时暂停<br/><span className="text-xs font-normal">请切换至阅读窗口继续阅读</span></span>
                  }
                </div>
                <button
                  onClick={() => window.open(material.contentUrl!, '_blank', 'noopener')}
                  className="inline-flex items-center gap-1 text-xs underline hover:no-underline opacity-70 hover:opacity-100 whitespace-nowrap"
                >重新打开 <ExternalLink className="w-3 h-3" strokeWidth={2} /></button>
              </div>

              {/* 进度条 */}
              {minSec > 0 && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-cocoa-500">有效阅读时长</span>
                    <span className={`inline-flex items-center gap-1 font-mono font-semibold ${readDone ? 'text-green-600' : accent.text}`}>
                      {fmt(awaySeconds)} / {fmt(minSec)}
                      {readDone && <Check className="w-3 h-3" strokeWidth={2.5} />}
                    </span>
                  </div>
                  <div className="w-full bg-cocoa-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-2 rounded-full transition-all duration-1000"
                      style={{
                        width: `${pct}%`,
                        background: readDone
                          ? 'linear-gradient(90deg,#22c55e,#16a34a)'
                          : isAway
                            ? 'linear-gradient(90deg,#7a4230,#b87a5e)'
                            : 'linear-gradient(90deg,#e8c4ac,#cf9c84)',
                      }}
                    />
                  </div>
                  {!readDone && (
                    <p className="text-xs text-cocoa-400">
                      还需在阅读窗口停留 {fmt(minSec - awaySeconds)}
                    </p>
                  )}
                </div>
              )}

              {/* 确认完成按钮 */}
              <button
                onClick={handleConfirm}
                disabled={!canConfirm || submitting}
                className={`w-full py-3 rounded-lg text-sm font-semibold transition-all duration-200 inline-flex items-center justify-center gap-1.5
                  ${canConfirm
                    ? `${accent.btn} active:scale-[0.98]`
                    : 'bg-cocoa-100 text-cocoa-400 cursor-not-allowed'}`}
              >
                {submitting
                  ? '记录中…'
                  : canConfirm
                    ? <><Check className="w-4 h-4" strokeWidth={2.5} /> 确认完成本课程</>
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
