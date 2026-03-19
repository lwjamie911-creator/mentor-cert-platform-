import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (session?.user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const data = await req.json()
  const material = await prisma.learningMaterial.update({
    where: { id: params.id },
    data,
  })
  return NextResponse.json(material)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (session?.user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await prisma.learningMaterial.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
