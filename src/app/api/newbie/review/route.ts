import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const MAX_PHOTOS = 9

// POST: 新人提交/更新班会感言（文本 + 多张照片 base64）
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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
    where: { userId: session.user.id },
    update: { text: textValue, photosJson },
    create: { userId: session.user.id, text: textValue, photosJson },
  })

  return NextResponse.json({ ok: true, updatedAt: record.updatedAt })
}
