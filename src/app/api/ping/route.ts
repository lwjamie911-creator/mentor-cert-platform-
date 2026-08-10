import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 保活接口：防止 Neon 数据库休眠 + 预热连接。
// 建议由外部定时服务（如 cron-job.org / UptimeRobot）每 4~5 分钟调用一次，
// 因为 Vercel Hobby 免费档 Cron 最高频率仅为每天一次，无法防住 Neon 的休眠。
export const dynamic = 'force-dynamic'

export async function GET() {
  const start = Date.now()
  try {
    // SELECT 1 唤醒计算节点；轻量 count 顺便预热常用表的连接
    await prisma.$queryRaw`SELECT 1`
    await prisma.user.count()
    return NextResponse.json({
      ok: true,
      ms: Date.now() - start,
      time: new Date().toISOString(),
    })
  } catch {
    return NextResponse.json({ ok: false, ms: Date.now() - start }, { status: 500 })
  }
}
