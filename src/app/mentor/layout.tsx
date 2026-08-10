export const dynamic = 'force-dynamic'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, GraduationCap } from 'lucide-react'
import { SignOutButton } from '@/components/sign-out-button'

export default async function MentorLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  return (
    <div className="min-h-screen flex flex-col bg-fog">
      {/* 顶部导航 */}
      <header className="bg-paper/80 backdrop-blur sticky top-0 z-10 border-b border-line">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/zone"
              className="flex items-center gap-1.5 text-slate hover:text-cocoa-800 text-sm transition-colors">
              <ArrowLeft className="w-4 h-4" strokeWidth={2} />
              <span className="hidden sm:inline">返回首页</span>
            </Link>
            <span className="text-line">|</span>
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-cocoa-800 flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-4 h-4 text-blush" strokeWidth={2} />
              </span>
              <span className="font-semibold text-cocoa-900 text-sm">导师专区</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Link
              href="/dashboard/profile"
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-cocoa-100 transition-colors"
              title="个人设置 / 修改密码"
            >
              <div className="w-6 h-6 rounded-full bg-cocoa-200 flex items-center justify-center text-cocoa-800 font-bold text-xs">
                {session.user.name?.[0]?.toUpperCase() ?? '?'}
              </div>
              <span className="text-slate hidden sm:block">{session.user.name}</span>
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* 顶部专区色条 */}
      <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #5d2a1a, #9a5c44, #cf9c84)' }} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 lg:px-10 py-10">{children}</main>
      <footer className="text-center text-xs text-cocoa-400 py-5">TEG办公室内务小组出品</footer>
    </div>
  )
}
