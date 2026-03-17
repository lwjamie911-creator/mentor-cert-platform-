import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const questions = await prisma.question.findMany({
    where: { courseId: params.id },
    select: { id: true, type: true, content: true, options: true, difficulty: true },
  })

  const shuffled = questions.sort(() => Math.random() - 0.5)
  return NextResponse.json(shuffled)
}
