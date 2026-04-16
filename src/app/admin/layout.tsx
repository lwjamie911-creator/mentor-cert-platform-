import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { SignOutButton } from '@/components/sign-out-button'

const navItems = [
  { href: '/admin',              label: '数据看板', icon: '📊' },
  { href: '/admin/users',        label: '用户管理', icon: '👥' },
  { href: '/admin/courses',      label: '课程管理', icon: '📚' },
  { href: '/admin/questions',    label: '题库管理', icon: '📝' },
  { href: '/admin/certificates', label: '证书管理', icon: '🏆' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') redirect('/dashboard')

  return (
    <div className="min-h-screen" style={{ background: '#f8f7ff' }}>
      {/* 顶部导航 */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo + 标题 */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-lg">🌱</span>
              <span className="font-bold text-gray-900 text-sm hidden sm:block">TEG秘书成长平台</span>
              <span className="text-gray-300 text-sm hidden sm:block">·</span>
              <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full hidden sm:block">管理后台</span>
            </div>
            {/* 导航 */}
            <nav className="hidden md:flex gap-0.5">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="text-xs">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* 右侧用户区 */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs flex-shrink-0">
                {session.user.name?.[0] ?? 'A'}
              </div>
              <span className="text-gray-500">{session.user.name}</span>
            </div>
            <SignOutButton />
          </div>
        </div>

        {/* 移动端底部 tab */}
        <div className="md:hidden flex border-t border-gray-100 overflow-x-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 flex flex-col items-center gap-0.5 py-2 text-gray-500 hover:text-indigo-600 min-w-[60px]"
            >
              <span className="text-base">{item.icon}</span>
              <span className="text-[10px] whitespace-nowrap">{item.label}</span>
            </Link>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
      <footer className="text-center text-xs text-gray-300 py-6">TEG办公室内务小组出品</footer>
    </div>
  )
}
