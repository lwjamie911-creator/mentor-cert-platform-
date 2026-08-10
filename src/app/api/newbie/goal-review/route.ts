import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isTencentDocUrl } from '@/lib/utils'

const ALLOWED_FIELDS = ['workGoalUrl', 'month1Url', 'month2Url', 'month3Url'] as const
type Field = (typeof ALLOWED_FIELDS)[number]

// POST: 新人提交/更新某一项文档链接（工作目标 或 第1/2/3个月月报）
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { field, url } = await req.json()

  if (!ALLOWED_FIELDS.includes(field)) {
    return NextResponse.json({ error: '无效的提交项' }, { status: 400 })
  }

  // 允许传空（清空链接）；非空则必须是腾讯文档链接
  const trimmed = typeof url === 'string' ? url.trim() : ''
  if (trimmed && !isTencentDocUrl(trimmed)) {
    return NextResponse.json({ error: '请提供腾讯文档链接（doc.weixin.qq.com）' }, { status: 400 })
  }

  const value = trimmed || null
  const record = await prisma.newbieGoalReview.upsert({
    where: { userId: session.user.id },
    update: { [field as Field]: value },
    create: { userId: session.user.id, [field as Field]: value },
  })

  return NextResponse.json(record)
}
