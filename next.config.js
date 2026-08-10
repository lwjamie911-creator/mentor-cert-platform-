// @ts-check
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // 启用 instrumentation.ts（服务器实例启动时预热数据库连接）
    instrumentationHook: true,
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localhost:3001'],
    },
  },
  // 构建时跳过数据库连接（Vercel 需要）
  output: 'standalone',
}

module.exports = nextConfig
