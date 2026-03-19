import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (session?.user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const materials = await prisma.learningMaterial.findMany({
    orderBy: [{ zone: 'asc' }, { orderIndex: 'asc' }],
    include: { _count: { select: { progress: true } } },
  })
  return NextResponse.json(materials)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (session?.user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { title, subject, zone, contentText, minReadSeconds, orderIndex, isPublished } = await req.json()
  if (!title || !zone) return NextResponse.json({ error: '标题和适用范围不能为空' }, { status: 400 })

  const material = await prisma.learningMaterial.create({
    data: {
      title,
      subject: subject || '通用',
      zone,
      contentText: contentText || '',
      minReadSeconds: minReadSeconds ?? 0,
      orderIndex: orderIndex ?? 0,
      isPublished: isPublished ?? true,
    },
  })
  return NextResponse.json(material)
}
