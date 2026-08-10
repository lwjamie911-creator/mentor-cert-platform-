import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Sprout } from 'lucide-react'
import { SignOutButton } from '@/components/sign-out-button'
import { ZoneCards } from './zone-cards'

export default async function ZonePage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  return (
    <div className="min-h-screen flex flex-col bg-fog">

      {/* 顶部导航 */}
      <header className="bg-paper/70 backdrop-blur border-b border-line sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-cocoa-800 flex items-center justify-center">
              <Sprout className="w-4 h-4 text-blush" strokeWidth={2} />
            </span>
            <span className="font-medium text-cocoa-900 text-sm tracking-tight">TEG 秘书成长平台</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Link
              href="/dashboard/profile"
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-cocoa-100 transition-colors"
              title="个人设置 / 修改密码"
            >
              <div className="w-6 h-6 rounded-full bg-cocoa-100 flex items-center justify-center text-cocoa-800 font-semibold text-xs">
                {session.user.name?.[0]?.toUpperCase() ?? '?'}
              </div>
              <span className="text-cocoa-600 hidden sm:block">{session.user.name}</span>
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* 背景装饰 —— 暖色漂移光晕 + 网点纹理 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div className="absolute top-[-120px] right-[-120px] w-[500px] h-[500px] rounded-full opacity-60 blur-3xl animate-drift-1"
          style={{ background: 'radial-gradient(circle, #fbe1d1 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-80px] left-[-80px] w-[400px] h-[400px] rounded-full opacity-50 blur-3xl animate-drift-2"
          style={{ background: 'radial-gradient(circle, #e8c4ac 0%, transparent 70%)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full opacity-40 blur-3xl animate-drift-3"
          style={{ background: 'radial-gradient(circle, #f5d9c4 0%, transparent 60%)' }} />

        {/* 细腻网点纹理 */}
        <div className="absolute inset-0 opacity-[0.3]" style={{
          backgroundImage: 'radial-gradient(#cf9c84 0.5px, transparent 0.5px)',
          backgroundSize: '22px 22px',
        }} />
      </div>

      {/* 主内容 */}
      <main className="relative flex-1 flex flex-col items-center justify-center px-4 py-16 sm:py-24" style={{ zIndex: 1 }}>

        {/* 问候区 */}
        <div className="text-center mb-16 animate-fade-up">
          <div className="inline-flex items-center gap-3 bg-paper/80 backdrop-blur text-cocoa-700 text-xs font-medium px-5 py-2 rounded-full mb-6 shadow-card border border-cocoa-200 tracking-widest">
            <span className="w-12 h-px bg-gradient-to-r from-transparent to-cocoa-300" />
            让每一段成长，都有迹可循
            <span className="w-12 h-px bg-gradient-to-l from-transparent to-cocoa-300" />
          </div>
          <h1 className="font-display text-5xl text-cocoa-900 mb-4 tracking-tight">
            你好，{session.user.name}
          </h1>
          <p className="text-cocoa-500 text-base">选择你的专区，开启今天的成长</p>
        </div>

        {/* 双专区卡片 */}
        <ZoneCards />

      </main>

      <footer className="relative text-center text-xs text-cocoa-500 py-5" style={{ zIndex: 1 }}>
        TEG办公室内务小组出品
      </footer>
    </div>
  )
}
