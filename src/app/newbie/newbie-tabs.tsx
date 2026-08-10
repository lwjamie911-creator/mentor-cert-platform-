'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Bird, KeyRound, Target, Compass, Sun, GraduationCap,
  ExternalLink, BookOpen, Check, Plus, Pencil, Egg, ArrowRight,
  CalendarDays, Lock, MessageSquare,
  type LucideIcon,
} from 'lucide-react'
import { MentorLetterBanner } from './mentor-letter-banner'
import { MentorProfileViewer } from './mentor-profile-viewer'
import { NewbieCoursesPanel } from './courses-panel'
import { isTencentDocUrl } from '@/lib/utils'
import {
  SectionShell,
  ClassMeetingCard,
  ReviewSharing,
  PeerReviewView,
  type ReviewData,
  type ClassMeetingData,
} from './meeting-shared'
import type { AccentTheme } from '../mentor/accent-theme'

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

interface ExamData {
  score: number
  correctCount: number
  totalQuestions: number
  passed: boolean
}

interface GoalReview {
  workGoalUrl: string | null
  month1Url: string | null
  month2Url: string | null
  month3Url: string | null
  workGoalFeedback: string | null
  month1Feedback: string | null
  month2Feedback: string | null
  month3Feedback: string | null
}

interface Props {
  userId: string
  userName: string
  materials: Material[]
  allMaterialsDone: boolean
  exam: ExamData | null
  hasBadge: boolean
  mentor: {
    isConfirmed: boolean
    mentorId: string | null
    mentorName: string | null
    mentorMessage: string | null
  } | null
  goalReview: GoalReview
  review: ReviewData
  classMeeting: ClassMeetingData | null
  mentorReview: ReviewData | null
}

const SECRET_DOC_URL =
  'https://doc.weixin.qq.com/sheet/e3_AMAAPgaIAE0CN4kvTX8L9T3ax9Boq?scode=AJEAIQdfAAos7OYZA0AIUAqgZGACg&tab=BB08J2'

type TabKey = 'mentor' | 'secret' | 'learn' | 'review' | 'meeting'

// 每个页签一套完整主题（定义见 mentor/accent-theme.ts），保证页签内所有元素配色统一。
// 新人专区以「粉」为基调，各页签轮换和谐点缀，一眼可辨。
type TabTheme = AccentTheme

