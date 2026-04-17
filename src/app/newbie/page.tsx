export const dynamic = 'force-dynamic'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NewbieCoursesPanel } from './courses-panel'
import { MentorLetterBanner } from './mentor-letter-banner'
import Link from 'next/link'

export default async function NewbiePage() {
  const session = await getServerSession(authOptions)!

  const [exam, badge, materials, learningProgress, mentorPair] = await Promise.all([
    prisma.newbieExam.findUnique({ where: { userId: session!.user.id } }),
    prisma.newbieBadge.findUnique({ where: { userId: session!.user.id } }),
    prisma.learningMaterial.findMany({
      where: { isPublished: true, zone: { in: ['newbie', 'both'] } },
      orderBy: [{ orderIndex: 'asc' }],
    }),
    prisma.learningProgress.findMany({ where: { userId: session!.user.id } }),
    prisma.mentorNewbiePair.findUnique({
      where: { newbieId: session!.user.id },
      include: { mentor: { select: { name: true } } },
    }),
  ])

  const completedIds = new Set(learningProgress.map(p => p.materialId))
  const materialsWithProgress = materials.map(m => ({ ...m, completed: completedIds.has(m.id) }))
  const allMaterialsDone = materials.length === 0 || materialsWithProgress.every(m => m.completed)

  // 进度：2步
  const progress = [allMaterialsDone, !!exam?.passed].filter(Boolean).length

  return (
    <div className="space-y-5">

      {/* 导师寄语 */}
      {mentorPair?.isConfirmed && mentorPair.mentorMessage && (
        <MentorLetterBanner
          mentorName={mentorPair.mentor.name}
          message={mentorPair.mentorMessage}
        />
      )}

      {/* Hero 区 */}
      <div className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)' }}>
        <div className="absolute top-[-30px] right-[-30px] w-40 h-40 rounded-full bg-white/10" />
        <div className="absolute bottom-[-20px] right-[60px] w-24 h-24 rounded-full bg-white/10" />
        <div className="relative z-10">
          <p className="text-blue-100 text-xs mb-1">新人专区</p>
          <h1 className="text-2xl font-bold mb-3">你好，{session!.user.name} 🌱</h1>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex-1 h-2 bg-white/30 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all duration-700"
                style={{ width: `${(progress / 2) * 100}%` }} />
            </div>
            <span className="text-white/80 text-xs font-mono">{progress}/2</span>
          </div>
          <p className="text-blue-100 text-xs">
            {progress === 0 && '先完成必修课堂，再参加知识测试'}
            {progress === 1 && '课程已学完！参加知识测试获得成长证书'}
            {progress === 2 && '全部完成，你已获得新人成长课程结业证书 🎓'}
          </p>
        </div>
      </div>

      {/* 证书横幅 */}
      {badge && (
        <div className="rounded-2xl p-5 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #0d9488 100%)' }}>
          <div className="absolute top-0 right-0 text-8xl opacity-10 leading-none">🎓</div>
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="text-4xl">🎓</div>
            <div className="flex-1 text-white">
              <h2 className="text-lg font-bold mb-0.5">恭喜完成必修学习和测试！</h2>
              <p className="text-sky-100 text-sm">你已获得新人成长课程结业证书，记录你的成长里程碑 🌱</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Link href="/newbie/certificate"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-sky-600 rounded-xl text-sm font-semibold hover:bg-sky-50 transition-colors"
              >
                🎓 查看结业证书 →
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
        badge={materials.length > 0 ? `${materialsWithProgress.filter(m => m.completed).length}/${materials.length} 门` : undefined}
      >
        <NewbieCoursesPanel userId={session!.user.id} initialMaterials={materialsWithProgress} />
      </StepCard>

      {/* 步骤二：知识测试与成长证书 */}
      <StepCard
        step={2}
        title="知识测试与成长证书"
        done={!!exam?.passed}
        locked={!allMaterialsDone}
        lockedHint="请先完成所有课程"
        doneHint={exam?.passed ? `${exam.score} 分通过` : undefined}
      >
        {exam ? (
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <p className="text-sm text-gray-500 mb-1">客观题得分</p>
              <p className="text-3xl font-bold text-blue-600">{exam.score} <span className="text-base font-normal text-gray-400">分</span></p>
              <p className="text-xs text-gray-400 mt-1">{exam.correctCount}/{exam.totalQuestions} 题正确 · {exam.passed ? '已通过 ✓' : '未通过'}</p>
            </div>
            {!exam.passed && (
              <Link href="/newbie/exam"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: 'linear-gradient(90deg, #3b82f6, #6366f1)' }}
              >
                重新测试 →
              </Link>
            )}
            {exam.passed && (
              <div className="flex gap-2">
                <Link href="/newbie/certificate"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
                  style={{ background: 'linear-gradient(90deg, #0ea5e9, #0d9488)' }}
                >
                  🎓 查看结业证书
                </Link>
                <Link href="/newbie/exam"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 border border-gray-200 hover:border-blue-200 hover:text-blue-600 transition-colors"
                >
                  重考
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <p className="text-sm text-gray-500">从题库随机抽取题目，含连线题</p>
              <p className="text-xs text-gray-400 mt-0.5">80 分及以上视为通过，即可获得新人成长课程结业证书</p>
            </div>
            <Link href="/newbie/exam"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(90deg, #3b82f6, #6366f1)' }}
            >
              开始测试 →
            </Link>
          </div>
        )}
      </StepCard>

    </div>
  )
}

function StepCard({
  step, title, done, locked, lockedHint, doneHint, badge, children,
}: {
  step: number
  title: string
  done: boolean
  locked: boolean
  lockedHint?: string
  doneHint?: string
  badge?: string
  children?: React.ReactNode
}) {
  return (
    <section className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden
      ${locked ? 'border-gray-100 opacity-50 pointer-events-none' : done ? 'border-blue-100 ring-1 ring-blue-100' : 'border-blue-200 ring-1 ring-blue-200'}
    `}>
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-50">
        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
          ${locked ? 'bg-gray-100 text-gray-400' : done ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
          {done ? '✓' : step}
        </span>
        <h2 className="font-semibold text-gray-900 flex-1">{title}</h2>
        {done && doneHint && (
          <span className="text-xs text-green-600 bg-green-50 px-2.5 py-1 rounded-full font-medium">{doneHint}</span>
        )}
        {done && !doneHint && (
          <span className="text-xs text-green-600 bg-green-50 px-2.5 py-1 rounded-full font-medium">已完成</span>
        )}
        {locked && lockedHint && (
          <span className="text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">{lockedHint}</span>
        )}
        {badge && <span className="text-xs text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full font-medium">{badge}</span>}
      </div>
      {!locked && <div className="px-6 py-5">{children}</div>}
    </section>
  )
}
