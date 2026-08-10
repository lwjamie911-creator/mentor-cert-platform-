'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  School, BookOpen, Target, Star, type LucideIcon,
  Check, CheckCircle2, Pause, Lock, ChevronDown, PartyPopper,
  FileText, Link2, Timer, ArrowRight, ExternalLink,
} from 'lucide-react'
import type { AccentTheme } from '../mentor/accent-theme'

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
  accent?: AccentTheme
}

// 独立使用时的默认 petal 主题（不传 accent 时回退）
const PETAL_ACCENT: AccentTheme = {
  bar: 'from-petal-600 to-petal-800',
  iconActive: 'bg-petal-100 text-petal-700',
  iconIdle: 'bg-petal-100 text-petal-600',
  titleActive: 'text-petal-900',
  ring: 'ring-petal-300',
  shellIcon: 'bg-petal-100 text-petal-700',
  badge: 'bg-petal-100 text-petal-700',
  btn: 'bg-petal-700 text-paper hover:bg-petal-800',
  text: 'text-petal-700',
  softBg: 'bg-petal-50/60',
  softBorder: 'border-petal-200',
  iconChip: 'bg-petal-100 text-petal-700',
  inputFocus: 'focus:border-petal-500 focus:ring-petal-500/15',
}

// 进度条渐变（in-progress 态）随主题色变化；completed 态统一柔绿
const PROGRESS_GRADIENT: Record<string, string> = {
  'text-petal-700': 'linear-gradient(90deg,#c05e6d,#e59aa4)',
  'text-emerald-700': 'linear-gradient(90deg,#059669,#10b981)',
  'text-amber-700': 'linear-gradient(90deg,#f59e0b,#fcd34d)',
  'text-rose-700': 'linear-gradient(90deg,#f43f5e,#fb7185)',
  'text-cocoa-700': 'linear-gradient(90deg,#7a4230,#b87a5e)',
}

// 四间教室：图标底轮换点缀色，让四张卡片一眼有别不发闷
const COURSE_THEMES: { icon: LucideIcon; room: string; accent: string }[] = [
  { icon: School,   room: '一号教室', accent: 'text-petal-600' },
  { icon: BookOpen, room: '二号教室', accent: 'text-amber-600' },
  { icon: Target,   room: '三号教室', accent: 'text-emerald-600' },
  { icon: Star,     room: '四号教室', accent: 'text-sienna' },
]

