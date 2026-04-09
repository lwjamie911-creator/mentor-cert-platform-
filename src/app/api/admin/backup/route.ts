import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [users, materials, selfChecks, certs, progress] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true, name: true, email: true, role: true,
        status: true, createdAt: true, lastLoginAt: true,
      },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.learningMaterial.findMany({ orderBy: { orderIndex: 'asc' } }),
    prisma.mentorSelfCheck.findMany(),
    prisma.mentorCertificate.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { issuedAt: 'desc' },
    }),
    prisma.learningProgress.findMany(),
  ])

  const backup = {
    exportedAt: new Date().toISOString(),
    summary: {
      users: users.length,
      materials: materials.length,
      selfChecks: selfChecks.length,
      certificates: certs.length,
      progressRecords: progress.length,
    },
    data: { users, materials, selfChecks, certificates: certs, learningProgress: progress },
  }

  return new NextResponse(JSON.stringify(backup, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="mentor-platform-backup-${
        new Date().toISOString().slice(0, 10)
      }.json"`,
    },
  })
}
