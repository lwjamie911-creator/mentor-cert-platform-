import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET: list all admin-created pairs
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const pairs = await prisma.mentorNewbiePair.findMany({
    where: { isAdminPaired: true },
    include: {
      mentor: { select: { id: true, name: true, email: true } },
      newbie: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(pairs)
}

// POST: admin creates a pre-pair (mentor + newbie)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { mentorEmail, newbieEmail } = await req.json()
  if (!mentorEmail || !newbieEmail)
    return NextResponse.json({ error: '请填写导师和新人邮箱' }, { status: 400 })

  const [mentor, newbie] = await Promise.all([
    prisma.user.findUnique({ where: { email: mentorEmail.trim().toLowerCase() } }),
    prisma.user.findUnique({ where: { email: newbieEmail.trim().toLowerCase() } }),
  ])

  if (!mentor) return NextResponse.json({ error: `找不到导师邮箱：${mentorEmail}` }, { status: 404 })
  if (!newbie) return NextResponse.json({ error: `找不到新人邮箱：${newbieEmail}` }, { status: 404 })
  if (mentor.id === newbie.id) return NextResponse.json({ error: '导师和新人不能是同一个人' }, { status: 400 })

  // check newbie not already paired
  const existing = await prisma.mentorNewbiePair.findUnique({ where: { newbieId: newbie.id } })
  if (existing) {
    return NextResponse.json({ error: '该新人已有配对记录' }, { status: 409 })
  }

  const pair = await prisma.mentorNewbiePair.create({
    data: {
      mentorId: mentor.id,
      newbieId: newbie.id,
      isAdminPaired: true,
      isConfirmed: false,
    },
    include: {
      mentor: { select: { id: true, name: true, email: true } },
      newbie: { select: { id: true, name: true, email: true } },
    },
  })

  return NextResponse.json(pair)
}
