import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 保活接口：防止 Neon 数据库休眠
// 由 Vercel Cron Job 每4分钟调用一次
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json({ ok: true, time: new Date().toISOString() })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
