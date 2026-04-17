import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PATCH: update a pair (change mentor or newbie)
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { mentorEmail, newbieEmail } = await req.json()

  const pair = await prisma.mentorNewbiePair.findUnique({ where: { id: params.id } })
  if (!pair) return NextResponse.json({ error: '配对不存在' }, { status: 404 })

  const updates: Record<string, unknown> = { isAdminPaired: true }

  if (mentorEmail) {
    const mentor = await prisma.user.findUnique({ where: { email: mentorEmail.trim().toLowerCase() } })
    if (!mentor) return NextResponse.json({ error: `找不到导师邮箱：${mentorEmail}` }, { status: 404 })
    updates.mentorId = mentor.id
  }

  if (newbieEmail) {
    const newbie = await prisma.user.findUnique({ where: { email: newbieEmail.trim().toLowerCase() } })
    if (!newbie) return NextResponse.json({ error: `找不到新人邮箱：${newbieEmail}` }, { status: 404 })
    // make sure new newbie isn't already in another pair
    if (newbie.id !== pair.newbieId) {
      const existing = await prisma.mentorNewbiePair.findUnique({ where: { newbieId: newbie.id } })
      if (existing) return NextResponse.json({ error: '该新人已有其他配对记录' }, { status: 409 })
    }
    updates.newbieId = newbie.id
  }

  // check mentor !== newbie after update
  const finalMentorId = (updates.mentorId as string | undefined) ?? pair.mentorId
  const finalNewbieId = (updates.newbieId as string | undefined) ?? pair.newbieId
  if (finalMentorId === finalNewbieId)
    return NextResponse.json({ error: '导师和新人不能是同一个人' }, { status: 400 })

  // If mentor or newbie changed, reset confirmation state
  if (updates.mentorId || updates.newbieId) {
    updates.isConfirmed = false
    updates.mentorMessage = null
    updates.confirmedAt = null
  }

  const updated = await prisma.mentorNewbiePair.update({
    where: { id: params.id },
    data: updates,
    include: {
      mentor: { select: { id: true, name: true, email: true } },
      newbie: { select: { id: true, name: true, email: true } },
    },
  })

  return NextResponse.json(updated)
}

// DELETE: remove a pair
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const pair = await prisma.mentorNewbiePair.findUnique({ where: { id: params.id } })
  if (!pair) return NextResponse.json({ error: '配对不存在' }, { status: 404 })

  await prisma.mentorNewbiePair.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
