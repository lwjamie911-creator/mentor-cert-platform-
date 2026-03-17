import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 获取课程详情（含章节、进度、报名状态）
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const course = await prisma.course.findUnique({
    where: { id: params.id },
    include: {
      chapters: { orderBy: { orderIndex: 'asc' } },
      enrollments: { where: { userId: session.user.id } },
      certificates: { where: { userId: session.user.id } },
    },
  })

  if (!course) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // 获取该用户在所有章节的进度
  const progress = await prisma.progress.findMany({
    where: {
      userId: session.user.id,
      chapterId: { in: course.chapters.map((c) => c.id) },
    },
  })

  return NextResponse.json({ course, progress })
}
