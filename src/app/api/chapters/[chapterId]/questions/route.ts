import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 获取章节题目（考试用）
export async function GET(req: Request, { params }: { params: { chapterId: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const questions = await prisma.question.findMany({
    where: { chapterId: params.chapterId },
    select: { id: true, type: true, content: true, options: true, difficulty: true },
  })

  // 打乱顺序，不返回答案
  const shuffled = questions.sort(() => Math.random() - 0.5)
  return NextResponse.json(shuffled)
}
