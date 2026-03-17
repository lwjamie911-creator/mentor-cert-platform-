import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { checkKey } = await req.json()
  if (!['A', 'B', 'C'].includes(checkKey)) return NextResponse.json({ error: 'Invalid' }, { status: 400 })

  const field = `check${checkKey}_self` as any
  const fieldAt = `check${checkKey}_selfAt` as any

  await prisma.newbieChecklist.update({
    where: { userId: session.user.id },
    data: { [field]: true, [fieldAt]: new Date() },
  })

  return NextResponse.json({ ok: true })
}
