import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const pair = await prisma.mentorNewbiePair.findUnique({ where: { id: params.id } })
  if (!pair) return NextResponse.json({ error: '配对不存在' }, { status: 404 })

  await prisma.mentorNewbiePair.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
