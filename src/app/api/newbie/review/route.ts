import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const MAX_PHOTOS = 9

// POST: 新人/导师提交或更新班会感言（绑定当前上架的那一期班会）
//   每人每期一条，反复保存即更新同一条（userId + meetingId 复合唯一键）
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // 当前上架期
  const meeting = await prisma.classMeeting.findFirst({
    where: { isPublished: true },
    orderBy: { createdAt: 'desc' },
    select: { id: true },
  })
  if (!meeting) {
    return NextResponse.json({ error: '当前没有正在进行中的班会，暂不能提交感言' }, { status: 400 })
  }

  const { text, photos } = await req.json()

  if (photos !== undefined && !Array.isArray(photos)) {
    return NextResponse.json({ error: '照片格式错误' }, { status: 400 })
  }
  if (Array.isArray(photos) && photos.length > MAX_PHOTOS) {
    return NextResponse.json({ error: `最多上传 ${MAX_PHOTOS} 张照片` }, { status: 400 })
  }

  const photosJson = Array.isArray(photos) ? JSON.stringify(photos) : null
  const textValue = typeof text === 'string' ? text : null

  const record = await prisma.newbieReview.upsert({
    where: { userId_meetingId: { userId: session.user.id, meetingId: meeting.id } },
    update: { text: textValue, photosJson },
    create: { userId: session.user.id, meetingId: meeting.id, text: textValue, photosJson },
  })

  return NextResponse.json({ ok: true, updatedAt: record.updatedAt })
}
