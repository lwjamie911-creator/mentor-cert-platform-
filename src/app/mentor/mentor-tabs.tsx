'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dayjs from 'dayjs'
import { Target, BookOpen, Handshake, Sprout, Sun, ClipboardList, Award, RefreshCw, Check, ArrowRight, Lock, ExternalLink, MessageSquare, Pencil } from 'lucide-react'
import { MentorSelfCheckPanel } from './self-check-panel'
import { MentorCoursesPanel } from './courses-panel'
import { MentorProfilePanel } from './mentor-profile-panel'
import { MentorNewbieList } from './newbie-list'
import { NewbieDoneAlert } from './newbie-done-alert'
import { ClassMeetingCard, ReviewSharing, PeerReviewView, type ReviewData, type ClassMeetingData } from '../newbie/meeting-shared'
import type { LucideIcon } from 'lucide-react'
import type { AccentTheme } from './accent-theme'

// ─────────────────────────────────────────────
// 类型
// ─────────────────────────────────────────────
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

interface NewbiePair {
  id: string
  newbieId: string
  newbieName: string | null
  newbieEmail: string
  exam: { score: number; correctCount: number; totalQuestions: number; passed: boolean } | null
  badge: unknown
  learningProgress: { completed: number; total: number }
  goalReview: {
    workGoalUrl: string | null
    month1Url: string | null
    month2Url: string | null
    month3Url: string | null
    debriefUrl: string | null
    workGoalFeedback: string | null
    month1Feedback: string | null
    month2Feedback: string | null
    month3Feedback: string | null
    debriefFeedback: string | null
  }
  review: ReviewData | null
}

interface MentorCert {
  score: number
  expiresAt: string
}

interface Props {
  userId: string
  userName: string
  // 资质自检
  selfCheck: { check1: boolean; check2: boolean; check3: boolean; check4: boolean } | null
  selfCheckDone: boolean
  // 学测闯关
  materials: Material[]
  allMaterialsDone: boolean
  mentorCert: MentorCert | null
  // 师徒结对
  mentorProfile: {
    yearsOfExperience: string | null
    projectExperience: string | null
    highlights: string | null
    photoBase64: string | null
  } | null
  pairs: NewbiePair[]
  newbiesDone: { pairId: string; name: string | null }[]
  // 班会有约
  classMeeting: ClassMeetingData | null
  ownReview: ReviewData
}

type TabKey = 'selfcheck' | 'learn' | 'pairing' | 'guard' | 'meeting'

// 每个页签一套和谐的暖色主题（定义见 accent-theme.ts）
type TabTheme = AccentTheme

