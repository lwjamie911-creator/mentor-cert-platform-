import { QuizClient } from '@/components/quiz-client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'

export default async function ChapterQuizPage({
  params,
}: {
  params: { id: string; chapterId: string }
}) {
  const session = await getServerSession(authOptions)

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session!.user.id, courseId: params.id } },
  })
  if (!enrollment) notFound()

  const chapter = await prisma.chapter.findUnique({ where: { id: params.chapterId } })
  if (!chapter) notFound()

  return (
    <div>
      <QuizClient
        chapterId={params.chapterId}
        courseId={params.id}
        examType="chapter"
        title={`${chapter.title} — 章节测验`}
      />
    </div>
  )
}
