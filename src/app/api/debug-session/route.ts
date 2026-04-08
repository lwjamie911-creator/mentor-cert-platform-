import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'no session' })
    }

    const sessionUserId = session.user.id
    const sessionEmail  = session.user.email

    // 用 session 里的 id 直接查
    const enrollments = sessionUserId
      ? await prisma.enrollment.findMany({ where: { userId: sessionUserId } })
      : []

    return NextResponse.json({
      session_user_id: sessionUserId,
      session_email: sessionEmail,
      enrollments_found: enrollments.length,
      enrollments,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
