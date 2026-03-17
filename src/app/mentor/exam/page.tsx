import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { MentorExamClient } from './exam-client'

export default async function MentorExamPage() {
  const session = await getServerSession(authOptions)

  // 自检未完成不能进入
  const selfCheck = await prisma.mentorSelfCheck.findUnique({ where: { userId: session!.user.id } })
  if (!selfCheck?.check1 || !selfCheck?.check2 || !selfCheck?.check3) {
    redirect('/mentor')
  }

  // 已有证书直接跳回
  const cert = await prisma.mentorCertificate.findUnique({ where: { userId: session!.user.id } })
  if (cert) redirect('/mentor')

  // 随机抽取5道题（从 courseId=null && chapterId=null 的共用题库，或直接从全库抽）
  const allQuestions = await prisma.question.findMany({
    select: { id: true, type: true, content: true, options: true },
  })
  const shuffled = allQuestions.sort(() => Math.random() - 0.5).slice(0, 5)

  return <MentorExamClient questions={shuffled} />
}
