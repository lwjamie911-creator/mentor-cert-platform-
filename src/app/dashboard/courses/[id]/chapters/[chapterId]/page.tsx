import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChapterContent } from './chapter-content'

export default async function ChapterPage({
  params,
}: {
  params: { id: string; chapterId: string }
}) {
  const session = await getServerSession(authOptions)

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session!.user.id, courseId: params.id } },
  })
  if (!enrollment) notFound()

  const chapter = await prisma.chapter.findUnique({
    where: { id: params.chapterId },
    include: { course: { select: { title: true } } },
  })
  if (!chapter || chapter.courseId !== params.id) notFound()

  const progress = await prisma.progress.findUnique({
    where: { userId_chapterId: { userId: session!.user.id, chapterId: params.chapterId } },
  })

  const hasQuestions = await prisma.question.count({ where: { chapterId: params.chapterId } })

  return (
    <div className="space-y-4">
      {/* 返回 + 页头 */}
      <div>
        <Link
          href={`/dashboard/courses/${params.id}`}
          className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-indigo-600 transition-colors mb-3"
        >
          ← 返回课程
        </Link>
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-xl font-bold text-gray-900">{chapter.title}</h1>
          {!chapter.isRequired && (
            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">选学</span>
          )}
          {progress?.status === 'completed' && (
            <span className="text-xs px-2 py-0.5 bg-green-50 text-green-600 rounded-full font-medium">✓ 已完成</span>
          )}
        </div>
        {chapter.description && (
          <p className="text-sm text-gray-400 mt-1">{chapter.description}</p>
        )}
        <p className="text-xs text-gray-400 mt-1 opacity-60">{chapter.course.title}</p>
      </div>

      {/* 内容 + 操作 */}
      <ChapterContent
        chapter={{
          id: chapter.id,
          contentType: chapter.contentType,
          contentText: chapter.contentText,
          contentUrl: chapter.contentUrl,
          minReadSeconds: chapter.minReadSeconds,
        }}
        courseId={params.id}
        isCompleted={progress?.status === 'completed'}
        hasQuestions={hasQuestions > 0}
      />
    </div>
  )
}
