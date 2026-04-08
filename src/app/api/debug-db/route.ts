import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'testuser2@example.com' },
      select: { id: true, name: true }
    })
    const enrollments = user ? await prisma.enrollment.findMany({ where: { userId: user.id } }) : []
    const certs = user ? await prisma.certificate.findMany({ where: { userId: user.id } }) : []
    const progress = user ? await prisma.progress.findMany({ where: { userId: user.id } }) : []

    return NextResponse.json({
      user,
      enrollments,
      certificates: certs,
      progressCount: progress.length,
      env_url_prefix: process.env.POSTGRES_PRISMA_URL?.slice(0, 50) + '...',
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
