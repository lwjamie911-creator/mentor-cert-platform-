import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Step 2: Mentor submits 寄语 to confirm the pair
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { pairId, mentorMessage } = await req.json()
  if (!pairId) return NextResponse.json({ error: '缺少 pairId' }, { status: 400 })
  if (!mentorMessage || mentorMessage.trim().length < 10)
    return NextResponse.json({ error: '寄语至少需要 10 个字符' }, { status: 400 })

  const pair = await prisma.mentorNewbiePair.findUnique({ where: { id: pairId } })
  if (!pair) return NextResponse.json({ error: '配对不存在' }, { status: 404 })
  if (pair.mentorId !== session.user.id) return NextResponse.json({ error: '无权操作' }, { status: 403 })
  if (pair.isConfirmed) return NextResponse.json({ error: '已经认领过了' }, { status: 409 })

  await prisma.mentorNewbiePair.update({
    where: { id: pairId },
    data: {
      isConfirmed: true,
      mentorMessage: mentorMessage.trim(),
      confirmedAt: new Date(),
    },
  })

  return NextResponse.json({ ok: true })
}
