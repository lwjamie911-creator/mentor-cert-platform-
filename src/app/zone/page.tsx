import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { SignOutButton } from '@/components/sign-out-button'

export default async function ZonePage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f8f7ff' }}>
      {/* 顶部导航 */}
      <header className="bg-white/80 backdrop-blur border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌱</span>
            <span className="font-bold text-gray-900 text-sm">TEG秘书成长平台</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-500 hidden sm:block">{session.user.name}</span>
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* 问候区 */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-medium px-3 py-1 rounded-full mb-4">
            <span>✦</span> 让每一段成长，都有迹可循
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            你好，{session.user.name} 👋
          </h1>
          <p className="text-gray-400 text-sm">请选择你今天要进入的专区</p>
        </div>

        {/* 双专区卡片 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-2xl">
          {/* 新人专区 */}
          <Link href="/newbie" className="group">
            <div className="relative overflow-hidden rounded-2xl p-7 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer h-full"
              style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', border: '1.5px solid #bfdbfe' }}>
              {/* 装饰圆 */}
              <div className="absolute top-[-20px] right-[-20px] w-32 h-32 rounded-full opacity-20"
                style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }} />

              <div className="text-4xl mb-4">🌱</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">新人专区</h2>
              <p className="text-sm text-gray-500 leading-relaxed mb-5">
                完成 ABC 成长指标与知识测试<br />获得三个月培养达标勋章
              </p>

              <div className="flex flex-col gap-1.5 mb-5">
                {['绑定导师', 'ABC 成长指标', '知识测试 + 勋章'].map((s, i) => (
                  <div key={s} className="flex items-center gap-2 text-xs text-blue-600">
                    <span className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 flex-shrink-0">
                      {i + 1}
                    </span>
                    {s}
                  </div>
                ))}
              </div>

              <div className="inline-flex items-center gap-1 text-sm text-blue-600 font-semibold group-hover:gap-2 transition-all">
                进入新人专区 <span>→</span>
              </div>
            </div>
          </Link>

          {/* 导师专区 */}
          <Link href="/mentor" className="group">
            <div className="relative overflow-hidden rounded-2xl p-7 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer h-full"
              style={{ background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', border: '1.5px solid #fde68a' }}>
              {/* 装饰圆 */}
              <div className="absolute top-[-20px] right-[-20px] w-32 h-32 rounded-full opacity-20"
                style={{ background: 'radial-gradient(circle, #f59e0b, transparent)' }} />

              <div className="text-4xl mb-4">🎓</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">导师专区</h2>
              <p className="text-sm text-gray-500 leading-relaxed mb-5">
                完成导师资质自检与认证测试<br />获得导师认证证书并管理新人
              </p>

              <div className="flex flex-col gap-1.5 mb-5">
                {['导师资质自检', '知识测试 + 证书', '管理我的新人'].map((s, i) => (
                  <div key={s} className="flex items-center gap-2 text-xs text-amber-700">
                    <span className="w-4 h-4 rounded-full bg-amber-100 flex items-center justify-center font-bold text-amber-700 flex-shrink-0">
                      {i + 1}
                    </span>
                    {s}
                  </div>
                ))}
              </div>

              <div className="inline-flex items-center gap-1 text-sm text-amber-600 font-semibold group-hover:gap-2 transition-all">
                进入导师专区 <span>→</span>
              </div>
            </div>
          </Link>
        </div>

        <p className="mt-8 text-xs text-gray-400">
          原有培训课程？
          <Link href="/dashboard" className="text-indigo-500 hover:underline ml-1">点此进入</Link>
        </p>
      </main>

      <footer className="text-center text-xs text-gray-400 py-5">TEG办公室内务小组出品</footer>
    </div>
  )
}
