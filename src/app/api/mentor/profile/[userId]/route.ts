import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: read any mentor's profile (for newbie view)
export async function GET(_req: Request, { params }: { params: { userId: string } }) {
  const profile = await prisma.mentorProfile.findUnique({
    where: { userId: params.userId },
    include: {
      user: { select: { name: true, email: true } },
    },
  })

  if (!profile) return NextResponse.json(null)
  return NextResponse.json(profile)
}
