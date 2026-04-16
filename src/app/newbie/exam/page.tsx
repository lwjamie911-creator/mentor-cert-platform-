import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { NewbieExamClient } from './exam-client'

export default async function NewbieExamPage() {
  const session = await getServerSession(authOptions)

  // 未完成所有学习资料，不能进考场
  const [materials, learningProgress] = await Promise.all([
    prisma.learningMaterial.findMany({
      where: { isPublished: true, zone: { in: ['newbie', 'both'] } },
      select: { id: true },
    }),
    prisma.learningProgress.findMany({ where: { userId: session!.user.id }, select: { materialId: true } }),
  ])
  const completedIds = new Set(learningProgress.map(p => p.materialId))
  const allMaterialsDone = materials.length === 0 || materials.every(m => completedIds.has(m.id))
  if (!allMaterialsDone) {
    redirect('/newbie')
  }

  // 从新人题库随机抽题：必抽连线题1道 + 多选题1道 + 其余随机抽取
  const allQuestions = await prisma.question.findMany({
    where: { zone: 'newbie' },
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

  return <NewbieExamClient questions={questions} />
}
