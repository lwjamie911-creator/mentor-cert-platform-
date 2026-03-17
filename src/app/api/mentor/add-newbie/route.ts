import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { wxId } = await req.json()
  if (!wxId) return NextResponse.json({ error: '请输入企业微信ID' }, { status: 400 })

  // 通过邮箱前缀找到用户
  const newbie = await prisma.user.findFirst({
    where: { email: { startsWith: `${wxId}@` } },
  })
  if (!newbie) return NextResponse.json({ error: `找不到企业微信ID为 "${wxId}" 的用户` }, { status: 404 })
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
