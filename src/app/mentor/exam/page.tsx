import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { MentorExamClient } from './exam-client'

export default async function MentorExamPage() {
  const session = await getServerSession(authOptions)

  // 四项自检全部完成才能进入
  const selfCheck = await prisma.mentorSelfCheck.findUnique({ where: { userId: session!.user.id } })
  if (!selfCheck?.check1 || !selfCheck?.check2 || !selfCheck?.check3 || !selfCheck?.check4) {
    redirect('/mentor')
  }

  // 从导师题库随机抽题：必抽连线题1道 + 其余随机抽取
  const allQuestions = await prisma.question.findMany({
    where: { zone: 'mentor' },
    select: { id: true, type: true, content: true, options: true, answer: true },
  })

  const matchingQs = allQuestions.filter(q => q.type === 'matching')
  const multipleQs = allQuestions.filter(q => q.type === 'multiple')
  const otherQs    = allQuestions.filter(q => q.type === 'single' || q.type === 'truefalse')

  // 必抽1道连线题 + 1道多选题 + 8道单选/判断题，共10道
  const pickedMatching = matchingQs.sort(() => Math.random() - 0.5).slice(0, 1)
  const pickedMultiple = multipleQs.sort(() => Math.random() - 0.5).slice(0, 1)
  const pickedOthers   = otherQs.sort(() => Math.random() - 0.5).slice(0, 8)

  // 整体打乱顺序
  const questions = [...pickedMatching, ...pickedMultiple, ...pickedOthers].sort(() => Math.random() - 0.5)

  return <MentorExamClient questions={questions} />
}
