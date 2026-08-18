import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { SignOutButton } from '@/components/sign-out-button'
import { LayoutDashboard, Users, BookOpen, FileText, Award, Handshake, Megaphone, Sprout } from 'lucide-react'

const navItems = [
  { href: '/admin',              label: '数据看板', icon: LayoutDashboard },
  { href: '/admin/users',        label: '用户管理', icon: Users },
  { href: '/admin/courses',      label: '课程管理', icon: BookOpen },
  { href: '/admin/questions',    label: '题库管理', icon: FileText },
  { href: '/admin/certificates', label: '证书管理', icon: Award },
  { href: '/admin/pairs',        label: '导师新人匹配', icon: Handshake },
  { href: '/admin/class-meeting', label: '班会管理', icon: Megaphone },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') redirect('/dashboard')

  return (
    <div className="min-h-screen bg-cocoa-50">
      {/* 顶部导航 */}
      <header className="bg-paper border-b border-line sticky top-0 z-10 shadow-card">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo + 标题 */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="w-7 h-7 rounded-lg bg-cocoa-800 flex items-center justify-center">
                <Sprout className="w-4 h-4 text-blush" strokeWidth={2} />
              </span>
              <span className="font-semibold text-cocoa-900 text-sm hidden sm:block">TEG秘书成长平台</span>
              <span className="text-cocoa-300 text-sm hidden sm:block">·</span>
              <span className="text-xs font-medium text-cocoa-700 bg-cocoa-100 px-2 py-0.5 rounded-full hidden sm:block">管理后台</span>
            </div>
            {/* 导航 */}
            <nav className="hidden md:flex gap-0.5">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-cocoa-600 hover:text-cocoa-900 hover:bg-cocoa-100 rounded-lg transition-all"
                >
                  <item.icon className="w-4 h-4" strokeWidth={2} />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* 右侧用户区 */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <div className="w-7 h-7 rounded-full bg-cocoa-100 flex items-center justify-center text-cocoa-700 font-bold text-xs flex-shrink-0">
                {session.user.name?.[0] ?? 'A'}
              </div>
              <span className="text-cocoa-600">{session.user.name}</span>
            </div>
            <SignOutButton />
          </div>
        </div>

        {/* 移动端底部 tab */}
        <div className="md:hidden flex border-t border-line overflow-x-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 flex flex-col items-center gap-0.5 py-2 text-cocoa-500 hover:text-cocoa-800 min-w-[60px]"
            >
              <item.icon className="w-4 h-4" strokeWidth={2} />
              <span className="text-[10px] whitespace-nowrap">{item.label}</span>
            </Link>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
      <footer className="text-center text-xs text-cocoa-400 py-6">TEG办公室内务小组出品</footer>
    </div>
  )
}
