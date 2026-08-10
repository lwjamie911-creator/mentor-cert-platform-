// Next.js 在服务器实例启动时执行一次。
// 用途：预热数据库连接，让新 serverless 实例上的第一个真实请求
// 不必等待到 Neon 的冷 TLS 连接建立（新加坡区 RTT ~100ms + 连接握手）。
export async function register() {
  // 仅在 Node.js 运行时执行（跳过 edge / 构建阶段）
  if (process.env.NEXT_RUNTIME !== 'nodejs') return

  try {
    const { prisma } = await import('@/lib/prisma')
    await prisma.$queryRaw`SELECT 1`
    console.log('[instrumentation] 数据库连接已预热')
  } catch (e) {
    // 预热失败不应阻断启动，真实请求会自行重连
    console.warn('[instrumentation] 数据库预热失败（忽略）:', e)
  }
}
