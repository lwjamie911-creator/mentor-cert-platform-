import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const SINGLETON_ID = 'singleton'

// GET: 取班会预告（管理员后台用）
export async function GET() {
  const session = await getServerSession(authOptions)
  if (session?.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const meeting = await prisma.classMeeting.findUnique({ where: { id: SINGLETON_ID } })
  return NextResponse.json(meeting ?? null)
}

// POST: 管理员创建/更新班会预告
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (session?.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { title, timeText, location, description, posterBase64, isPublished } = body

  if (!title?.trim() || !timeText?.trim() || !location?.trim()) {
    return NextResponse.json({ error: '标题、时间、地点为必填项' }, { status: 400 })
  }

  const data = {
    title: title.trim(),
    timeText: timeText.trim(),
    location: location.trim(),
    description: description?.trim() || null,
    posterBase64: posterBase64 ?? null,
    isPublished: isPublished !== false,
  }

  const meeting = await prisma.classMeeting.upsert({
    where: { id: SINGLETON_ID },
    update: data,
    create: { id: SINGLETON_ID, ...data },
  })

  return NextResponse.json(meeting)
}
