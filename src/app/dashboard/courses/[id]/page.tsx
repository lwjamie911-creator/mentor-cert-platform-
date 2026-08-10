export const dynamic = 'force-dynamic'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import dayjs from 'dayjs'
import { EnrollButton } from './enroll-button'
import { ArrowLeft, Award, BookOpen, Clock, CalendarDays, Check, GraduationCap, ArrowRight } from 'lucide-react'

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
        className="inline-flex items-center gap-1 text-sm text-cocoa-500 hover:text-cocoa-800 transition-colors">
        <ArrowLeft className="w-4 h-4" strokeWidth={2} /> 返回课程列表
      </Link>

      {/* 课程卡片 */}
      <div className="bg-paper rounded-2xl border border-line shadow-card overflow-hidden animate-fade-up">
        {/* 渐变头 */}
        <div className="px-6 pt-6 pb-5"
          style={{ background: 'linear-gradient(150deg, #fdf4ec 0%, #fbe6d6 55%, #f5d9c4 100%)' }}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="font-display text-xl font-bold text-cocoa-900 mb-1">{course.title}</h1>
              {course.description && (
                <p className="text-sm text-cocoa-600 leading-relaxed">{course.description}</p>
              )}
            </div>
            {cert && (
              <span className="flex-shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                <Award className="w-3.5 h-3.5" strokeWidth={2} /> 已认证
              </span>
            )}
          </div>

          {/* 元信息 */}
          <div className="flex flex-wrap gap-3 mt-4 text-xs text-cocoa-600">
            <span className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" strokeWidth={2} /> {course.chapters.length} 个章节
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" strokeWidth={2} /> 需在 {course.deadlineDays} 天内完成
            </span>
            {enrollment?.deadline && (
              <span className={`flex items-center gap-1 ${isExpired ? 'text-red-500' : ''}`}>
                <CalendarDays className="w-3.5 h-3.5" strokeWidth={2} /> 截止 {dayjs(enrollment.deadline).format('YYYY-MM-DD')}
                {isExpired && ' (已过期)'}
              </span>
            )}
          </div>
        </div>

        {/* 进度条 */}
        {enrollment && (
          <div className="px-6 py-4 border-t border-line">
            <div className="flex justify-between text-xs text-cocoa-500 mb-2">
              <span>学习进度</span>
              <span className="font-semibold text-cocoa-800">{completedCount} / {totalRequired} 章节 · {pct}%</span>
            </div>
            <div className="w-full bg-cocoa-100 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${pct}%`,
                  background: 'linear-gradient(90deg, #9a5c44, #5d2a1a)'
                }}
              />
            </div>
          </div>
        )}

        {/* 已获证书提示 */}
        {cert && (
          <div className="mx-6 mb-5 px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-between gap-3">
            <div className="text-sm text-emerald-700 flex items-center gap-1.5">
              <Check className="w-4 h-4 flex-shrink-0" strokeWidth={2.5} />
              <span className="font-semibold">已获得认证证书</span>
              <span className="text-emerald-600/80 text-xs ml-1">
                {cert.certificateNo} · 有效期至 {dayjs(cert.expiresAt).format('YYYY-MM-DD')}
              </span>
            </div>
            <Link href="/dashboard/certificates"
              className="flex-shrink-0 inline-flex items-center gap-1 text-xs text-emerald-700 font-semibold hover:underline">
              查看证书 <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
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
        <h2 className="font-display font-bold text-cocoa-800 text-sm mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-cocoa-600" strokeWidth={2} /> 课程章节
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
                className={`bg-paper rounded-2xl border px-4 py-3.5 flex items-center gap-3 transition-all ${
                  isDone ? 'border-emerald-100' : 'border-line'
                } ${canAccess ? 'hover:border-cocoa-300 hover:shadow-card' : ''}`}>
                {/* 状态圆 */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                  isDone ? 'bg-emerald-50 text-emerald-600' : 'bg-cocoa-100 text-cocoa-500'
                }`}>
                  {isDone ? <Check className="w-4 h-4" strokeWidth={2.5} /> : index + 1}
                </div>

                {/* 信息 */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-cocoa-800 truncate">{chapter.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-cocoa-500">{contentTypeLabel}</span>
                    {!chapter.isRequired && (
                      <span className="text-xs px-1.5 py-0.5 bg-cocoa-100 text-cocoa-500 rounded-full">选学</span>
                    )}
                    {isDone && (
                      <span className="text-xs px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded-full">已完成</span>
                    )}
                  </div>
                </div>

                {/* 操作 */}
                {canAccess ? (
                  <Link
                    href={`/dashboard/courses/${course.id}/chapters/${chapter.id}`}
                    className={`flex-shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-[0.97] hover:-translate-y-0.5 ${
                      isDone
                        ? 'text-cocoa-600 border border-cocoa-300 hover:bg-cocoa-50'
                        : 'text-cocoa-800 border border-cocoa-300 hover:bg-cocoa-50'
                    }`}
                  >
                    {isDone ? '复习' : '去学习'}
                  </Link>
                ) : (
                  <span className="text-xs text-cocoa-400 flex-shrink-0">报名后可学</span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* 期末考试入口 */}
      {allDone && (
        <div className="bg-paper rounded-2xl border border-cocoa-200 shadow-card overflow-hidden animate-fade-up">
          <div className="px-6 py-5 text-center"
            style={{ background: 'linear-gradient(150deg, #fdf4ec, #fbe6d6, #f5d9c4)' }}>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-paper/70 mb-2">
              <GraduationCap className="w-6 h-6 text-cocoa-800" strokeWidth={2} />
            </div>
            <p className="font-display font-bold text-cocoa-900 mb-1">所有章节已完成！</p>
            <p className="text-sm text-cocoa-600 mb-4">参加期末考试，获取课程认证证书</p>
            <Link
              href={`/dashboard/courses/${course.id}/exam`}
              className="inline-flex items-center gap-1 px-8 py-2.5 rounded-lg text-sm font-semibold text-white shadow-card transition-all active:scale-[0.97] hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(90deg, #5d2a1a, #7a4230)' }}
            >
              开始期末考试 <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