export function NewbieCoursesPanel({ userId, initialMaterials, accent = PETAL_ACCENT }: Props) {
  const progressGradient = PROGRESS_GRADIENT[accent.text] ?? PROGRESS_GRADIENT['text-petal-700']
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
          <span className={`font-semibold ${allDone ? 'text-emerald-700' : accent.text}`}>
            {completedCount} / {materials.length} 门 · {Math.round((completedCount / materials.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-cocoa-100 rounded-full h-1.5">
          <div className="h-1.5 rounded-full transition-all duration-500"
            style={{
              width: `${(completedCount / materials.length) * 100}%`,
              background: allDone ? 'linear-gradient(90deg,#059669,#10b981)' : progressGradient,
            }} />
        </div>
      </div>

      {/* 正在追踪提示 */}
      {hasTracking && (() => {
        const cs = courseStates[trackingId!]
        return (
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium border
            ${cs.isAway
              ? `${accent.softBg} ${accent.softBorder} ${accent.text}`
              : `${accent.softBg} ${accent.softBorder} text-cocoa-500`}`}>
            {cs.isAway
              ? <BookOpen className={`w-4 h-4 flex-shrink-0 ${cs.isAway ? 'animate-pulse' : ''}`} strokeWidth={2} />
              : <Pause className="w-4 h-4 flex-shrink-0" strokeWidth={2} />}
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
              className={`rounded-2xl border overflow-hidden transition-all duration-300 shadow-card
                ${m.completed ? 'bg-emerald-50/40 border-emerald-200' : `bg-paper ${accent.softBorder}`}
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
                <div className="w-12 h-12 rounded-xl bg-paper flex items-center justify-center flex-shrink-0 shadow-card">
                  {m.completed
                    ? <CheckCircle2 className="w-6 h-6 text-emerald-600" strokeWidth={2} />
                    : cs.isAway
                      ? <BookOpen className={`w-6 h-6 ${accent.text}`} strokeWidth={2} />
                      : <RoomIcon className={`w-6 h-6 ${theme.accent}`} strokeWidth={2} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${accent.badge}`}>{theme.room}</span>
                    {m.completed && (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                        <Check className="w-3 h-3" strokeWidth={2.5} /> 已完成
                      </span>
                    )}
                    {!m.completed && cs.linkOpened && cs.isAway && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium animate-pulse ${accent.badge}`}>阅读计时中…</span>
                    )}
                    {!m.completed && cs.linkOpened && !cs.isAway && cs.awaySeconds > 0 && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${accent.badge}`}>计时暂停</span>
                    )}
                  </div>
                  <p className="font-semibold text-sm text-cocoa-800 truncate">{m.title}</p>
                  <p className="text-xs text-cocoa-400 mt-0.5">
                    {!m.completed && cs.linkOpened
                      ? readDone
                        ? '阅读时长已满足，可确认完成'
                        : `已阅读 ${fmt(cs.awaySeconds)} / 需满 ${minMin} 分钟`
                      : minMin
                        ? `约需 ${minMin} 分钟 · ${m.subject}`
                        : m.subject}
                  </p>
                </div>
                {!isLocked
                  ? <ChevronDown className={`w-5 h-5 text-cocoa-400 transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} strokeWidth={2} />
                  : <Lock className="w-4 h-4 text-cocoa-400 flex-shrink-0" strokeWidth={2} />
                }
              </button>

              {(isOpen || m.completed) && (
                <CourseRoom
                  material={m}
                  courseState={cs}
                  accent={accent}
                  progressGradient={progressGradient}
                  onOpenLink={(url) => handleOpenLink(m.id, url)}
                  onComplete={() => markComplete(m.id)}
                />
              )}
            </div>
          )
        })}
      </div>

      {allDone && (
        <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" strokeWidth={2} />
          <p className="text-sm text-emerald-800 font-medium">所有课程已学完，可以参加知识测试了！</p>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────
// 单个课程教室内容
// ─────────────────────────────────────────────────
function CourseRoom({
  material, courseState, accent, progressGradient, onOpenLink, onComplete,
}: {
  material: Material
  courseState: CourseState
  accent: AccentTheme
  progressGradient: string
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
    <div className={`border-t px-5 py-5 bg-paper/50 space-y-4 ${accent.softBorder}`}>

      {/* 已完成 */}
      {material.completed ? (
        <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-lg">
          <PartyPopper className="w-6 h-6 text-emerald-600 flex-shrink-0" strokeWidth={2} />
          <div>
            <p className="text-sm font-semibold text-emerald-800">本课程已完成学习</p>
            {material.contentUrl ? (
              <button
                onClick={() => window.open(material.contentUrl!, '_blank', 'noopener')}
                className={`text-xs underline underline-offset-2 hover:no-underline mt-0.5 inline-flex items-center gap-1 ${accent.text}`}
              >点此复习 <ExternalLink className="w-3 h-3" strokeWidth={2} /></button>
            ) : (
              <a href={`/newbie/learn/${material.id}`}
                className={`text-xs underline underline-offset-2 hover:no-underline mt-0.5 inline-flex items-center gap-1 ${accent.text}`}>
                点此复习 <ArrowRight className="w-3 h-3" strokeWidth={2} />
              </a>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">

          {/* 说明栏 */}
          <div className={`flex items-start gap-3 px-4 py-3 bg-paper rounded-lg border text-sm text-cocoa-600 leading-relaxed ${accent.softBorder}`}>
            {material.contentType === 'pdf'
              ? <FileText className={`w-5 h-5 mt-0.5 flex-shrink-0 ${accent.text}`} strokeWidth={2} />
              : <Link2 className={`w-5 h-5 mt-0.5 flex-shrink-0 ${accent.text}`} strokeWidth={2} />}
            <div>
              {material.contentType === 'pdf'
                ? 'PDF 将在新标签页打开。系统会追踪你在阅读窗口的时长，切回此页计时自动暂停。'
                : '课程链接将在新标签页打开。系统会追踪你在阅读窗口的时长，切回此页计时自动暂停。'}
              {minSec > 0 && (
                <span className="flex items-center gap-1 text-xs text-cocoa-400 mt-1">
                  <Timer className="w-3.5 h-3.5" strokeWidth={2} /> 需在阅读窗口累计停留至少 {Math.ceil(minSec / 60)} 分钟
                </span>
              )}
            </div>
          </div>

          {/* 未打开：只显示打开按钮 */}
          {!linkOpened ? (
            !material.contentUrl ? (
              <Link
                href={`/newbie/learn/${material.id}`}
                className={`flex items-center justify-center gap-2 w-full py-3 rounded-lg text-center text-sm font-medium transition-all active:scale-[0.98] hover:-translate-y-0.5 hover:shadow-subtle ${accent.btn}`}
              >
                <BookOpen className="w-4 h-4" strokeWidth={2} /> 开始阅读 <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </Link>
            ) : (
              <button
                onClick={() => onOpenLink(material.contentUrl!)}
                className={`flex items-center justify-center gap-2 w-full py-3 rounded-lg text-sm font-medium transition-all active:scale-[0.98] hover:-translate-y-0.5 hover:shadow-subtle ${accent.btn}`}
              >
                {material.contentType === 'pdf'
                  ? <><FileText className="w-4 h-4" strokeWidth={2} /> 在新标签页打开 PDF</>
                  : <><Link2 className="w-4 h-4" strokeWidth={2} /> 在新标签页打开课程</>} <ExternalLink className="w-4 h-4" strokeWidth={2} />
              </button>
            )
          ) : (
            <div className="space-y-3">

              {/* 阅读状态卡 */}
              <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-medium transition-colors
                ${isAway
                  ? `${accent.softBg} ${accent.softBorder} ${accent.text}`
                  : `${accent.softBg} ${accent.softBorder} text-cocoa-500`}`}>
                {isAway
                  ? <BookOpen className="w-5 h-5 flex-shrink-0 animate-pulse" strokeWidth={2} />
                  : <Pause className="w-5 h-5 flex-shrink-0" strokeWidth={2} />}
                <div className="flex-1">
                  {isAway
                    ? <span>正在阅读，计时中…</span>
                    : <span>已切回此页，计时暂停<br/><span className="text-xs font-normal">请切换至阅读窗口继续阅读</span></span>
                  }
                </div>
                <button
                  onClick={() => window.open(material.contentUrl!, '_blank', 'noopener')}
                  className="text-xs underline underline-offset-2 hover:no-underline opacity-70 hover:opacity-100 whitespace-nowrap inline-flex items-center gap-1"
                >重新打开 <ExternalLink className="w-3 h-3" strokeWidth={2} /></button>
              </div>

              {/* 进度条 */}
              {minSec > 0 && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-cocoa-500">有效阅读时长</span>
                    <span className={`font-mono font-semibold inline-flex items-center gap-1 ${readDone ? 'text-emerald-600' : accent.text}`}>
                      {fmt(awaySeconds)} / {fmt(minSec)}
                      {readDone && <Check className="w-3 h-3 text-emerald-600" strokeWidth={2.5} />}
                    </span>
                  </div>
                  <div className="w-full bg-cocoa-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-2 rounded-full transition-all duration-1000"
                      style={{
                        width: `${pct}%`,
                        background: readDone
                          ? 'linear-gradient(90deg,#059669,#10b981)'
                          : progressGradient,
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
                className={`flex items-center justify-center gap-2 w-full py-3 rounded-lg text-sm font-medium transition-all duration-200
                  ${canConfirm
                    ? `${accent.btn} active:scale-[0.98] hover:-translate-y-0.5 hover:shadow-subtle`
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
