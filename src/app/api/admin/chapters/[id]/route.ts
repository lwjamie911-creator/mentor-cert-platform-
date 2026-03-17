import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function checkAdmin() {
  const session = await getServerSession(authOptions)
  return session?.user.role === 'admin' ? session : null
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await req.json()
  const chapter = await prisma.chapter.update({ where: { id: params.id }, data: body })
  return NextResponse.json(chapter)
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  await prisma.chapter.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
