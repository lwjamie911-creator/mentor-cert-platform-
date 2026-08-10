export const dynamic = 'force-dynamic'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import dayjs from 'dayjs'
import { BookOpen, Check, BookMarked, Clock, ArrowRight } from 'lucide-react'

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
      <div className="animate-fade-up">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-cocoa-100 text-cocoa-700">
            让每一段成长，都有迹可循
          </span>
        </div>
        <h1 className="font-display text-2xl text-cocoa-900 tracking-tight">培训课程</h1>
        <p className="text-sm text-cocoa-500 mt-1">
          共 <span className="text-cocoa-800 font-medium">{courses.length}</span> 门课程 ·
          已报名 <span className="text-cocoa-700 font-medium">{enrolledCount}</span> 门 ·
          已认证 <span className="text-cocoa-800 font-medium">{completedCount}</span> 门
        </p>
      </div>

      {/* 课程列表 */}
      {courses.length === 0 ? (
        <div className="bg-paper rounded-2xl border border-line shadow-card text-center py-20">
          <BookOpen className="w-12 h-12 text-cocoa-300 mx-auto mb-4" strokeWidth={1.5} />
          <p className="text-cocoa-500 text-sm">暂无课程，请等待管理员发布</p>
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
                className="bg-paper rounded-2xl border border-line shadow-card p-5 hover:border-cocoa-300 hover:shadow-subtle hover:-translate-y-0.5 transition-all animate-fade-up">
                <div className="flex items-start gap-4">
                  {/* 序号 */}
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-semibold text-sm flex-shrink-0 ${
                    isCompleted ? 'bg-cocoa-800 text-paper' :
                    isEnrolled  ? 'bg-cocoa-100 text-cocoa-700' :
                    'bg-cocoa-50 text-cocoa-400'
                  }`}>
                    {isCompleted ? <Check className="w-5 h-5" strokeWidth={2.5} /> : idx + 1}
                  </div>

                  {/* 主信息 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-cocoa-900">{course.title}</span>
                      {isCompleted && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-cocoa-100 text-cocoa-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-cocoa-700" /> 已认证
                        </span>
                      )}
                      {isExpired && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blush/60 text-sienna">
                          <span className="w-1.5 h-1.5 rounded-full bg-sienna" /> 已过期
                        </span>
                      )}
                      {isEnrolled && !isCompleted && !isExpired && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-cocoa-100 text-cocoa-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-cocoa-500 animate-pulse" /> 学习中
                        </span>
                      )}
                    </div>

                    {course.description && (
                      <p className="text-xs text-cocoa-500 truncate mb-1.5">{course.description}</p>
                    )}

                    <div className="flex items-center gap-3 text-xs text-cocoa-500 flex-wrap">
                      <span className="inline-flex items-center gap-1">
                        <BookMarked className="w-3.5 h-3.5" strokeWidth={2} /> {course.chapters.length} 个必学章节
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" strokeWidth={2} /> {course.deadlineDays} 天内完成
                      </span>
                      {enrollment?.deadline && (
                        <span className={isExpired ? 'text-sienna' : ''}>
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
                        className="inline-flex items-center px-4 py-2 rounded-lg text-xs font-semibold text-cocoa-800 border border-cocoa-300 hover:bg-cocoa-100 transition-all active:scale-[0.97]"
                      >
                        查看
                      </Link>
                    ) : isEnrolled ? (
                      <Link
                        href={`/dashboard/courses/${course.id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-paper bg-cocoa-800 shadow-subtle transition-all hover:bg-cocoa-900 hover:-translate-y-0.5 active:scale-[0.97]"
                      >
                        继续学习 <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
                      </Link>
                    ) : (
                      <Link
                        href={`/dashboard/courses/${course.id}`}
                        className="inline-flex items-center px-4 py-2 rounded-lg text-xs font-semibold text-cocoa-800 border border-cocoa-300 hover:bg-cocoa-100 transition-all active:scale-[0.97]"
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
