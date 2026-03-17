import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import dayjs from 'dayjs'

// 报名课程
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const course = await prisma.course.findUnique({ where: { id: params.id } })
  if (!course || !course.isPublished) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 })
  }

  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId: params.id } },
  })
  if (existing) return NextResponse.json({ error: '已报名' }, { status: 409 })

  const deadline = dayjs().add(course.deadlineDays, 'day').toDate()
  const enrollment = await prisma.enrollment.create({
    data: { userId: session.user.id, courseId: params.id, deadline },
  })

  return NextResponse.json(enrollment, { status: 201 })
}