const THEMES: Record<TabKey, TabTheme> = {
  // 资质自检 —— 深棕（沉稳）
  selfcheck: {
    bar: 'from-cocoa-700 to-cocoa-500',
    iconActive: 'bg-cocoa-800 text-blush',
    iconIdle: 'bg-cocoa-100 text-cocoa-600',
    titleActive: 'text-cocoa-900',
    ring: 'ring-cocoa-300',
    shellIcon: 'bg-cocoa-100 text-cocoa-700',
    badge: 'bg-cocoa-100 text-cocoa-700',
    btn: 'bg-cocoa-800 text-blush hover:bg-cocoa-900',
    text: 'text-cocoa-700',
    softBg: 'bg-cocoa-50/60',
    softBorder: 'border-cocoa-200',
    iconChip: 'bg-cocoa-100 text-cocoa-700',
    inputFocus: 'focus:border-cocoa-600 focus:ring-cocoa-600/15',
  },
  // 学测闯关 —— 暖黄琥珀（明快）
  learn: {
    bar: 'from-amber-500 to-amber-300',
    iconActive: 'bg-amber-500 text-white',
    iconIdle: 'bg-amber-50 text-amber-600',
    titleActive: 'text-amber-800',
    ring: 'ring-amber-200',
    shellIcon: 'bg-amber-50 text-amber-600',
    badge: 'bg-amber-50 text-amber-700',
    btn: 'bg-amber-500 text-white hover:bg-amber-600',
    text: 'text-amber-700',
    softBg: 'bg-amber-50/60',
    softBorder: 'border-amber-200',
    iconChip: 'bg-amber-50 text-amber-600',
    inputFocus: 'focus:border-amber-500 focus:ring-amber-500/15',
  },
  // 师徒结对 —— 蜜桃玫瑰（温暖）
  pairing: {
    bar: 'from-rose-400 to-rose-300',
    iconActive: 'bg-rose-400 text-white',
    iconIdle: 'bg-rose-50 text-rose-500',
    titleActive: 'text-rose-800',
    ring: 'ring-rose-200',
    shellIcon: 'bg-rose-50 text-rose-500',
    badge: 'bg-rose-50 text-rose-600',
    btn: 'bg-rose-500 text-white hover:bg-rose-600',
    text: 'text-rose-700',
    softBg: 'bg-rose-50/60',
    softBorder: 'border-rose-200',
    iconChip: 'bg-rose-50 text-rose-500',
    inputFocus: 'focus:border-rose-400 focus:ring-rose-400/15',
  },
  // 成长守护 —— 柔绿（生长）
  guard: {
    bar: 'from-emerald-500 to-emerald-300',
    iconActive: 'bg-emerald-500 text-white',
    iconIdle: 'bg-emerald-50 text-emerald-600',
    titleActive: 'text-emerald-800',
    ring: 'ring-emerald-200',
    shellIcon: 'bg-emerald-50 text-emerald-600',
    badge: 'bg-emerald-50 text-emerald-700',
    btn: 'bg-emerald-500 text-white hover:bg-emerald-600',
    text: 'text-emerald-700',
    softBg: 'bg-emerald-50/60',
    softBorder: 'border-emerald-200',
    iconChip: 'bg-emerald-50 text-emerald-600',
    inputFocus: 'focus:border-emerald-500 focus:ring-emerald-500/15',
  },
  // 班会有约 —— 暖橙（活力）
  meeting: {
    bar: 'from-orange-400 to-orange-300',
    iconActive: 'bg-orange-400 text-white',
    iconIdle: 'bg-orange-50 text-orange-500',
    titleActive: 'text-orange-800',
    ring: 'ring-orange-200',
    shellIcon: 'bg-orange-50 text-orange-500',
    badge: 'bg-orange-50 text-orange-600',
    btn: 'bg-orange-500 text-white hover:bg-orange-600',
    text: 'text-orange-700',
    softBg: 'bg-orange-50/60',
    softBorder: 'border-orange-200',
    iconChip: 'bg-orange-50 text-orange-500',
    inputFocus: 'focus:border-orange-400 focus:ring-orange-400/15',
  },
}

const TABS: { key: TabKey; icon: LucideIcon; title: string; subtitle: string }[] = [
  { key: 'selfcheck', icon: Target,    title: '资质自检', subtitle: '导师资质确认' },
  { key: 'learn',     icon: BookOpen,  title: '学测闯关', subtitle: '必学 · 认证' },
  { key: 'pairing',   icon: Handshake, title: '师徒结对', subtitle: '档案 · 认领 · 寄语' },
  { key: 'guard',     icon: Sprout,    title: '成长守护', subtitle: '新人成长追踪' },
  { key: 'meeting',   icon: Sun,       title: '班会有约', subtitle: '预告 · 感言分享' },
]

