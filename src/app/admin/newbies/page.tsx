import { prisma } from '@/lib/prisma'
import dayjs from 'dayjs'

export default async function AdminNewbiesPage() {
  const newbies = await prisma.newbieChecklist.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { name: true, email: true } } },
  })

  const userIds = newbies.map(n => n.userId)
  const [exams, badges] = await Promise.all([
    prisma.newbieExam.findMany({ where: { userId: { in: userIds } } }),
    prisma.newbieBadge.findMany({ where: { userId: { in: userIds } } }),
  ])

  const examMap = Object.fromEntries(exams.map(e => [e.userId, e]))
  const badgeMap = Object.fromEntries(badges.map(b => [b.userId, b]))

  const badgeCount = badges.length
  const passCount = exams.filter(e => e.passed).length

  return (
    <div className="space-y-6">
      {/* 页头 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">新人成长数据</h1>
        <p className="text-sm text-gray-400 mt-1">
          共 <span className="text-gray-700 font-medium">{newbies.length}</span> 名已绑定导师的新人 ·{' '}
          <span className="text-green-600 font-medium">{passCount}</span> 名通过测试 ·{' '}
          <span className="text-indigo-600 font-medium">{badgeCount}</span> 枚勋章已颁发
        </p>
      </div>

      {/* 数据表格 */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg, #f0f9ff, #dbeafe)' }}>
          <div className="flex items-center gap-2">
            <span>🌱</span>
            <h2 className="font-bold text-blue-800 text-sm">新人成长明细</h2>
          </div>
          <span className="text-xs text-blue-400 bg-blue-50 px-2.5 py-1 rounded-full">{newbies.length} 人</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[860px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">姓名 / 企微ID</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">绑定导师</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">指标 A</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">指标 B</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">指标 C</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">测试得分</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">主观题回答</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">勋章</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {newbies.map((n) => {
                const exam = examMap[n.userId]
                const badge = badgeMap[n.userId]
                const wxId = n.user.email.split('@')[0]

                return (
                  <tr key={n.userId} className="hover:bg-blue-50/20 transition-colors align-top">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs flex-shrink-0">
                          {n.user.name?.[0] ?? '?'}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{n.user.name}</div>
                          <div className="text-xs text-blue-400 font-mono">{wxId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-lg font-mono">{n.mentorWxId}</span>
                    </td>
                    <td className="px-3 py-3.5 text-center">
                      <CheckCell self={n.checkA_self} mentor={n.checkA_mentor} />
                    </td>
                    <td className="px-3 py-3.5 text-center">
                      <CheckCell self={n.checkB_self} mentor={n.checkB_mentor} />
                    </td>
                    <td className="px-3 py-3.5 text-center">
                      <CheckCell self={n.checkC_self} mentor={n.checkC_mentor} />
                    </td>
                    <td className="px-5 py-3.5">
                      {exam ? (
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-base font-black ${exam.passed ? 'text-green-600' : 'text-red-500'}`}>
                              {exam.score}
                            </span>
                            <span className="text-xs text-gray-400">分</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                              exam.passed ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-500'
                            }`}>
                              {exam.passed ? '通过' : '未通过'}
                            </span>
                          </div>
                          <div className="text-xs text-gray-400">{exam.correctCount}/{exam.totalQuestions} 题正确</div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-300">未参加</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 max-w-[200px]">
                      {exam?.subjectiveAnswer ? (
                        <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed" title={exam.subjectiveAnswer}>
                          {exam.subjectiveAnswer}
                        </p>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      {badge ? (
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                            <span>🏅</span> 已颁发
                          </div>
                          <div className="text-xs text-gray-400 font-mono">{badge.badgeNo}</div>
                          <div className="text-xs text-gray-300">{dayjs(badge.issuedAt).format('MM-DD')}</div>
                        </div>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {newbies.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <div className="text-4xl mb-3">🌱</div>
              <p className="text-sm">暂无新人数据</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function CheckCell({ self, mentor }: { self: boolean; mentor: boolean }) {
  if (self && mentor) return (
    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600 text-xs font-bold">✓</span>
  )
  if (self) return (
    <span className="inline-block text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">待确认</span>
  )
  return <span className="text-gray-200 text-sm">○</span>
}
