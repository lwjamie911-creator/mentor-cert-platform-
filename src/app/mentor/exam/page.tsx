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
  const otherQs    = allQuestions.filter(q => q.type !== 'matching')

  // 打乱其余题目，取4道；加上1道连线题，共5道
  const shuffledOthers = otherQs.sort(() => Math.random() - 0.5).slice(0, 4)
  const pickedMatching = matchingQs.sort(() => Math.random() - 0.5).slice(0, 1)

  // 再整体打乱顺序，让连线题位置随机
  const questions = [...shuffledOthers, ...pickedMatching].sort(() => Math.random() - 0.5)

  return <MentorExamClient questions={questions} />
}