export function MentorTabs(props: Props) {
  const [active, setActive] = useState<TabKey>('selfcheck')

  const learnBadge = props.materials.length > 0
    ? `${props.materials.filter(m => m.completed).length}/${props.materials.length}`
    : undefined

  return (
    <div className="flex flex-col md:flex-row gap-6 md:gap-10">
      {/* 左侧页签 —— 更宽、更松弛 */}
      <nav className="flex md:flex-col gap-2.5 md:w-64 md:flex-shrink-0 overflow-x-auto md:overflow-visible pb-1 md:pb-0">
        {TABS.map(tab => {
          const isActive = active === tab.key
          const Icon = tab.icon
          const t = THEMES[tab.key]
          return (
            <button
              key={tab.key}
              onClick={() => setActive(tab.key)}
              className={`group relative flex items-center gap-3.5 px-4 py-4 rounded-2xl text-left transition-all duration-200 flex-shrink-0 md:flex-shrink
                ${isActive ? `bg-paper shadow-card ring-1 ${t.ring}` : 'bg-paper/50 hover:bg-paper/80 hover:shadow-sm'}`}
            >
              <span className={`hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-full transition-all duration-200
                ${isActive ? `h-8 bg-gradient-to-b ${t.bar}` : 'h-0 bg-transparent'}`} />
              <span className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200
                ${isActive ? `${t.iconActive} scale-105` : `${t.iconIdle} group-hover:scale-105`}`}>
                <Icon className="w-[19px] h-[19px]" strokeWidth={2} />
              </span>
              <span className="min-w-0">
                <span className={`block text-[15px] font-bold whitespace-nowrap ${isActive ? t.titleActive : 'text-cocoa-700'}`}>
                  {tab.title}
                </span>
                <span className="block text-[11px] text-cocoa-400 whitespace-nowrap mt-0.5">{tab.subtitle}</span>
              </span>
              {tab.key === 'learn' && learnBadge && (
                <span className={`ml-auto hidden md:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded-full flex-shrink-0
                  ${props.allMaterialsDone && props.mentorCert ? 'bg-emerald-100 text-emerald-600' : THEMES.learn.badge}`}>
                  {learnBadge}
                </span>
              )}
              {tab.key === 'guard' && props.pairs.length > 0 && (
                <span className={`ml-auto hidden md:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded-full flex-shrink-0 ${THEMES.guard.badge}`}>
                  {props.pairs.length}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* 右侧内容 */}
      <div className="flex-1 min-w-0">
        {active === 'selfcheck' && <SelfCheckTab userId={props.userId} selfCheck={props.selfCheck} theme={THEMES.selfcheck} />}
        {active === 'learn' && <LearnTab {...props} theme={THEMES.learn} />}
        {active === 'pairing' && <PairingTab {...props} theme={THEMES.pairing} />}
        {active === 'guard' && <GuardTab pairs={props.pairs} newbiesDone={props.newbiesDone} theme={THEMES.guard} />}
        {active === 'meeting' && <MeetingTab classMeeting={props.classMeeting} ownReview={props.ownReview} pairs={props.pairs} theme={THEMES.meeting} />}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// 页签一：资质自检
// ─────────────────────────────────────────────
function SelfCheckTab({ userId, selfCheck, theme }: { userId: string; selfCheck: Props['selfCheck']; theme: TabTheme }) {
  return (
    <Shell title="加入 TEG 秘书中心导师池" icon={<Target className="w-5 h-5" strokeWidth={2} />} iconClass={theme.shellIcon} subtitle="完成资质自检，开启导师认证之路">
      <MentorSelfCheckPanel userId={userId} initialCheck={selfCheck} accent={theme} />
    </Shell>
  )
}

// ─────────────────────────────────────────────
// 页签二：学测闯关
// ─────────────────────────────────────────────
function LearnTab({ userId, materials, selfCheckDone, allMaterialsDone, mentorCert, theme }: Props & { theme: TabTheme }) {
  return (
    <div className="space-y-5">
      {/* TEG 秘书中心导师必学 */}
      <StepCard
        step={1}
        title="TEG 秘书中心导师必学"
        done={allMaterialsDone && !!selfCheckDone}
        locked={!selfCheckDone}
        lockedHint="请先完成资质自检"
        badge={materials.length > 0 ? `${materials.filter(m => m.completed).length}/${materials.length} 门` : undefined}
        ringClass={theme.ring}
        badgeClass={theme.badge}
        stepClass={theme.iconActive}
      >
        <MentorCoursesPanel userId={userId} initialMaterials={materials} accent={theme} />
      </StepCard>

      {/* 导师测试与认证 */}
      <StepCard
        step={2}
        title="导师测试与认证"
        done={!!mentorCert}
        locked={!selfCheckDone || !allMaterialsDone}
        lockedHint={!selfCheckDone ? '请先完成资质自检' : '请先完成所有必学课程'}
        ringClass={theme.ring}
        stepClass={theme.iconActive}
      >
        {mentorCert ? (
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <p className="text-sm text-cocoa-500 mb-1">考试得分</p>
              <p className="text-3xl font-bold text-cocoa-800">{mentorCert.score} <span className="text-base font-normal text-cocoa-400">分</span></p>
              <p className="text-xs text-cocoa-400 mt-1">证书有效期至 {dayjs(mentorCert.expiresAt).format('YYYY年MM月DD日')}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Link href="/mentor/certificate"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-cocoa-800 border border-cocoa-300 hover:bg-cocoa-50 transition-all active:scale-[0.97] hover:-translate-y-0.5">
                <Award className="w-4 h-4" strokeWidth={2} /> 查看认证证书
              </Link>
              <Link href="/mentor/exam"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-cocoa-600 border border-cocoa-200 hover:border-cocoa-400 hover:text-cocoa-800 transition-all active:scale-[0.97] hover:-translate-y-0.5">
                <RefreshCw className="w-4 h-4" strokeWidth={2} /> 重新测试
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <p className="text-sm text-cocoa-500">共 5 题，将从题库随机抽取，所有问题内容均来自 TEG 秘书中心导师必学课程</p>
              <p className="text-xs text-cocoa-400 mt-0.5">80 分及以上视为通过，即时颁发导师认证证书</p>
            </div>
            <Link href="/mentor/exam"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-paper bg-cocoa-800 transition-all active:scale-[0.97] hover:-translate-y-0.5 hover:bg-cocoa-900 hover:shadow-subtle">
              开始测试 <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </Link>
          </div>
        )}
      </StepCard>
    </div>
  )
}

// ─────────────────────────────────────────────
// 页签三：师徒结对
// ─────────────────────────────────────────────
function PairingTab({ userId, mentorProfile, pairs, mentorCert, theme }: Props & { theme: TabTheme }) {
  return (
    <div className="space-y-5">
      {/* 我的导师档案 */}
      <Shell title="我的导师档案" icon={<ClipboardList className="w-5 h-5" strokeWidth={2} />} iconClass={theme.shellIcon} subtitle="完善档案，让你的新人更了解你">
        <MentorProfilePanel initialProfile={mentorProfile} accent={theme} />
      </Shell>

      {/* 认领新人 + 寄语 */}
      <StepCard
        step={0}
        title="我的新人"
        done={false}
        locked={!mentorCert}
        lockedHint="请先完成认证，加入导师池后解锁"
        ringClass={theme.ring}
        hideStep
      >
        <MentorNewbieList mentorId={userId} pairs={pairs} accent={theme} />
      </StepCard>
    </div>
  )
}

// ─────────────────────────────────────────────
// 页签四：成长守护（新人成长追踪）
// ─────────────────────────────────────────────
function GuardTab({ pairs, newbiesDone, theme }: { pairs: NewbiePair[]; newbiesDone: { pairId: string; name: string | null }[]; theme: TabTheme }) {
  if (pairs.length === 0) {
    return (
      <Shell title="成长守护" icon={<Sprout className="w-5 h-5" strokeWidth={2} />} iconClass={theme.shellIcon}>
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-cocoa-400">
          <Sprout className="w-10 h-10" strokeWidth={1.5} />
          <p className="text-sm text-cocoa-500">你还没有认领新人</p>
          <p className="text-xs text-cocoa-400">在「师徒结对」页签认领新人后，这里可追踪他们的成长</p>
        </div>
      </Shell>
    )
  }
  return (
    <div className="space-y-5">
      <NewbieDoneAlert newbiesDone={newbiesDone} />
      {pairs.map(p => <NewbieGuardCard key={p.id} pair={p} theme={theme} />)}
    </div>
  )
}

function NewbieGuardCard({ pair, theme }: { pair: NewbiePair; theme: TabTheme }) {
  const lp = pair.learningProgress
  const pct = lp.total > 0 ? Math.round((lp.completed / lp.total) * 100) : 0
  return (
    <Shell title={pair.newbieName ?? pair.newbieEmail} icon={<Sprout className="w-5 h-5" strokeWidth={2} />} iconClass={theme.shellIcon} subtitle={pair.newbieEmail}>
      <div className="space-y-4">
        {/* 必修课学习进度 */}
        <div>
          <div className="flex justify-between text-xs text-cocoa-500 mb-1.5">
            <span>必修课学习进度</span>
            <span className={`font-semibold ${lp.completed === lp.total && lp.total > 0 ? 'text-green-600' : 'text-cocoa-700'}`}>
              {lp.completed}/{lp.total} 门 · {pct}%
            </span>
          </div>
          <div className="w-full bg-cocoa-100 rounded-full h-1.5">
            <div className="h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, background: pct === 100 ? 'linear-gradient(90deg,#22c55e,#16a34a)' : 'linear-gradient(90deg,#7a4230,#b87a5e)' }} />
          </div>
        </div>

        {/* 测试成绩 */}
        <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-cocoa-50/60">
          <span className="text-sm text-cocoa-600">知识测试成绩</span>
          {pair.exam ? (
            <span className={`inline-flex items-center gap-1 text-sm font-semibold ${pair.exam.passed ? 'text-green-600' : 'text-cocoa-500'}`}>
              {pair.exam.score} 分 · {pair.exam.correctCount}/{pair.exam.totalQuestions} 题 · {pair.exam.passed ? <>已通过 <Check className="w-3.5 h-3.5" strokeWidth={2.5} /></> : '未通过'}
            </span>
          ) : (
            <span className="text-sm text-cocoa-400">未参加</span>
          )}
        </div>

        {/* 试用期工作目标 */}
        <GuardDocRow label="试用期工作目标" url={pair.goalReview.workGoalUrl}
          newbieId={pair.newbieId} field="workGoalFeedback" feedback={pair.goalReview.workGoalFeedback} theme={theme} />

        {/* 1-3 个月月报 */}
        <div className="space-y-2">
          <p className="text-xs text-cocoa-400">1-3 个月月报</p>
          <GuardDocRow label="第 1 个月月报" url={pair.goalReview.month1Url}
            newbieId={pair.newbieId} field="month1Feedback" feedback={pair.goalReview.month1Feedback} theme={theme} compact />
          <GuardDocRow label="第 2 个月月报" url={pair.goalReview.month2Url}
            newbieId={pair.newbieId} field="month2Feedback" feedback={pair.goalReview.month2Feedback} theme={theme} compact />
          <GuardDocRow label="第 3 个月月报" url={pair.goalReview.month3Url}
            newbieId={pair.newbieId} field="month3Feedback" feedback={pair.goalReview.month3Feedback} theme={theme} compact />
        </div>

        {/* 新人述职 */}
        <GuardDocRow label="新人述职" url={pair.goalReview.debriefUrl}
          newbieId={pair.newbieId} field="debriefFeedback" feedback={pair.goalReview.debriefFeedback} theme={theme} />
      </div>
    </Shell>
  )
}

function GuardDocRow({ label, url, newbieId, field, feedback, theme, compact }: {
  label: string
  url: string | null
  newbieId: string
  field: 'workGoalFeedback' | 'month1Feedback' | 'month2Feedback' | 'month3Feedback' | 'debriefFeedback'
  feedback: string | null
  theme: TabTheme
  compact?: boolean
}) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(feedback ?? '')
  const [current, setCurrent] = useState(feedback)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function save() {
    setSaving(true)
    setError('')
    let res: Response
    try {
      res = await fetch('/api/mentor/goal-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newbieId, field, feedback: draft }),
      })
    } catch {
      setSaving(false)
      setError('网络错误，请重试')
      return
    }
    setSaving(false)
    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      setError(d.error || `保存失败（${res.status}）`)
      return
    }
    const trimmed = draft.trim()
    setCurrent(trimmed || null)
    setEditing(false)
    router.refresh()
  }

  return (
    <div className={`rounded-lg border ${url || current ? theme.softBorder : 'border-line'} ${url || current ? theme.softBg : 'bg-paper'}`}>
      <div className={`flex items-center justify-between gap-3 ${compact ? 'px-3 py-2' : 'px-4 py-3'}`}>
        <span className={`${compact ? 'text-xs' : 'text-sm'} text-cocoa-600`}>{label}</span>
        {url ? (
          <a href={url} target="_blank" rel="noopener noreferrer"
            className={`inline-flex items-center gap-1 text-xs font-medium hover:underline flex-shrink-0 ${theme.text}`}>查看文档 <ExternalLink className="w-3 h-3" strokeWidth={2} /></a>
        ) : (
          <span className="text-xs text-cocoa-400 flex-shrink-0">未提交</span>
        )}
      </div>

      {/* 导师评语区 —— 仅在新人已提交文档时可写 */}
      {url && (
        <div className="px-3 pb-3 sm:px-4">
          {editing ? (
            <div className="space-y-2">
              <textarea
                value={draft}
                onChange={e => setDraft(e.target.value)}
                rows={3}
                placeholder="写下你对这份内容的反馈评语…"
                className={`w-full px-3 py-2 border rounded-lg text-xs text-cocoa-900 placeholder:text-cocoa-400 bg-paper focus:outline-none focus:ring-2 transition-all resize-y ${theme.inputFocus} ${theme.softBorder}`}
              />
              <div className="flex gap-2">
                <button onClick={save} disabled={saving}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-[0.97] disabled:opacity-60 ${theme.btn}`}>
                  {saving ? '保存中…' : '保存评语'}
                </button>
                <button onClick={() => { setEditing(false); setDraft(current ?? '') }}
                  className="px-3 py-1.5 rounded-lg text-xs text-cocoa-500 border border-line hover:bg-cocoa-50 transition-colors">
                  取消
                </button>
              </div>
              {error && <p className="text-xs text-red-500">{error}</p>}
            </div>
          ) : current ? (
            <div className={`flex items-start gap-2 rounded-lg bg-paper/70 px-3 py-2 text-xs`}>
              <MessageSquare className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${theme.text}`} strokeWidth={2} />
              <p className="flex-1 text-cocoa-700 leading-relaxed whitespace-pre-wrap">{current}</p>
              <button onClick={() => { setDraft(current); setEditing(true) }}
                className="text-cocoa-400 hover:text-cocoa-700 transition-colors flex-shrink-0"><Pencil className="w-3 h-3" strokeWidth={2} /></button>
            </div>
          ) : (
            <button onClick={() => { setDraft(''); setEditing(true) }}
              className={`inline-flex items-center gap-1 text-xs font-medium transition-colors ${theme.text} hover:underline`}>
              <MessageSquare className="w-3.5 h-3.5" strokeWidth={2} /> 添加评语
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// 页签五：班会有约
// ─────────────────────────────────────────────
function MeetingTab({ classMeeting, ownReview, pairs, theme }: {
  classMeeting: ClassMeetingData | null
  ownReview: ReviewData
  pairs: NewbiePair[]
  theme: TabTheme
}) {
  return (
    <div className="space-y-5">
      <ClassMeetingCard classMeeting={classMeeting} />
      <ReviewSharing initial={ownReview} role="mentor" />
      {/* 名下新人的感言 */}
      {pairs.map(p => (
        <PeerReviewView
          key={p.id}
          authorName={`新人 ${p.newbieName ?? p.newbieEmail}`}
          review={p.review}
          emptyHint="该新人还没有写班会感言～"
        />
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────
// 通用组件
// ─────────────────────────────────────────────
function Shell({ title, icon, subtitle, iconClass, children }: {
  title: string; icon: React.ReactNode; subtitle?: string; iconClass?: string; children: React.ReactNode
}) {
  return (
    <section className="bg-paper rounded-2xl border border-line shadow-card overflow-hidden animate-fade-up">
      <div className="flex items-center gap-3.5 px-6 sm:px-8 py-5 border-b border-line/70">
        <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconClass ?? 'bg-cocoa-100 text-cocoa-700'}`}>{icon}</span>
        <div>
          <h2 className="font-display font-semibold text-cocoa-900 text-base">{title}</h2>
          {subtitle && <p className="text-xs text-cocoa-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="px-6 sm:px-8 py-6">{children}</div>
    </section>
  )
}

function StepCard({ step, title, done, locked, lockedHint, badge, hideStep, ringClass, badgeClass, stepClass, children }: {
  step: number
  title: string
  done: boolean
  locked: boolean
  lockedHint?: string
  badge?: string
  hideStep?: boolean
  ringClass?: string
  badgeClass?: string
  stepClass?: string
  children?: React.ReactNode
}) {
  return (
    <section className={`bg-paper rounded-2xl border transition-all duration-300 overflow-hidden shadow-card animate-fade-up
      ${locked ? 'border-line opacity-50 pointer-events-none' : `border-line ring-1 ${ringClass ?? 'ring-cocoa-200'}`}`}>
      <div className="flex items-center gap-3 px-6 sm:px-8 py-5 border-b border-line/70">
        {!hideStep && (
          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
            ${locked ? 'bg-cocoa-100 text-cocoa-400' : done ? 'bg-emerald-100 text-emerald-700' : (stepClass ?? 'bg-cocoa-800 text-blush')}`}>
            {done ? <Check className="w-4 h-4" strokeWidth={2.5} /> : step}
          </span>
        )}
        <h2 className="font-display font-semibold text-cocoa-900 flex-1 text-base">{title}</h2>
        {done && <span className="text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full font-medium">已完成</span>}
        {locked && lockedHint && (
          <span className="inline-flex items-center gap-1 text-xs text-cocoa-400 bg-cocoa-50 px-2.5 py-1 rounded-full">
            <Lock className="w-3 h-3" strokeWidth={2} /> {lockedHint}
          </span>
        )}
        {badge && <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${badgeClass ?? 'bg-cocoa-100 text-cocoa-700'}`}>{badge}</span>}
      </div>
      {!locked && <div className="px-6 sm:px-8 py-6">{children}</div>}
    </section>
  )
}
