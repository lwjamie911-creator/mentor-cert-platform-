import { QuizClient } from '@/components/quiz-client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'

export default async function FinalExamPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session!.user.id, courseId: params.id } },
  })
  if (!enrollment) notFound()

  const course = await prisma.course.findUnique({ where: { id: params.id } })
  if (!course) notFound()

  return (
    <div>
      <QuizClient
        courseId={params.id}
        examType="final"
        title={`${course.title} — 期末考试`}
      />
    </div>
  )
}
