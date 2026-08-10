import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const ALLOWED_FIELDS = ['workGoalFeedback', 'month1Feedback', 'month2Feedback', 'month3Feedback'] as const
type Field = (typeof ALLOWED_FIELDS)[number]

// POST: 导师对名下新人的工作目标/月报填写评语
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { newbieId, field, feedback } = await req.json()

  if (!ALLOWED_FIELDS.includes(field)) {
    return NextResponse.json({ error: '无效的评语项' }, { status: 400 })
  }
  if (typeof newbieId !== 'string' || !newbieId) {
    return NextResponse.json({ error: '缺少新人信息' }, { status: 400 })
  }

  // 校验：该新人确实是当前导师名下、且已确认的配对
  const pair = await prisma.mentorNewbiePair.findUnique({
    where: { newbieId },
    select: { mentorId: true, isConfirmed: true },
  })
  if (!pair || pair.mentorId !== session.user.id || !pair.isConfirmed) {
    return NextResponse.json({ error: '无权对该新人填写评语' }, { status: 403 })
  }

  const trimmed = typeof feedback === 'string' ? feedback.trim() : ''
  const value = trimmed || null

  const record = await prisma.newbieGoalReview.upsert({
    where: { userId: newbieId },
    update: { [field as Field]: value },
    create: { userId: newbieId, [field as Field]: value },
  })

  return NextResponse.json(record)
}
