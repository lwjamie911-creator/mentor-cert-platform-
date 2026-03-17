import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

async function checkAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') return null
  return session
}

const courseSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  deadlineDays: z.number().min(1).default(30),
  orderIndex: z.number().default(0),
  isPublished: z.boolean().default(false),
})

export async function GET() {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const courses = await prisma.course.findMany({ orderBy: { orderIndex: 'asc' } })
  return NextResponse.json(courses)
}

export async function POST(req: Request) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await req.json()
  const parsed = courseSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: '参数错误' }, { status: 400 })
  const course = await prisma.course.create({ data: parsed.data })
  return NextResponse.json(course, { status: 201 })
}
