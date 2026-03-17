import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

async function checkAdmin() {
  const session = await getServerSession(authOptions)
  return session?.user.role === 'admin' ? session : null
}

const chapterSchema = z.object({
  courseId: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  contentType: z.enum(['text', 'pdf', 'external_link']),
  contentText: z.string().optional(),
  contentUrl: z.string().optional(),
  minReadSeconds: z.number().default(0),
  orderIndex: z.number().default(0),
  isRequired: z.boolean().default(true),
})

export async function POST(req: Request) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await req.json()
  const parsed = chapterSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: '参数错误' }, { status: 400 })
  const chapter = await prisma.chapter.create({ data: parsed.data })
  return NextResponse.json(chapter, { status: 201 })
}
