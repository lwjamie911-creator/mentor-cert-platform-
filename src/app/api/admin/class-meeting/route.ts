import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET: 取所有班会列表（管理员后台用，按创建时间倒序）
export async function GET() {
  const session = await getServerSession(authOptions)
  if (session?.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const meetings = await prisma.classMeeting.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(meetings)
}

// POST: 管理员创建/更新某一期班会预告
//   - body 带 id → 更新该期；无 id → 新建一期
//   - isPublished=true 时，事务内把其它所有期置为 false，保证同时只上架一期
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (session?.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { id, title, timeText, location, description, posterBase64, isPublished } = body

  if (!title?.trim() || !timeText?.trim() || !location?.trim()) {
    return NextResponse.json({ error: '标题、时间、地点为必填项' }, { status: 400 })
  }

  const publish = isPublished === true
  const data = {
    title: title.trim(),
    timeText: timeText.trim(),
    location: location.trim(),
    description: description?.trim() || null,
    posterBase64: posterBase64 ?? null,
    isPublished: publish,
  }

  const meeting = await prisma.$transaction(async (tx) => {
    const saved = id
      ? await tx.classMeeting.update({ where: { id }, data })
      : await tx.classMeeting.create({ data })
    // 上架互斥：本期上架时，其它期全部下架
    if (publish) {
      await tx.classMeeting.updateMany({
        where: { id: { not: saved.id }, isPublished: true },
        data: { isPublished: false },
      })
    }
    return saved
  })

  return NextResponse.json(meeting)
}

// DELETE: 删除某一期班会（连带删除该期反馈，需前端二次确认）
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (session?.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: '缺少 id' }, { status: 400 })

  await prisma.classMeeting.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
