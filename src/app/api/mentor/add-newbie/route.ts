import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: '请输入企业微信邮箱' }, { status: 400 })

  // 通过完整邮箱精确查找用户
  const newbie = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  })
  if (!newbie) return NextResponse.json({ error: `找不到邮箱为 "${email}" 的用户` }, { status: 404 })
  if (newbie.id === session.user.id) return NextResponse.json({ error: '不能添加自己' }, { status: 400 })

  // 检查是否已被其他导师绑定
  const existing = await prisma.mentorNewbiePair.findUnique({ where: { newbieId: newbie.id } })
  if (existing) {
    if (existing.mentorId === session.user.id) return NextResponse.json({ error: '该新人已在你的列表中' }, { status: 409 })
    return NextResponse.json({ error: '该新人已有导师' }, { status: 409 })
  }

  await prisma.mentorNewbiePair.create({
    data: { mentorId: session.user.id, newbieId: newbie.id },
  })

  return NextResponse.json({ ok: true, newbieName: newbie.name })
}
