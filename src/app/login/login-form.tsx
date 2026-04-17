'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await signIn('credentials', { email, password, redirect: false })
    setLoading(false)
    if (res?.error) {
      setError('邮箱或密码错误，请重试')
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* 左侧品牌区 */}
      <div className="hidden md:flex md:w-1/2 flex-col items-center justify-center relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #6366f1 100%)' }}>
        <div className="absolute top-[-80px] left-[-80px] w-72 h-72 rounded-full opacity-10 bg-white" />
        <div className="absolute bottom-[-60px] right-[-60px] w-56 h-56 rounded-full opacity-10 bg-white" />
        <div className="absolute top-1/2 right-[-40px] w-32 h-32 rounded-full opacity-10 bg-white" />

        <div className="relative z-10 text-center px-12">
          <div className="text-6xl mb-6">🌱</div>
          <h1 className="text-3xl font-bold text-white mb-3 tracking-wide">TEG秘书成长平台</h1>
          <p className="text-indigo-200 text-lg font-light tracking-widest mb-12">
            让每一段成长，都有迹可循
          </p>
          <div className="flex flex-col gap-4 text-left">
            {[
              { icon: '🎓', text: '导师认证体系' },
              { icon: '🌱', text: '新人成长追踪' },
              { icon: '📋', text: 'ABC 指标双确认' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-indigo-100 text-sm">
                <span className="text-xl">{icon}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="absolute bottom-6 text-indigo-300 text-xs">TEG办公室内务小组出品</p>
      </div>

      {/* 右侧表单区 */}
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 px-6 py-12">
        <div className="md:hidden text-center mb-8">
          <div className="text-4xl mb-2">🌱</div>
          <h1 className="text-xl font-bold text-gray-900">TEG秘书成长平台</h1>
          <p className="text-xs text-gray-400 mt-1 tracking-widest">让每一段成长，都有迹可循</p>
        </div>

        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">欢迎回来</h2>
          <p className="text-gray-400 text-sm mb-8">登录你的账号继续成长之旅</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">企业邮箱</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="例：jamielv@tencent.com"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-sm transition-shadow shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">密码</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="请输入密码"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-sm transition-shadow shadow-sm"
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm bg-red-50 border border-red-100 px-4 py-2.5 rounded-xl">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl font-semibold text-sm text-white transition-all shadow-sm"
              style={{ background: loading ? '#a5b4fc' : 'linear-gradient(90deg, #4f46e5, #7c3aed)' }}
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            还没有账号？{' '}
            <Link href="/register" className="text-indigo-600 hover:text-indigo-700 font-medium">
              立即注册
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
