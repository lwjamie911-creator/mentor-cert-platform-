import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 获取当前用户的课程列表（带报名状态和进度）
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    orderBy: { orderIndex: 'asc' },
    include: {
      chapters: { select: { id: true }, where: { isRequired: true } },
      enrollments: { where: { userId: session.user.id } },
      certificates: { where: { userId: session.user.id } },
    },
  })

  return NextResponse.json(courses)
}
