import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { mentorWxId } = await req.json()
  if (!mentorWxId) return NextResponse.json({ error: '请输入导师企业微信ID' }, { status: 400 })

  const existing = await prisma.newbieChecklist.findUnique({ where: { userId: session.user.id } })
  if (existing) return NextResponse.json({ error: '已绑定导师' }, { status: 409 })

  // 验证导师存在（邮箱前缀匹配）
  const mentor = await prisma.user.findFirst({ where: { email: { startsWith: `${mentorWxId}@` } } })
  if (!mentor) return NextResponse.json({ error: `找不到企业微信ID为 "${mentorWxId}" 的用户` }, { status: 404 })
  if (mentor.id === session.user.id) return NextResponse.json({ error: '不能绑定自己' }, { status: 400 })

  await prisma.newbieChecklist.create({
    data: { userId: session.user.id, mentorWxId },
  })

  return NextResponse.json({ ok: true })
}