const THEMES: Record<TabKey, TabTheme> = {
  // 遇见鹅导 —— petal 粉（新人主色）
  mentor: {
    bar: 'from-petal-600 to-petal-800',
    iconActive: 'bg-petal-100 text-petal-700',
    iconIdle: 'bg-petal-100 text-petal-600',
    titleActive: 'text-petal-900',
    ring: 'ring-petal-200',
    shellIcon: 'bg-petal-100 text-petal-700',
    badge: 'bg-petal-100 text-petal-700',
    btn: 'bg-petal-700 text-paper hover:bg-petal-800',
    text: 'text-petal-700',
    softBg: 'bg-petal-50/60',
    softBorder: 'border-petal-200',
    iconChip: 'bg-petal-100 text-petal-700',
    inputFocus: 'focus:border-petal-500 focus:ring-petal-500/15',
  },
  // 解锁秘籍 —— amber 暖黄
  secret: {
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
  // 学测闯关 —— emerald 柔绿
  learn: {
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
  // 目标复盘 —— rose 玫瑰
  review: {
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
  // 班会有约 —— petal 粉（与导师端班会橙区分，回归新人主色）
  meeting: {
    bar: 'from-petal-600 to-petal-800',
    iconActive: 'bg-petal-100 text-petal-700',
    iconIdle: 'bg-petal-100 text-petal-600',
    titleActive: 'text-petal-900',
    ring: 'ring-petal-200',
    shellIcon: 'bg-petal-100 text-petal-700',
    badge: 'bg-petal-100 text-petal-700',
    btn: 'bg-petal-700 text-paper hover:bg-petal-800',
    text: 'text-petal-700',
    softBg: 'bg-petal-50/60',
    softBorder: 'border-petal-200',
    iconChip: 'bg-petal-100 text-petal-700',
    inputFocus: 'focus:border-petal-500 focus:ring-petal-500/15',
  },
}

const TABS: { key: TabKey; icon: LucideIcon; title: string; subtitle: string }[] = [
  { key: 'mentor', icon: Bird, title: '遇见鹅导', subtitle: '你的专属导师' },
  { key: 'secret', icon: KeyRound, title: '解锁秘籍', subtitle: '成长资源包' },
  { key: 'learn',  icon: Target, title: '学测闯关', subtitle: '课程 · 测试 · 证书' },
  { key: 'review', icon: Compass, title: '目标复盘', subtitle: '阶段性回顾' },
  { key: 'meeting', icon: Sun, title: '班会有约', subtitle: '预告 · 感言分享' },
]

// 成长时间轴（参照产品图）
const TIMELINE = [
  { period: '第 1 个月',    words: ['融入', '尝试'] },
  { period: '第 2 个月',    words: ['协作', '探索'] },
  { period: '第 3 个月',    words: ['统筹', '思考'] },
  { period: '第 4-6 个月',  words: ['精进', '成长'] },
  { period: '第 7-12 个月', words: ['沉淀', '反哺'] },
]

export function NewbieTabs({
  userId, materials, allMaterialsDone, exam, hasBadge, mentor, goalReview, review, classMeeting, mentorReview,
}: Props) {
  const [active, setActive] = useState<TabKey>('mentor')

  const completedCount = materials.filter(m => m.completed).length
  const learnBadge = materials.length > 0 ? `${completedCount}/${materials.length}` : undefined

  return (
    <div className="flex flex-col md:flex-row gap-5 md:gap-6">

      {/* ── 左侧页签（桌面竖排 / 移动横向滚动） ── */}
      <nav className="flex md:flex-col gap-2 md:w-52 md:flex-shrink-0 overflow-x-auto md:overflow-visible pb-1 md:pb-0">
        {TABS.map(tab => {
          const isActive = active === tab.key
          const Icon = tab.icon
          const t = THEMES[tab.key]
          return (
            <button
              key={tab.key}
              onClick={() => setActive(tab.key)}
              className={`group relative flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left transition-all duration-200 flex-shrink-0 md:flex-shrink
                ${isActive
                  ? `bg-paper shadow-card ring-1 ${t.ring}`
                  : 'bg-paper/50 hover:bg-paper/80 hover:shadow-card'}`}
            >
              {/* 选中态左侧色条（仅桌面） */}
              <span className={`hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-full transition-all duration-200
                ${isActive ? `h-7 bg-gradient-to-b ${t.bar}` : 'h-0 bg-transparent'}`} />
              <span className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200
                ${isActive ? `${t.iconActive} scale-105` : `${t.iconIdle} group-hover:brightness-95`}`}>
                <Icon className="w-5 h-5" strokeWidth={2} />
              </span>
              <span className="min-w-0">
                <span className={`block text-sm font-semibold whitespace-nowrap ${isActive ? t.titleActive : 'text-cocoa-700'}`}>
                  {tab.title}
                </span>
                <span className="block text-[11px] text-cocoa-400 whitespace-nowrap">{tab.subtitle}</span>
              </span>
              {/* 学测闯关进度徽标 */}
              {tab.key === 'learn' && learnBadge && (
                <span className={`ml-auto hidden md:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded-full flex-shrink-0
                  ${allMaterialsDone && exam?.passed ? 'bg-emerald-600 text-white' : THEMES.learn.badge}`}>
                  {learnBadge}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* ── 右侧内容区 ── */}
      <div className="flex-1 min-w-0">
        {active === 'mentor' && <MentorTab mentor={mentor} theme={THEMES.mentor} />}
        {active === 'secret' && <SecretTab theme={THEMES.secret} />}
        {active === 'learn'  && (
          <LearnTab
            userId={userId}
            materials={materials}
            allMaterialsDone={allMaterialsDone}
            exam={exam}
            hasBadge={hasBadge}
            theme={THEMES.learn}
          />
        )}
        {active === 'review' && <ReviewTab goalReview={goalReview} theme={THEMES.review} />}
        {active === 'meeting' && <MeetingTab review={review} classMeeting={classMeeting} mentorReview={mentorReview} mentorName={mentor?.mentorName ?? null} />}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// 页签一：遇见鹅导
// ─────────────────────────────────────────────
function MentorTab({ mentor, theme }: { mentor: Props['mentor']; theme: TabTheme }) {
  if (!mentor?.isConfirmed) {
    return (
      <SectionShell title="遇见鹅导" icon={<Bird className="w-4 h-4" strokeWidth={2} />}>
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-petal-400">
          <Egg className="w-10 h-10" strokeWidth={1.5} />
          <p className="text-sm text-cocoa-500">你还没有绑定导师，或导师尚未确认</p>
          <p className="text-xs text-cocoa-400">导师确认后，这里会出现 ta 的寄语与档案</p>
        </div>
      </SectionShell>
    )
  }

  return (
    <SectionShell title="遇见鹅导" icon={<Bird className="w-4 h-4" strokeWidth={2} />}>
      <div className="space-y-5">
        {mentor.mentorMessage && (
          <MentorLetterBanner mentorName={mentor.mentorName} message={mentor.mentorMessage} accent={theme} />
        )}
        {mentor.mentorId && (
          <MentorProfileViewer mentorId={mentor.mentorId} mentorName={mentor.mentorName ?? '你的导师'} accent={theme} />
        )}
      </div>
    </SectionShell>
  )
}

// ─────────────────────────────────────────────
// 页签二：解锁秘籍
// ─────────────────────────────────────────────
function SecretTab({ theme }: { theme: TabTheme }) {
  return (
    <SectionShell title="解锁秘籍" icon={<KeyRound className="w-4 h-4" strokeWidth={2} />} subtitle="秘书中心新人培养路线（2026 版）">
      <div className="space-y-8">
        {/* 成长时间轴 */}
        <div className="relative px-1 py-4">
          {/* 连接线 */}
          <div className="absolute left-4 right-4 top-8 h-0.5 bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200" />
          <div className="relative grid grid-cols-5 gap-1">
            {TIMELINE.map((node, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                {/* 节点圆点 */}
                <div className="w-8 h-8 rounded-full bg-paper border-2 border-amber-400 flex items-center justify-center text-xs font-bold text-amber-700 shadow-card relative z-10">
                  {i + 1}
                </div>
                <p className="mt-2.5 text-[11px] sm:text-xs font-bold text-amber-800 whitespace-nowrap">{node.period}</p>
                <div className="mt-1.5 flex flex-col items-center gap-0.5">
                  {node.words.map(w => (
                    <span key={w} className="text-[11px] sm:text-xs text-cocoa-500">{w}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 说明 */}
        <p className="text-center text-xs text-cocoa-500 leading-relaxed">
          从入职融入到独当一面，秘书中心为你规划了 12 个月的成长路径。<br className="hidden sm:block" />
          点击下方查看完整的新人资源包，解锁每个阶段的学习秘籍。
        </p>

        {/* 醒目跳转按钮 —— 解锁秘籍页签点缀暖黄 */}
        <div className="flex justify-center">
          <a
            href={SECRET_DOC_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2.5 px-8 py-4 rounded-lg font-medium text-sm shadow-subtle transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] ${theme.btn}`}
          >
            <BookOpen className="w-5 h-5" strokeWidth={2} />
            点击查看秘籍详情
            <ExternalLink className="w-4 h-4" strokeWidth={2} />
          </a>
        </div>
      </div>
    </SectionShell>
  )
}

// ─────────────────────────────────────────────
// 页签三：学测闯关
// ─────────────────────────────────────────────
function LearnTab({
  userId, materials, allMaterialsDone, exam, hasBadge, theme,
}: {
  userId: string
  materials: Material[]
  allMaterialsDone: boolean
  exam: ExamData | null
  hasBadge: boolean
  theme: TabTheme
}) {
  return (
    <div className="space-y-5">
      {/* 证书横幅 */}
      {hasBadge && (
        <div className="rounded-2xl p-5 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)' }}>
          <GraduationCap className="absolute top-2 right-2 w-24 h-24 text-white/10" strokeWidth={1.5} />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-4">
            <span className="w-12 h-12 rounded-xl bg-paper/15 flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-6 h-6 text-white" strokeWidth={2} />
            </span>
            <div className="flex-1 text-paper">
              <h2 className="text-lg font-display font-bold mb-0.5">恭喜完成必修学习和测试！</h2>
              <p className="text-white/90 text-sm">你已获得新人成长课程结业证书，记录你的成长里程碑</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Link href="/newbie/certificate"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-paper text-emerald-700 rounded-lg text-sm font-medium hover:-translate-y-0.5 hover:shadow-subtle transition-all active:scale-[0.97]">
                <GraduationCap className="w-4 h-4" strokeWidth={2} /> 查看结业证书 <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 步骤一：必修课堂 */}
      <StepCard
        step={1}
        title="新人必修课堂"
        done={allMaterialsDone}
        locked={false}
        badge={materials.length > 0 ? `${materials.filter(m => m.completed).length}/${materials.length} 门` : undefined}
        theme={theme}
      >
        <NewbieCoursesPanel userId={userId} initialMaterials={materials} accent={theme} />
      </StepCard>

      {/* 步骤二：知识测试与成长证书 */}
      <StepCard
        step={2}
        title="知识测试与成长证书"
        done={!!exam?.passed}
        locked={!allMaterialsDone}
        lockedHint="请先完成所有课程"
        doneHint={exam?.passed ? `${exam.score} 分通过` : undefined}
        theme={theme}
      >
        {exam ? (
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <p className="text-sm text-cocoa-500 mb-1">客观题得分</p>
              <p className={`text-3xl font-display font-bold ${exam.passed ? 'text-emerald-600' : theme.text}`}>{exam.score} <span className="text-base font-normal text-cocoa-400">分</span></p>
              <p className="text-xs text-cocoa-400 mt-1">{exam.correctCount}/{exam.totalQuestions} 题正确 · {exam.passed ? '已通过' : '未通过'}</p>
            </div>
            {!exam.passed && (
              <Link href="/newbie/exam"
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium hover:-translate-y-0.5 hover:shadow-subtle transition-all active:scale-[0.97] ${theme.btn}`}>
                重新测试 <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </Link>
            )}
            {exam.passed && (
              <div className="flex gap-2">
                <Link href="/newbie/certificate"
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium hover:-translate-y-0.5 hover:shadow-subtle transition-all active:scale-[0.97] ${theme.btn}`}>
                  <GraduationCap className="w-4 h-4" strokeWidth={2} /> 查看结业证书
                </Link>
                <Link href="/newbie/exam"
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition-all active:scale-[0.97] hover:-translate-y-0.5 ${theme.text} ${theme.softBorder} hover:bg-cocoa-50`}>
                  重考
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <p className="text-sm text-cocoa-600">从题库随机抽取题目，含连线题</p>
              <p className="text-xs text-cocoa-400 mt-0.5">80 分及以上视为通过，即可获得新人成长课程结业证书</p>
            </div>
            <Link href="/newbie/exam"
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium hover:-translate-y-0.5 hover:shadow-subtle transition-all active:scale-[0.97] ${theme.btn}`}>
              开始测试 <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </Link>
          </div>
        )}
      </StepCard>
    </div>
  )
}

// ─────────────────────────────────────────────
// 页签四：目标复盘
// ─────────────────────────────────────────────
function ReviewTab({ goalReview, theme }: {
  goalReview: GoalReview
  theme: TabTheme
}) {
  return (
    <div className="space-y-5">
      {/* 第一项：同步新员工工作目标 */}
      <SectionShell title="提交TEG秘书中心新员工试用期工作目标" icon={<Target className="w-4 h-4" strokeWidth={2} />}>
        <p className="text-xs text-cocoa-500 leading-relaxed mb-4">
          请将已经填写完成的《TEG 办公室秘书中心新员工试用期工作目标》，以腾讯在线文档的链接格式进行提交。
        </p>
        <DocLinkRow
          field="workGoalUrl"
          label="试用期工作目标"
          initialUrl={goalReview.workGoalUrl}
          feedback={goalReview.workGoalFeedback}
          theme={theme}
        />
      </SectionShell>

      {/* 第二项：前 3 个月月报 */}
      <SectionShell title="TEG秘书中心新员工1-3个月月报" icon={<CalendarDays className="w-4 h-4" strokeWidth={2} />} subtitle="在第 1、2、3 个月末，分别提交按月报模板梳理的内容文档">
        <div className="space-y-3">
          <DocLinkRow field="month1Url" label="第 1 个月月报" initialUrl={goalReview.month1Url} feedback={goalReview.month1Feedback} theme={theme} />
          <DocLinkRow field="month2Url" label="第 2 个月月报" initialUrl={goalReview.month2Url} feedback={goalReview.month2Feedback} theme={theme} />
          <DocLinkRow field="month3Url" label="第 3 个月月报" initialUrl={goalReview.month3Url} feedback={goalReview.month3Feedback} theme={theme} />
        </div>
      </SectionShell>
    </div>
  )
}

// ─────────────────────────────────────────────
// 页签五：班会有约（班会预告 + 班会感言）
// ─────────────────────────────────────────────
function MeetingTab({ review, classMeeting, mentorReview, mentorName }: {
  review: ReviewData
  classMeeting: ClassMeetingData | null
  mentorReview: ReviewData | null
  mentorName: string | null
}) {
  return (
    <div className="space-y-5">
      <ClassMeetingCard classMeeting={classMeeting} />
      <ReviewSharing initial={review} role="newbie" />
      {/* 导师的感言（只读） */}
      <PeerReviewView
        authorName={mentorName ? `导师 ${mentorName}` : '你的导师'}
        review={mentorReview}
        emptyHint="你的导师还没有写班会感言～"
      />
    </div>
  )
}

// 单行文档链接提交/展示/编辑
function DocLinkRow({
  field, label, initialUrl, feedback, theme,
}: {
  field: 'workGoalUrl' | 'month1Url' | 'month2Url' | 'month3Url'
  label: string
  initialUrl: string | null
  feedback?: string | null
  theme: TabTheme
}) {
  const router = useRouter()
  const [url, setUrl] = useState(initialUrl)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(initialUrl ?? '')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function save() {
    const trimmed = draft.trim()
    if (trimmed && !isTencentDocUrl(trimmed)) {
      setError('请提供腾讯文档链接（doc.weixin.qq.com）')
      return
    }
    setSaving(true)
    setError('')
    const res = await fetch('/api/newbie/goal-review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ field, url: trimmed }),
    })
    setSaving(false)
    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      setError(d.error || '保存失败，请重试')
      return
    }
    setUrl(trimmed || null)
    setEditing(false)
    router.refresh()
  }

  const hasUrl = !!url

  // 导师评语（只读，新人可见）
  const feedbackBlock = feedback?.trim() ? (
    <div className="mt-2 flex items-start gap-2 rounded-lg bg-blush/40 px-4 py-2.5">
      <MessageSquare className="w-4 h-4 text-sienna flex-shrink-0 mt-0.5" strokeWidth={2} />
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-sienna mb-0.5">导师评语</p>
        <p className="text-xs text-cocoa-700 leading-relaxed whitespace-pre-wrap">{feedback}</p>
      </div>
    </div>
  ) : null

  // 已提交且非编辑态：展示链接 + 编辑（已提交 = 完成，用柔绿点缀）
  if (hasUrl && !editing) {
    return (
      <div>
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-emerald-200 bg-emerald-50/60">
          <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
            <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-cocoa-800">{label}</p>
            <a href={url!} target="_blank" rel="noopener noreferrer"
              className={`text-xs hover:underline underline-offset-2 truncate flex items-center gap-1 ${theme.text}`}>
              查看文档 <ExternalLink className="w-3 h-3" strokeWidth={2} />
            </a>
          </div>
          <button
            onClick={() => { setDraft(url ?? ''); setEditing(true); setError('') }}
            className="text-xs text-cocoa-400 hover:text-cocoa-700 transition-colors flex-shrink-0"
          >
            编辑
          </button>
        </div>
        {feedbackBlock}
      </div>
    )
  }

  // 未提交 或 编辑态：输入框 + 提交
  return (
    <div>
      <div className="px-4 py-3 rounded-lg border border-line bg-paper">
        <div className="flex items-center gap-2 mb-2">
          <span className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${theme.iconChip}`}>
            {hasUrl ? <Pencil className="w-3.5 h-3.5" strokeWidth={2} /> : <Plus className="w-3.5 h-3.5" strokeWidth={2} />}
          </span>
          <p className="text-sm font-medium text-cocoa-800">{label}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="url"
            value={draft}
            onChange={e => { setDraft(e.target.value); setError('') }}
            placeholder="粘贴腾讯文档链接 https://doc.weixin.qq.com/..."
            className={`flex-1 px-3 py-2 border rounded-lg text-sm text-cocoa-900 placeholder:text-cocoa-400 bg-paper focus:outline-none focus:ring-2 focus:bg-paper transition-all ${theme.softBorder} ${theme.inputFocus}`}
          />
          <div className="flex gap-2">
            <button
              onClick={save}
              disabled={saving}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all active:scale-[0.97] disabled:opacity-60 ${theme.btn}`}
            >
              {saving ? '保存中…' : '提交'}
            </button>
            {editing && (
              <button
                onClick={() => { setEditing(false); setError(''); setDraft(url ?? '') }}
                className={`px-3 py-2 rounded-lg text-sm text-cocoa-600 border transition-colors hover:bg-cocoa-50 ${theme.softBorder}`}
              >
                取消
              </button>
            )}
          </div>
        </div>
        {error && <p className="text-xs text-sienna mt-2">{error}</p>}
      </div>
      {feedbackBlock}
    </div>
  )
}

// StepCard（平移自旧版 newbie/page.tsx）
function StepCard({
  step, title, done, locked, lockedHint, doneHint, badge, theme, children,
}: {
  step: number
  title: string
  done: boolean
  locked: boolean
  lockedHint?: string
  doneHint?: string
  badge?: string
  theme: TabTheme
  children?: React.ReactNode
}) {
  return (
    <section className={`bg-paper rounded-2xl border shadow-card transition-all duration-300 overflow-hidden
      ${locked ? 'border-line opacity-50 pointer-events-none' : done ? 'border-emerald-200 ring-1 ring-emerald-100' : `border-line ring-1 ${theme.ring}`}
    `}>
      <div className="flex items-center gap-3 px-6 py-4 border-b border-line/70">
        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
          ${locked ? 'bg-fog text-cocoa-400' : done ? 'bg-emerald-600 text-white' : theme.iconActive}`}>
          {done ? <Check className="w-4 h-4" strokeWidth={2.5} /> : step}
        </span>
        <h2 className="font-display font-semibold text-cocoa-900 flex-1">{title}</h2>
        {done && doneHint && (
          <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-medium">{doneHint}</span>
        )}
        {done && !doneHint && (
          <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-medium">已完成</span>
        )}
        {locked && lockedHint && (
          <span className="inline-flex items-center gap-1 text-xs text-cocoa-400 bg-fog px-2.5 py-1 rounded-full">
            <Lock className="w-3 h-3" strokeWidth={2} />{lockedHint}
          </span>
        )}
        {badge && <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${theme.badge}`}>{badge}</span>}
      </div>
      {!locked && <div className="px-6 py-5">{children}</div>}
    </section>
  )
}
