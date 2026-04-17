import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET: get the current mentor's own profile
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const profile = await prisma.mentorProfile.findUnique({
    where: { userId: session.user.id },
  })

  return NextResponse.json(profile ?? null)
}

// POST: create or update the current mentor's profile (upsert)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { yearsOfExperience, projectExperience, highlights, photoBase64 } = body

  const data: Record<string, string | null> = {}
  if (yearsOfExperience !== undefined) data.yearsOfExperience = yearsOfExperience ?? null
  if (projectExperience !== undefined) data.projectExperience = projectExperience ?? null
  if (highlights !== undefined) data.highlights = highlights ?? null
  if (photoBase64 !== undefined) data.photoBase64 = photoBase64 ?? null

  const profile = await prisma.mentorProfile.upsert({
    where: { userId: session.user.id },
    update: data,
    create: { userId: session.user.id, ...data },
  })

  return NextResponse.json(profile)
}
