import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/learning/[zone] — 获取对应 zone 的学习资料 + 当前用户进度
export async function GET(_: Request, { params }: { params: { zone: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { zone } = params // mentor | newbie

  const materials = await prisma.learningMaterial.findMany({
    where: {
      isPublished: true,
      zone: { in: [zone, 'both'] },
    },
    orderBy: [{ orderIndex: 'asc' }],
  })

  const progress = await prisma.learningProgress.findMany({
    where: {
      userId: session.user.id,
      materialId: { in: materials.map(m => m.id) },
    },
  })
  const completedIds = new Set(progress.map(p => p.materialId))

  const result = materials.map(m => ({
    ...m,
    completed: completedIds.has(m.id),
  }))

  return NextResponse.json(result)
}
