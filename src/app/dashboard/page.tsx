export const dynamic = 'force-dynamic'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import dayjs from 'dayjs'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)!

  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    orderBy: { orderIndex: 'asc' },
    include: {
      chapters: { where: { isRequired: true }, select: { id: true } },
      enrollments: { where: { userId: session!.user.id } },
      certificates: { where: { userId: session!.user.id } },
    },
  })

  const enrolledCount  = courses.filter(c => c.enrollments.length > 0).length
  const completedCount = courses.filter(c => c.certificates.length > 0).length

  return (
    <div className="space-y-6">
      {/* 页头 */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-indigo-100 text-indigo-600">
            让每一段成长，都有迹可循
          </span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">培训课程</h1>
        <p className="text-sm text-gray-400 mt-1">
          共 <span className="text-gray-700 font-medium">{courses.length}</span> 门课程 ·
          已报名 <span className="text-indigo-600 font-medium">{enrolledCount}</span> 门 ·
          已认证 <span className="text-green-600 font-medium">{completedCount}</span> 门
        </p>
      </div>

      {/* 课程列表 */}
      {courses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-20">
          <div className="text-5xl mb-4">📚</div>
          <p className="text-gray-400 text-sm">暂无课程，请等待管理员发布</p>
        </div>
      ) : (
        <div className="space-y-3">
          {courses.map((course, idx) => {
            const enrollment  = course.enrollments[0]
            const cert        = course.certificates[0]
            const isEnrolled  = !!enrollment
            const isCompleted = !!(cert || enrollment?.status === 'completed')
            const isExpired   = enrollment?.status === 'expired'

            return (
              <div key={course.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:border-indigo-200 hover:shadow-md transition-all">
                <div className="flex items-start gap-4">
                  {/* 序号 */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                    isCompleted ? 'bg-green-100 text-green-600' :
                    isEnrolled  ? 'bg-indigo-100 text-indigo-600' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    {isCompleted ? '✓' : idx + 1}
                  </div>

                  {/* 主信息 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-gray-900">{course.title}</span>
                      {isCompleted && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> 已认证
                        </span>
                      )}
                      {isExpired && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-500">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400" /> 已过期
                        </span>
                      )}
                      {isEnrolled && !isCompleted && !isExpired && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" /> 学习中
                        </span>
                      )}
                    </div>

                    {course.description && (
                      <p className="text-xs text-gray-400 truncate mb-1.5">{course.description}</p>
                    )}

                    <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                      <span>📖 {course.chapters.length} 个必学章节</span>
                      <span>⏰ {course.deadlineDays} 天内完成</span>
                      {enrollment?.deadline && (
                        <span className={isExpired ? 'text-red-400' : ''}>
                          截止 {dayjs(enrollment.deadline).format('MM-DD')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex-shrink-0">
                    {isCompleted ? (
                      <Link
                        href={`/dashboard/courses/${course.id}`}
                        className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold text-green-700 border border-green-200 hover:bg-green-50 transition-colors"
                      >
                        查看
                      </Link>
                    ) : isEnrolled ? (
                      <Link
                        href={`/dashboard/courses/${course.id}`}
                        className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-sm transition-all hover:opacity-90"
                        style={{ background: 'linear-gradient(90deg, #3b82f6, #6366f1)' }}
                      >
                        继续学习 →
                      </Link>
                    ) : (
                      <Link
                        href={`/dashboard/courses/${course.id}`}
                        className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold text-indigo-600 border border-indigo-200 hover:bg-indigo-50 transition-colors"
                      >
                        查看详情
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
