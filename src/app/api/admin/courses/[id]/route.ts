import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

async function checkAdmin() {
  const session = await getServerSession(authOptions)
  return session?.user.role === 'admin' ? session : null
}

const patchSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  deadlineDays: z.number().min(1).optional(),
  orderIndex: z.number().optional(),
  isPublished: z.boolean().optional(),
})

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await req.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: '参数错误' }, { status: 400 })
  const course = await prisma.course.update({ where: { id: params.id }, data: parsed.data })
  return NextResponse.json(course)
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  await prisma.course.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
