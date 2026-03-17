import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { SignOutButton } from '@/components/sign-out-button'

export default async function NewbieLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f5f8ff' }}>
      {/* 顶部导航 */}
      <header className="bg-white/80 backdrop-blur sticky top-0 z-10 border-b border-blue-100">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/zone"
              className="flex items-center gap-1 text-gray-400 hover:text-gray-600 text-sm transition-colors">
              <span>←</span>
              <span className="hidden sm:inline">返回首页</span>
            </Link>
            <span className="text-gray-200">|</span>
            <div className="flex items-center gap-2">
              <span className="text-lg">🌱</span>
              <span className="font-bold text-gray-900 text-sm">新人专区</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-400 hidden sm:block">{session.user.name}</span>
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* 顶部专区色条 */}
      <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #3b82f6, #6366f1)' }} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">{children}</main>
      <footer className="text-center text-xs text-gray-300 py-5">TEG办公室内务小组出品</footer>
    </div>
  )
}
