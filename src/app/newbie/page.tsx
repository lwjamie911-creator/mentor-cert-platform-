import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NewbieBindMentor } from './bind-mentor'
import { NewbieChecklistPanel } from './checklist-panel'
import Link from 'next/link'

export default async function NewbiePage() {
  const session = await getServerSession(authOptions)!

  const [checklist, exam, badge] = await Promise.all([
    prisma.newbieChecklist.findUnique({ where: { userId: session!.user.id } }),
    prisma.newbieExam.findUnique({ where: { userId: session!.user.id } }),
    prisma.newbieBadge.findUnique({ where: { userId: session!.user.id } }),
  ])

  const allChecksDone = !!(checklist?.allDoneAt)

  // 进度：3步
  const progress = [!!checklist, allChecksDone, !!exam?.passed].filter(Boolean).length

  return (
    <div className="space-y-5">

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
                style={{ width: `${(progress / 3) * 100}%` }} />
            </div>
            <span className="text-white/80 text-xs font-mono">{progress}/3</span>
          </div>
          <p className="text-blue-100 text-xs">
            {progress === 0 && '先绑定你的导师，开启成长之旅'}
            {progress === 1 && '导师已绑定！完成 ABC 三项成长指标'}
            {progress === 2 && '指标达成！参加知识测试获得勋章'}
            {progress === 3 && '全部完成，你已获得成长勋章 🏅'}
          </p>
        </div>
      </div>

      {/* 勋章横幅 */}
      {badge && (
        <div className="rounded-2xl p-5 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}>
          <div className="absolute top-0 right-0 text-8xl opacity-10 leading-none">🏅</div>
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="text-4xl">🏅</div>
            <div className="flex-1 text-white">
              <h2 className="text-lg font-bold mb-0.5">恭喜完成所有考核！</h2>
              <p className="text-indigo-200 text-sm">你已获得 3 个月培养达标勋章，为自己鼓个掌吧 👏</p>
            </div>
            <Link href="/newbie/badge"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-600 rounded-xl text-sm font-semibold hover:bg-indigo-50 transition-colors flex-shrink-0"
            >
              查看 / 下载勋章 →
            </Link>
          </div>
        </div>
      )}

      {/* 步骤一：绑定导师 */}
      <StepCard
        step={1}
        title="绑定我的导师"
        done={!!checklist}
        locked={false}
        doneHint={checklist ? `已绑定 ${checklist.mentorWxId}` : undefined}
      >
        {!checklist ? (
          <NewbieBindMentor userId={session!.user.id} />
        ) : (
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
            <span className="text-2xl">🎓</span>
            <div>
              <p className="text-xs text-gray-400">你的导师</p>
              <p className="font-semibold text-gray-800 font-mono">{checklist.mentorWxId}</p>
            </div>
          </div>
        )}
      </StepCard>

      {/* 步骤二：ABC 成长指标 */}
      <StepCard
        step={2}
        title="ABC 成长指标"
        done={allChecksDone}
        locked={!checklist}
        lockedHint="请先绑定导师"
        doneHint={allChecksDone ? '全部达成' : undefined}
      >
        {checklist && <NewbieChecklistPanel userId={session!.user.id} checklist={checklist} />}
      </StepCard>

      {/* 步骤三：知识测试 */}
      <StepCard
        step={3}
        title="知识测试"
        done={!!exam?.passed}
        locked={!allChecksDone}
        lockedHint="请先完成成长指标"
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
              <Link href="/newbie/badge"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: 'linear-gradient(90deg, #4f46e5, #7c3aed)' }}
              >
                🏅 查看勋章
              </Link>
            )}
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <p className="text-sm text-gray-500">5 道客观题 + 1 道主观题</p>
              <p className="text-xs text-gray-400 mt-0.5">客观题 60 分及以上通过，即可获得成长勋章</p>
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
  step, title, done, locked, lockedHint, doneHint, children,
}: {
  step: number
  title: string
  done: boolean
  locked: boolean
  lockedHint?: string
  doneHint?: string
  children: React.ReactNode
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
        {locked && lockedHint && (
          <span className="text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">{lockedHint}</span>
        )}
      </div>
      {!locked && <div className="px-6 py-5">{children}</div>}
    </section>
  )
}
