import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
})

export async function POST(req: Request) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: '参数格式不正确' }, { status: 400 })
  }

  const { name, email, password } = parsed.data

  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) {
    return NextResponse.json({ error: '该邮箱已被注册' }, { status: 409 })
  }

  const hashed = await bcrypt.hash(password, 10)
  await prisma.user.create({
    data: { name, email, password: hashed, status: 'active' },
  })

  return NextResponse.json({ ok: true }, { status: 201 })
}
