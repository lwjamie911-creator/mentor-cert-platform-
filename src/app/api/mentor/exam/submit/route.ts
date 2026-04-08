import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { answers, questionIds } = await req.json()
  const questions = await prisma.question.findMany({ where: { id: { in: questionIds } } })

  let correctCount = 0

  for (const q of questions) {
    const correct: string[] = JSON.parse(q.answer)
    const user = answers[q.id]

    if (q.type === 'matching') {
      // user = { leftIndex: rightIndex(origIndex) }，correct = 右侧文字数组（顺序对应左侧）
      // 只要每个左侧项连到了正确的右侧位置（origIndex === leftIndex）即为正确
      const leftCount = JSON.parse(q.options).length
      let allMatch = true
      for (let li = 0; li < leftCount; li++) {
        if (!user || user[li] !== li) { allMatch = false; break }
      }
      if (allMatch) correctCount++
    } else {
      const userArr = Array.isArray(user) ? user : user ? [user] : []
      if (userArr.length === correct.length && correct.every(a => userArr.includes(a))) correctCount++
    }
  }

  const total = questions.length
  const score = total > 0 ? Math.round((correctCount / total) * 100) : 0
  const passed = score >= 80

  if (passed) {
    const existing = await prisma.mentorCertificate.findUnique({ where: { userId: session.user.id } })
    if (!existing) {
      const today = new Date()
      const dateStr = today.getFullYear().toString() +
        String(today.getMonth() + 1).padStart(2, '0') +
        String(today.getDate()).padStart(2, '0')
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const endOfDay   = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)
      const todayCount = await prisma.mentorCertificate.count({
        where: { issuedAt: { gte: startOfDay, lt: endOfDay } },
      })
      const certNo = `TEG-M-${dateStr}-${String(todayCount + 1).padStart(4, '0')}`
      await prisma.mentorCertificate.create({
        data: {
          userId: session.user.id,
          certificateNo: certNo,
          score,
          expiresAt: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000),
        },
      })
    }
  }

  return NextResponse.json({ score, correctCount, total, passed })
}
