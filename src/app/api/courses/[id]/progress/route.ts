import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 更新章节学习进度
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { chapterId, timeSpentSeconds, completed } = await req.json()

  const progress = await prisma.progress.upsert({
    where: { userId_chapterId: { userId: session.user.id, chapterId } },
    create: {
      userId: session.user.id,
      chapterId,
      status: completed ? 'completed' : 'in_progress',
      timeSpentSeconds: timeSpentSeconds ?? 0,
      startedAt: new Date(),
      completedAt: completed ? new Date() : null,
    },
    update: {
      timeSpentSeconds: timeSpentSeconds ?? 0,
      status: completed ? 'completed' : 'in_progress',
      completedAt: completed ? new Date() : undefined,
    },
  })

  return NextResponse.json(progress)
}
