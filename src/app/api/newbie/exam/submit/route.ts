import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { answers, questionIds, subjectiveAnswer } = await req.json()

  const questions = await prisma.question.findMany({ where: { id: { in: questionIds } } })

  let correctCount = 0
  for (const q of questions) {
    const correct: string[] = JSON.parse(q.answer)
    const user = answers[q.id]
    const userArr = Array.isArray(user) ? user : user ? [user] : []
    if (userArr.length === correct.length && correct.every(a => userArr.includes(a))) correctCount++
  }

  const total = questions.length
  const score = total > 0 ? Math.round((correctCount / total) * 100) : 0
  const passed = score >= 60

  // 保存考试结果（允许重考，覆盖旧记录）
  await prisma.newbieExam.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      score, totalQuestions: total, correctCount, passed,
      answers: JSON.stringify(answers),
      subjectiveAnswer: subjectiveAnswer || null,
      submittedAt: new Date(),
    },
    update: {
      score, totalQuestions: total, correctCount, passed,
      answers: JSON.stringify(answers),
      subjectiveAnswer: subjectiveAnswer || null,
      submittedAt: new Date(),
    },
  })

  // 通过则颁发勋章
  if (passed) {
    const existing = await prisma.newbieBadge.findUnique({ where: { userId: session.user.id } })
    if (!existing) {
      const today = new Date()
      const dateStr = today.getFullYear().toString() +
        String(today.getMonth() + 1).padStart(2, '0') +
        String(today.getDate()).padStart(2, '0')
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)
      const todayCount = await prisma.newbieBadge.count({ where: { issuedAt: { gte: startOfDay, lt: endOfDay } } })
      const badgeNo = `TEG-N-${dateStr}-${String(todayCount + 1).padStart(4, '0')}`
      await prisma.newbieBadge.create({ data: { userId: session.user.id, badgeNo } })
    }
  }

  return NextResponse.json({ score, correctCount, total, passed })
}
