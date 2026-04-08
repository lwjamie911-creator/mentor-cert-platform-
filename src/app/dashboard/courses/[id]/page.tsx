export const dynamic = 'force-dynamic'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import dayjs from 'dayjs'
import { EnrollButton } from './enroll-button'

export default async function CourseDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  const course = await prisma.course.findUnique({
    where: { id: params.id, isPublished: true },
    include: {
      chapters: { orderBy: { orderIndex: 'asc' } },
      enrollments: { where: { userId: session!.user.id } },
      certificates: { where: { userId: session!.user.id } },
    },
  })
  if (!course) notFound()

  const enrollment = course.enrollments[0]
  const cert       = course.certificates[0]

  const progress = enrollment
    ? await prisma.progress.findMany({
        where: { userId: session!.user.id, chapterId: { in: course.chapters.map(c => c.id) } },
      })
    : []

  const progressMap    = Object.fromEntries(progress.map(p => [p.chapterId, p]))
  const completedCount = progress.filter(p => p.status === 'completed').length
  const totalRequired  = course.chapters.filter(c => c.isRequired).length
  const pct            = totalRequired > 0 ? Math.round((completedCount / totalRequired) * 100) : 0
  const isExpired      = enrollment?.status === 'expired'
  const allDone        = enrollment && completedCount >= totalRequired && !cert

  return (
    <div className="space-y-5">
      {/* 返回 */}
      <Link href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-indigo-600 transition-colors">
        ← 返回课程列表
      </Link>

      {/* 课程卡片 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* 渐变头 */}
        <div className="px-6 pt-6 pb-5"
          style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #eef2ff 50%, #f5f3ff 100%)' }}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900 mb-1">{course.title}</h1>
              {course.description && (
                <p className="text-sm text-gray-500 leading-relaxed">{course.description}</p>
              )}
            </div>
            {cert && (
              <span className="flex-shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                🏆 已认证
              </span>
            )}
          </div>

          {/* 元信息 */}
          <div className="flex flex-wrap gap-3 mt-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">📖 {course.chapters.length} 个章节</span>
            <span className="flex items-center gap-1">⏰ 需在 {course.deadlineDays} 天内完成</span>
            {enrollment?.deadline && (
              <span className={`flex items-center gap-1 ${isExpired ? 'text-red-500' : ''}`}>
                📅 截止 {dayjs(enrollment.deadline).format('YYYY-MM-DD')}
                {isExpired && ' (已过期)'}
              </span>
            )}
          </div>
        </div>

        {/* 进度条 */}
        {enrollment && (
          <div className="px-6 py-4 border-t border-gray-50">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>学习进度</span>
              <span className="font-semibold text-indigo-600">{completedCount} / {totalRequired} 章节 · {pct}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${pct}%`,
                  background: 'linear-gradient(90deg, #3b82f6, #6366f1)'
                }}
              />
            </div>
          </div>
        )}

        {/* 已获证书提示 */}
        {cert && (
          <div className="mx-6 mb-5 px-4 py-3 bg-green-50 border border-green-100 rounded-xl flex items-center justify-between gap-3">
            <div className="text-sm text-green-700">
              <span className="font-semibold">✓ 已获得认证证书</span>
              <span className="text-green-500 text-xs ml-2">
                {cert.certificateNo} · 有效期至 {dayjs(cert.expiresAt).format('YYYY-MM-DD')}
              </span>
            </div>
            <Link href="/dashboard/certificates"
              className="flex-shrink-0 text-xs text-green-700 font-semibold hover:underline">
              查看证书 →
            </Link>
          </div>
        )}

        {/* 报名按钮 */}
        {!enrollment && (
          <div className="px-6 pb-5">
            <EnrollButton courseId={course.id} />
          </div>
        )}
      </div>

      {/* 章节列表 */}
      <div>
        <h2 className="font-bold text-gray-700 text-sm mb-3 flex items-center gap-2">
          <span>📖</span> 课程章节
        </h2>
        <div className="space-y-2">
          {course.chapters.map((chapter, index) => {
            const p           = progressMap[chapter.id]
            const isDone      = p?.status === 'completed'
            const canAccess   = !!enrollment
            const contentTypeLabel = chapter.contentType === 'text' ? '图文' :
                                     chapter.contentType === 'pdf'  ? 'PDF'  : '外链'
            return (
              <div key={chapter.id}
                className={`bg-white rounded-2xl border px-4 py-3.5 flex items-center gap-3 transition-all ${
                  isDone ? 'border-green-100' : 'border-gray-100'
                } ${canAccess ? 'hover:border-indigo-200 hover:shadow-sm' : ''}`}>
                {/* 状态圆 */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                  isDone ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                }`}>
                  {isDone ? '✓' : index + 1}
                </div>

                {/* 信息 */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{chapter.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-400">{contentTypeLabel}</span>
                    {!chapter.isRequired && (
                      <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-400 rounded-full">选学</span>
                    )}
                    {isDone && (
                      <span className="text-xs px-1.5 py-0.5 bg-green-50 text-green-600 rounded-full">已完成</span>
                    )}
                  </div>
                </div>

                {/* 操作 */}
                {canAccess ? (
                  <Link
                    href={`/dashboard/courses/${course.id}/chapters/${chapter.id}`}
                    className={`flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                      isDone
                        ? 'text-gray-500 border border-gray-200 hover:bg-gray-50'
                        : 'text-indigo-600 border border-indigo-200 hover:bg-indigo-50'
                    }`}
                  >
                    {isDone ? '复习' : '去学习'}
                  </Link>
                ) : (
                  <span className="text-xs text-gray-300 flex-shrink-0">报名后可学</span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* 期末考试入口 */}
      {allDone && (
        <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 text-center"
            style={{ background: 'linear-gradient(135deg, #eef2ff, #f5f3ff)' }}>
            <div className="text-3xl mb-2">🎓</div>
            <p className="font-bold text-indigo-900 mb-1">所有章节已完成！</p>
            <p className="text-sm text-indigo-600 mb-4">参加期末考试，获取课程认证证书</p>
            <Link
              href={`/dashboard/courses/${course.id}/exam`}
              className="inline-block px-8 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-all"
              style={{ background: 'linear-gradient(90deg, #4f46e5, #7c3aed)' }}
            >
              开始期末考试 →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
