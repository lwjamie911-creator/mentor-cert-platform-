import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { NewbieExamClient } from './exam-client'

export default async function NewbieExamPage() {
  const session = await getServerSession(authOptions)

  // 未绑定导师或ABC未全部完成，不能进考场
  const checklist = await prisma.newbieChecklist.findUnique({ where: { userId: session!.user.id } })
  if (!checklist || !checklist.allDoneAt) {
    redirect('/newbie')
  }

  // 已有徽章直接跳回
  const badge = await prisma.newbieBadge.findUnique({ where: { userId: session!.user.id } })
  if (badge) redirect('/newbie/badge')

  // 随机抽取5道客观题
  const allQuestions = await prisma.question.findMany({
    select: { id: true, type: true, content: true, options: true },
  })
  const shuffled = allQuestions.sort(() => Math.random() - 0.5).slice(0, 5)

  return <NewbieExamClient questions={shuffled} />
}
