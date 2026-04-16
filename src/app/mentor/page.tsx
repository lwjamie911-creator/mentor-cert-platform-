export const dynamic = 'force-dynamic'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { MentorSelfCheckPanel } from './self-check-panel'
import { MentorNewbieList } from './newbie-list'
import { MentorCoursesPanel } from './courses-panel'
import { NewbieDoneAlert } from './newbie-done-alert'
import Link from 'next/link'
import dayjs from 'dayjs'

export default async function MentorPage() {
  const session = await getServerSession(authOptions)!

  const [selfCheck, mentorCert, pairs, materials, learningProgress, newbieMaterials] = await Promise.all([
    prisma.mentorSelfCheck.findUnique({ where: { userId: session!.user.id } }),
    prisma.mentorCertificate.findUnique({ where: { userId: session!.user.id } }),
    prisma.mentorNewbiePair.findMany({
      where: { mentorId: session!.user.id },
      include: {
        newbie: {
          select: {
            id: true, name: true, email: true,
            newbieExam: true,
            newbieBadge: true,
          },
        },
      },
    }),
    prisma.learningMaterial.findMany({
      where: { isPublished: true, zone: { in: ['mentor', 'both'] } },
      orderBy: [{ orderIndex: 'asc' }],
    }),
    prisma.learningProgress.findMany({ where: { userId: session!.user.id } }),
    // 新人必修课程（用于计算新人学习进度）
    prisma.learningMaterial.findMany({
      where: { isPublished: true, zone: { in: ['newbie', 'both'] } },
      select: { id: true, title: true, orderIndex: true },
      orderBy: [{ orderIndex: 'asc' }],
    }),
  ])

  const selfCheckDone = selfCheck?.check1 && selfCheck?.check2 && selfCheck?.check3 && selfCheck?.check4
  const completedIds  = new Set(learningProgress.map(p => p.materialId))
  const materialsWithProgress = materials.map(m => ({ ...m, completed: completedIds.has(m.id) }))
  const allMaterialsDone = materials.length === 0 || materialsWithProgress.every(m => m.completed)

  const newbiesDone = pairs.filter(p => p.newbie.newbieBadge && p.newbie.newbieExam?.passed)

  // 查询所有名下新人的学习进度
  const newbieIds = pairs.map(p => p.newbie.id)
  const newbieMaterialIds = new Set(newbieMaterials.map(m => m.id))
  const allNewbieProgress = newbieIds.length > 0
    ? await prisma.learningProgress.findMany({
        where: { userId: { in: newbieIds }, materialId: { in: Array.from(newbieMaterialIds) } },
        select: { userId: true, materialId: true },
      })
    : []
  // 按新人 id 归组
  const newbieProgressMap = new Map<string, Set<string>>()
  for (const p of allNewbieProgress) {
    if (!newbieProgressMap.has(p.userId)) newbieProgressMap.set(p.userId, new Set())
    newbieProgressMap.get(p.userId)!.add(p.materialId)
  }

  // 进度：自检 → 学习 → 认证
  const certProgress = [selfCheckDone, allMaterialsDone && selfCheckDone, !!mentorCert].filter(Boolean).length

  return (
    <div className="space-y-6">

      {/* Hero */}
      <div className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#f59e0b 0%,#fb923c 100%)' }}>
        <div className="absolute top-[-30px] right-[-30px] w-40 h-40 rounded-full bg-white/10" />
        <div className="absolute bottom-[-20px] right-[60px] w-24 h-24 rounded-full bg-white/10" />
        <div className="relative z-10">
          <p className="text-amber-100 text-xs mb-1">导师专区</p>
          <h1 className="text-2xl font-bold mb-3">你好，{session!.user.name} 🎓</h1>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex-1 h-2 bg-white/30 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all duration-700"
                style={{ width: `${(certProgress / 3) * 100}%` }} />
            </div>
            <span className="text-white/80 text-xs font-mono">{certProgress}/3</span>
          </div>
          <p className="text-amber-100 text-xs">
            {certProgress === 0 && '从资质自检开始，加入 TEG 秘书中心导师池'}
            {certProgress === 1 && '自检完成！去学习必修课程'}
            {certProgress === 2 && '课程学完！参加导师认证测试'}
            {certProgress === 3 && '🎉 认证完成！已加入导师池，现在管理你的新人吧'}
          </p>
        </div>
      </div>

      {/* 新人完成提醒（仅提示一次，关闭后不再显示） */}
      <NewbieDoneAlert
        newbiesDone={newbiesDone.map(p => ({ pairId: p.id, name: p.newbie.name }))}
      />

      {/* ═══════════════════════════════════════════ */}
      {/* 第一块：加入 TEG 秘书中心导师池              */}
      {/* ═══════════════════════════════════════════ */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-6 rounded-full bg-amber-400" />
          <h2 className="text-base font-bold text-gray-900">加入 TEG 秘书中心导师池</h2>
          {mentorCert && (
            <span className="ml-auto text-xs text-green-600 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full font-medium">✓ 已加入</span>
          )}
        </div>

        <div className="space-y-4">
          {/* 步骤一：资质自检 */}
          <StepCard step={1} title="导师资质自检" done={!!selfCheckDone} locked={false} accentColor="amber">
            <MentorSelfCheckPanel
              userId={session!.user.id}
              initialCheck={selfCheck ? {
                check1: selfCheck.check1,
                check2: selfCheck.check2,
                check3: selfCheck.check3,
                check4: selfCheck.check4,
              } : null}
            />
          </StepCard>

          {/* 步骤二：TEG 秘书中心导师必学 */}
          <StepCard
            step={2}
            title="TEG 秘书中心导师必学"
            done={allMaterialsDone && !!selfCheckDone}
            locked={!selfCheckDone}
            lockedHint="请先完成资质自检"
            accentColor="amber"
            badge={materials.length > 0 ? `${materialsWithProgress.filter(m => m.completed).length}/${materials.length} 门` : undefined}
          >
            <MentorCoursesPanel userId={session!.user.id} initialMaterials={materialsWithProgress} />
          </StepCard>

          {/* 步骤三：导师测试与认证 */}
          <StepCard
            step={3}
            title="导师测试与认证"
            done={!!mentorCert}
            locked={!selfCheckDone || !allMaterialsDone}
            lockedHint={!selfCheckDone ? '请先完成资质自检' : '请先完成所有必学课程'}
            accentColor="amber"
          >
            {mentorCert ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">考试得分</p>
                  <p className="text-3xl font-bold text-amber-600">{mentorCert.score} <span className="text-base font-normal text-gray-400">分</span></p>
                  <p className="text-xs text-gray-400 mt-1">证书有效期至 {dayjs(mentorCert.expiresAt).format('YYYY年MM月DD日')}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Link href="/mentor/certificate"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-amber-700 border-2 border-amber-300 hover:bg-amber-50 transition-colors">
                    🏆 查看认证证书
                  </Link>
                  <Link href="/mentor/exam"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 border-2 border-gray-200 hover:border-amber-300 hover:text-amber-700 transition-colors">
                    🔄 重新测试
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm text-gray-500">共 5 题，将从题库随机抽取，所有问题内容均来自 TEG 秘书中心导师必学课程</p>
                  <p className="text-xs text-gray-400 mt-0.5">80 分及以上视为通过，即时颁发导师认证证书</p>
                </div>
                <Link href="/mentor/exam"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(90deg,#f59e0b,#fb923c)' }}>
                  开始测试 →
                </Link>
              </div>
            )}
          </StepCard>
        </div>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* 第二块：新人学习跟踪及任务验收               */}
      {/* ═══════════════════════════════════════════ */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-6 rounded-full bg-blue-400" />
          <h2 className="text-base font-bold text-gray-900">新人学习跟踪及任务验收</h2>
        </div>

        <StepCard
          step={4}
          title="我的新人"
          done={false}
          locked={!mentorCert}
          lockedHint="请先完成认证，加入导师池后解锁"
          accentColor="blue"
        >
          <MentorNewbieList
            mentorId={session!.user.id}
            pairs={pairs.map(p => ({
              id: p.id,
              newbieId: p.newbie.id,
              newbieName: p.newbie.name,
              newbieEmail: p.newbie.email,
              exam: p.newbie.newbieExam,
              badge: p.newbie.newbieBadge,
              learningProgress: {
                completed: newbieProgressMap.get(p.newbie.id)?.size ?? 0,
                total: newbieMaterialIds.size,
              },
            }))}
          />
        </StepCard>
      </div>

    </div>
  )
}

function StepCard({
  step, title, done, locked, lockedHint, accentColor, badge, children,
}: {
  step: number
  title: string
  done: boolean
  locked: boolean
  lockedHint?: string
  accentColor: 'amber' | 'blue'
  badge?: string
  children: React.ReactNode
}) {
  const colors = {
    amber: { ring: 'ring-amber-200', num: done ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700' },
    blue:  { ring: 'ring-blue-200',  num: done ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'  },
  }
  const c = colors[accentColor]
  return (
    <section className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden
      ${locked ? 'border-gray-100 opacity-50 pointer-events-none' : `border-gray-200 ring-1 ${c.ring}`}`}>
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-50">
        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
          ${locked ? 'bg-gray-100 text-gray-400' : c.num}`}>
          {done ? '✓' : step}
        </span>
        <h2 className="font-semibold text-gray-900 flex-1">{title}</h2>
        {done && <span className="text-xs text-green-600 bg-green-50 px-2.5 py-1 rounded-full font-medium">已完成</span>}
        {locked && lockedHint && <span className="text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">{lockedHint}</span>}
        {badge && <span className="text-xs text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full font-medium">{badge}</span>}
      </div>
      {!locked && <div className="px-6 py-5">{children}</div>}
    </section>
  )
}
