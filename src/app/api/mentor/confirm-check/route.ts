import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { newbieId, checkKey } = await req.json()
  if (!newbieId || !['A', 'B', 'C'].includes(checkKey)) {
    return NextResponse.json({ error: 'Invalid params' }, { status: 400 })
  }

  // 验证是该导师的新人
  const pair = await prisma.mentorNewbiePair.findFirst({
    where: { mentorId: session.user.id, newbieId },
  })
  if (!pair) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const field = `check${checkKey}_mentor` as any
  const fieldAt = `check${checkKey}_mentorAt` as any

  await prisma.newbieChecklist.update({
    where: { userId: newbieId },
    data: { [field]: true, [fieldAt]: new Date() },
  })

  // 检查 ABC 是否全部通过
  const cl = await prisma.newbieChecklist.findUnique({ where: { userId: newbieId } })
  if (cl && cl.checkA_mentor && cl.checkB_mentor && cl.checkC_mentor && !cl.allDoneAt) {
    await prisma.newbieChecklist.update({
      where: { userId: newbieId },
      data: { allDoneAt: new Date() },
    })
  }

  return NextResponse.json({ ok: true })
}
