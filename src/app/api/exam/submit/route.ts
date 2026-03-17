import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 提交考试答案，返回成绩
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { examType, chapterId, courseId, answers } = await req.json()
  // answers: { [questionId]: string | string[] }

  let questions: any[]
  if (examType === 'chapter' && chapterId) {
    questions = await prisma.question.findMany({ where: { chapterId } })
  } else if (examType === 'final' && courseId) {
    questions = await prisma.question.findMany({ where: { courseId } })
  } else {
    return NextResponse.json({ error: 'Invalid params' }, { status: 400 })
  }

  let correctCount = 0
  for (const q of questions) {
    const correctAnswer: string[] = JSON.parse(q.answer)
    const userAnswer = answers[q.id]
    const userArr = Array.isArray(userAnswer) ? userAnswer : userAnswer ? [userAnswer] : []
    const correct =
      userArr.length === correctAnswer.length &&
      correctAnswer.every((a) => userArr.includes(a))
    if (correct) correctCount++
  }

  const total = questions.length
  const score = total > 0 ? Math.round((correctCount / total) * 100) : 0
  const passThreshold = 60
  const passed = score >= passThreshold

  const attempt = await prisma.examAttempt.create({
    data: {
      userId: session.user.id,
      examType,
      chapterId: chapterId ?? null,
      courseId: courseId ?? null,
      score,
      totalQuestions: total,
      correctCount,
      passThreshold,
      passed,
      answers: JSON.stringify(answers),
      submittedAt: new Date(),
    },
  })

  // 如果是期末考试且通过，颁发证书
  if (examType === 'final' && passed && courseId) {
    const existing = await prisma.certificate.findUnique({
      where: { userId_courseId: { userId: session.user.id, courseId } },
    })
    if (!existing) {
      const today = new Date()
      const dateStr = today.getFullYear().toString() +
        String(today.getMonth() + 1).padStart(2, '0') +
        String(today.getDate()).padStart(2, '0')
      // 当天已颁发数量，用于生成序号
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)
      const todayCount = await prisma.certificate.count({
        where: { issuedAt: { gte: startOfDay, lt: endOfDay } },
      })
      const seq = String(todayCount + 1).padStart(4, '0')
      const certNo = `TEG-${dateStr}-${seq}`
      const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 2) // 2年
      await prisma.certificate.create({
        data: {
          userId: session.user.id,
          courseId,
          certificateNo: certNo,
          expiresAt,
        },
      })

      // 更新报名状态
      await prisma.enrollment.updateMany({
        where: { userId: session.user.id, courseId },
        data: { status: 'completed', completedAt: new Date() },
      })
    }
  }

  // 附带答案解析
  const questionsWithAnswer = questions.map((q) => ({
    id: q.id,
    content: q.content,
    options: JSON.parse(q.options),
    answer: JSON.parse(q.answer),
    explanation: q.explanation,
    userAnswer: answers[q.id],
  }))

  return NextResponse.json({ attempt, questions: questionsWithAnswer })
}
