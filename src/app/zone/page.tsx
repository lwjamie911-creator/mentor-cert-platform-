import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { SignOutButton } from '@/components/sign-out-button'

export default async function ZonePage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(160deg, #f8f7ff 0%, #f0eeff 50%, #fdf8ff 100%)' }}>

      {/* 顶部导航 */}
      <header className="bg-white/70 backdrop-blur border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌱</span>
            <span className="font-bold text-gray-900 text-sm">TEG秘书成长平台</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Link
              href="/dashboard/profile"
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
              title="个人设置 / 修改密码"
            >
              <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                {session.user.name?.[0]?.toUpperCase() ?? '?'}
              </div>
              <span className="text-gray-500 hidden sm:block">{session.user.name}</span>
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* 背景装饰 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        {/* 大光晕 */}
        <div className="absolute top-[-120px] right-[-120px] w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-80px] left-[-80px] w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 70%)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.04) 0%, transparent 60%)' }} />

        {/* 几何线条装饰 */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#7c3aed" strokeWidth="0.8"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* 漂浮圆点 */}
        <div className="absolute top-[18%] left-[8%] w-3 h-3 rounded-full bg-amber-300 opacity-30" />
        <div className="absolute top-[35%] right-[12%] w-2 h-2 rounded-full bg-violet-400 opacity-25" />
        <div className="absolute top-[65%] left-[15%] w-4 h-4 rounded-full bg-indigo-300 opacity-20" />
        <div className="absolute top-[75%] right-[8%] w-2.5 h-2.5 rounded-full bg-amber-400 opacity-25" />
        <div className="absolute top-[20%] right-[30%] w-1.5 h-1.5 rounded-full bg-violet-500 opacity-20" />

        {/* 菱形装饰 */}
        <div className="absolute top-[28%] left-[20%] w-5 h-5 bg-amber-200 opacity-20 rotate-45" />
        <div className="absolute bottom-[25%] right-[22%] w-4 h-4 bg-violet-200 opacity-20 rotate-45" />

        {/* 弧线 */}
        <svg className="absolute bottom-0 left-0 w-64 h-64 opacity-[0.06]" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 200 Q100 100 200 0" fill="none" stroke="#a855f7" strokeWidth="1.5"/>
          <path d="M0 200 Q80 120 200 40" fill="none" stroke="#a855f7" strokeWidth="1"/>
        </svg>
        <svg className="absolute top-0 right-0 w-64 h-64 opacity-[0.06]" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path d="M200 0 Q100 100 0 200" fill="none" stroke="#f59e0b" strokeWidth="1.5"/>
          <path d="M200 0 Q120 80 0 160" fill="none" stroke="#f59e0b" strokeWidth="1"/>
        </svg>
      </div>

      {/* 主内容 */}
      <main className="relative flex-1 flex flex-col items-center justify-center px-4 py-12" style={{ zIndex: 1 }}>

        {/* 问候区 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur text-indigo-600 text-xs font-medium px-5 py-2 rounded-full mb-5 shadow-sm border border-indigo-100 tracking-widest">
            <span className="w-12 h-px bg-gradient-to-r from-transparent to-indigo-300" />
            让每一段成长，都有迹可循
            <span className="w-12 h-px bg-gradient-to-l from-transparent to-indigo-300" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">
            你好，{session.user.name}
          </h1>
          <p className="text-gray-400 text-sm">选择你的专区，开启今天的成长</p>
        </div>

        {/* 双专区卡片 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">

          {/* 新人专区 — 建设中 */}
          <div className="relative overflow-hidden rounded-3xl p-8 cursor-not-allowed select-none"
            style={{ background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)', border: '1.5px solid #e5e7eb' }}>
            {/* 装饰 */}
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-[0.06]"
              style={{ background: 'radial-gradient(circle, #6b7280, transparent)', transform: 'translate(30%,-30%)' }} />
            <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full opacity-[0.04]"
              style={{ background: 'radial-gradient(circle, #9ca3af, transparent)', transform: 'translate(-30%,30%)' }} />

            {/* 建设中角标 */}
            <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-gray-200/80 text-gray-500 text-xs font-medium px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse" />
              即将上线
            </div>

            <div className="text-5xl mb-5 grayscale opacity-30">🌱</div>
            <h2 className="text-2xl font-bold text-gray-300 mb-2">新人专区</h2>
            <p className="text-sm text-gray-400 leading-relaxed mb-5">
              该专区正在建设中，敬请期待
            </p>
            <div className="inline-flex items-center gap-1.5 text-xs text-gray-400 bg-gray-200/60 px-3 py-1.5 rounded-xl">
              🚧 建设中，稍后上线
            </div>
          </div>

          {/* 导师专区 */}
          <Link href="/mentor" className="group">
            <div className="relative overflow-hidden rounded-3xl p-8 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl cursor-pointer h-full"
              style={{ background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 60%, #fde68a 100%)', border: '1.5px solid #fcd34d' }}>
              {/* 装饰 */}
              <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-20"
                style={{ background: 'radial-gradient(circle, #f59e0b, transparent)', transform: 'translate(30%,-30%)' }} />
              <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-10"
                style={{ background: 'radial-gradient(circle, #fb923c, transparent)', transform: 'translate(-20%,20%)' }} />
              {/* 右下角小菱形装饰 */}
              <div className="absolute bottom-6 right-8 w-3 h-3 bg-amber-300 opacity-50 rotate-45" />
              <div className="absolute bottom-10 right-14 w-1.5 h-1.5 bg-amber-400 opacity-40 rotate-45" />

              <div className="text-5xl mb-5 relative z-10">🎓</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3 relative z-10">导师专区</h2>

              <div className="flex flex-col gap-2.5 mb-6 relative z-10">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center text-xs flex-shrink-0">✦</span>
                  <span>资质认证，加入导师池</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center text-xs flex-shrink-0">✦</span>
                  <span>跟踪新人进度，验收任务</span>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 text-sm text-amber-700 font-semibold group-hover:gap-2.5 transition-all relative z-10">
                进入导师专区 <span className="group-hover:translate-x-0.5 transition-transform">→</span>
              </div>
            </div>
          </Link>
        </div>

      </main>

      <footer className="relative text-center text-xs text-gray-400 py-5" style={{ zIndex: 1 }}>
        TEG办公室内务小组出品
      </footer>
    </div>
  )
}
