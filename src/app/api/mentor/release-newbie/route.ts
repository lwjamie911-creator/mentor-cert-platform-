import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { pairId } = await req.json()
  if (!pairId) return NextResponse.json({ error: '缺少 pairId' }, { status: 400 })

  // 确认这条配对属于当前导师
  const pair = await prisma.mentorNewbiePair.findUnique({ where: { id: pairId } })
  if (!pair) return NextResponse.json({ error: '配对不存在' }, { status: 404 })
  if (pair.mentorId !== session.user.id) return NextResponse.json({ error: '无权操作' }, { status: 403 })

  await prisma.mentorNewbiePair.delete({ where: { id: pairId } })

  return NextResponse.json({ ok: true })
}
