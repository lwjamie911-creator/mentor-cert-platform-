import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Step 1: Mentor inputs newbie email → check admin pre-pair exists → return pair info
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: '请输入企业微信邮箱' }, { status: 400 })

  // Find newbie by email
  const newbie = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  })
  if (!newbie) return NextResponse.json({ error: `找不到邮箱为 "${email}" 的用户` }, { status: 404 })
  if (newbie.id === session.user.id) return NextResponse.json({ error: '不能添加自己' }, { status: 400 })

  // Check if admin has pre-paired this exact mentor+newbie
  const pair = await prisma.mentorNewbiePair.findFirst({
    where: {
      mentorId: session.user.id,
      newbieId: newbie.id,
      isAdminPaired: true,
    },
  })

  if (!pair) {
    // Check if newbie has any other pair (bound to different mentor)
    const otherPair = await prisma.mentorNewbiePair.findUnique({ where: { newbieId: newbie.id } })
    if (otherPair) {
      return NextResponse.json({ error: '该新人已有导师' }, { status: 409 })
    }
    return NextResponse.json({
      error: '您暂时没有权限认领该新人，请先和内务小组确认导师新人配对',
    }, { status: 403 })
  }

  if (pair.isConfirmed) {
    return NextResponse.json({ error: '该新人已在你的列表中' }, { status: 409 })
  }

  // Pre-pair found, not yet confirmed → return info so mentor can write 寄语
  return NextResponse.json({ ok: true, pairId: pair.id, newbieName: newbie.name })
}
