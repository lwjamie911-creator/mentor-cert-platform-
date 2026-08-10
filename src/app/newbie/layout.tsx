export const dynamic = 'force-dynamic'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Sprout } from 'lucide-react'
import { SignOutButton } from '@/components/sign-out-button'

export default async function NewbieLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  return (
    <div className="min-h-screen flex flex-col bg-fog">
      {/* 顶部导航 */}
      <header className="bg-paper/80 backdrop-blur sticky top-0 z-10 border-b border-petal-100">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/zone"
              className="flex items-center gap-1.5 text-cocoa-500 hover:text-petal-700 text-sm transition-colors">
              <ArrowLeft className="w-4 h-4" strokeWidth={2} />
              <span className="hidden sm:inline">返回首页</span>
            </Link>
            <span className="text-petal-200">|</span>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-petal-600 flex items-center justify-center flex-shrink-0">
                <Sprout className="w-3.5 h-3.5 text-white" strokeWidth={2} />
              </span>
              <span className="font-semibold text-petal-900 text-sm">新人专区</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Link
              href="/dashboard/profile"
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-petal-50 transition-colors"
              title="个人设置 / 修改密码"
            >
              <div className="w-6 h-6 rounded-full bg-petal-100 flex items-center justify-center text-petal-700 font-bold text-xs">
                {session.user.name?.[0]?.toUpperCase() ?? '?'}
              </div>
              <span className="text-cocoa-600 hidden sm:block">{session.user.name}</span>
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* 顶部专区色条 —— 柔粉主色 + 蜜桃点缀渐变 */}
      <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #9d4552, #d67d8a, #fbe1d1)' }} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">{children}</main>
      <footer className="text-center text-xs text-cocoa-400 py-5">TEG办公室内务小组出品</footer>
    </div>
  )
}
