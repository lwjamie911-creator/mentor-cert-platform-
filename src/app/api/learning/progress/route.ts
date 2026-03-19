import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/learning/progress — 标记某篇文档已读完
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { materialId } = await req.json()
  if (!materialId) return NextResponse.json({ error: '缺少 materialId' }, { status: 400 })

  const record = await prisma.learningProgress.upsert({
    where: { userId_materialId: { userId: session.user.id, materialId } },
    update: { completedAt: new Date() },
    create: { userId: session.user.id, materialId },
  })
  return NextResponse.json(record)
}
