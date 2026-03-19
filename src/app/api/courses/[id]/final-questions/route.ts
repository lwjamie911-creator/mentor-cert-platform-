import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const questions = await prisma.question.findMany({
    where: { courseId: params.id },
    select: { id: true, type: true, content: true, options: true, answer: true, difficulty: true },
  })

  // 连线题把 answer（右侧项）也返回，供前端展示；其他题型 answer 不下发
  const result = questions
    .sort(() => Math.random() - 0.5)
    .map(q => ({
      id:       q.id,
      type:     q.type,
      content:  q.content,
      options:  JSON.parse(q.options),
      // 连线题需要右侧选项（存在 answer 字段中）
      ...(q.type === 'matching' ? { rightItems: JSON.parse(q.answer) } : {}),
      difficulty: q.difficulty,
    }))

  return NextResponse.json(result)
}
