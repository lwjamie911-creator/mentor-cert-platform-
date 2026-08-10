export const dynamic = 'force-dynamic'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, Trophy } from 'lucide-react'
import { SignOutButton } from '@/components/sign-out-button'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const initial = session.user.name?.[0]?.toUpperCase() ?? '?'

  return (
    <div className="min-h-screen bg-cocoa-50">
      {/* 顶部色条 */}
      <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #5d2a1a, #9a5c44, #e8c4ac)' }} />

      {/* 导航栏 */}
      <header className="sticky top-0 z-20 border-b border-line"
        style={{ background: 'rgba(253,244,236,0.85)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 flex-shrink-0">
            <span className="w-8 h-8 rounded-lg bg-cocoa-800 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-blush" strokeWidth={2} />
            </span>
            <span className="font-medium text-cocoa-900 text-sm hidden sm:block tracking-tight">TEG 秘书成长平台</span>
            <span className="font-medium text-cocoa-900 text-sm sm:hidden tracking-tight">成长平台</span>
          </Link>

          {/* 右侧 */}
          <div className="flex items-center gap-1 sm:gap-3">
            <Link
              href="/dashboard/certificates"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-cocoa-700 hover:bg-cocoa-100 transition-colors"
            >
              <Trophy className="w-4 h-4" strokeWidth={2} />
              <span className="hidden sm:inline">我的证书</span>
            </Link>
            <Link
              href="/dashboard/profile"
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium text-cocoa-600 hover:bg-cocoa-100 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-cocoa-100 flex items-center justify-center text-cocoa-700 font-semibold text-xs">
                {initial}
              </div>
              <span className="hidden sm:inline text-cocoa-700">{session.user.name}</span>
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">{children}</main>

      <footer className="text-center text-xs text-cocoa-400 py-6">
        <span className="opacity-80">让每一段成长，都有迹可循 · TEG办公室内务小组出品</span>
      </footer>
    </div>
  )
}
