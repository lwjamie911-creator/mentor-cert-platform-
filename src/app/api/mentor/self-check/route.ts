import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const data: any = { userId: session.user.id }
  if (body.check1) data.check1 = true
  if (body.check2) data.check2 = true
  if (body.check3) data.check3 = true
  if (body.check4) data.check4 = true

  const existing = await prisma.mentorSelfCheck.findUnique({ where: { userId: session.user.id } })
  let record
  if (existing) {
    record = await prisma.mentorSelfCheck.update({ where: { userId: session.user.id }, data })
  } else {
    record = await prisma.mentorSelfCheck.create({ data })
  }

  // 检查是否四项全部完成
  if (record.check1 && record.check2 && record.check3 && record.check4 && !record.allDoneAt) {
    await prisma.mentorSelfCheck.update({
      where: { userId: session.user.id },
      data: { allDoneAt: new Date() },
    })
  }

  return NextResponse.json({ ok: true })
}
