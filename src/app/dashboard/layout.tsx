export const dynamic = 'force-dynamic'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { SignOutButton } from '@/components/sign-out-button'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const initial = session.user.name?.[0]?.toUpperCase() ?? '?'

  return (
    <div className="min-h-screen" style={{ background: '#f5f8ff' }}>
      {/* 顶部色条 */}
      <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #3b82f6, #6366f1, #8b5cf6)' }} />

      {/* 导航栏 */}
      <header className="sticky top-0 z-20 border-b border-blue-100/80"
        style={{ background: 'rgba(245,248,255,0.85)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 flex-shrink-0">
            <span className="text-lg">📚</span>
            <span className="font-bold text-gray-800 text-sm hidden sm:block">TEG秘书成长平台</span>
            <span className="font-bold text-gray-800 text-sm sm:hidden">成长平台</span>
          </Link>

          {/* 右侧 */}
          <div className="flex items-center gap-1 sm:gap-3">
            <Link
              href="/dashboard/certificates"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              <span>🏆</span>
              <span className="hidden sm:inline">我的证书</span>
            </Link>
            <Link
              href="/dashboard/profile"
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                {initial}
              </div>
              <span className="hidden sm:inline text-gray-700">{session.user.name}</span>
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">{children}</main>

      <footer className="text-center text-xs text-gray-400 py-6">
        <span className="opacity-60">让每一段成长，都有迹可循 · TEG办公室内务小组出品</span>
      </footer>
    </div>
  )
}
