'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Sprout, GraduationCap, ClipboardCheck, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
    <div className="min-h-screen flex flex-col md:flex-row bg-cocoa-50">
      {/* ── 左侧品牌区 —— 粉+棕双色暖调 + 漂移光晕 ── */}
      <div className="hidden md:flex md:w-1/2 lg:w-[52%] flex-col justify-between relative overflow-hidden px-14 lg:px-20 py-16"
        style={{ background: 'linear-gradient(140deg, #fef6f7 0%, #fdeef0 30%, #fbe6d6 65%, #f5d9c4 100%)' }}>
        {/* 漂移暖色光晕 —— 粉/桃/棕三色 */}
        <div className="absolute top-[-8%] right-[-12%] w-[26rem] h-[26rem] rounded-full opacity-60 blur-3xl animate-drift-1"
          style={{ background: 'radial-gradient(circle, #fce4e6 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-14%] left-[-10%] w-96 h-96 rounded-full opacity-50 blur-3xl animate-drift-2"
          style={{ background: 'radial-gradient(circle, #f5d9c4 0%, transparent 70%)' }} />
        <div className="absolute top-[38%] left-[30%] w-80 h-80 rounded-full opacity-40 blur-3xl animate-drift-3"
          style={{ background: 'radial-gradient(circle, #e8c4ac 0%, transparent 70%)' }} />
        {/* 网点纹理 */}
        <div className="absolute inset-0 opacity-[0.35]" style={{
          backgroundImage: 'radial-gradient(#cf9c84 0.5px, transparent 0.5px)',
          backgroundSize: '24px 24px',
        }} />

        {/* logo */}
        <div className="relative z-10 flex items-center gap-3">
          <span className="w-9 h-9 rounded-lg bg-cocoa-800 flex items-center justify-center shadow-card">
            <Sprout className="w-4 h-4 text-blush" strokeWidth={2} />
          </span>
          <span className="text-cocoa-900 font-medium tracking-tight text-[15px]">TEG 秘书成长平台</span>
        </div>

        {/* 主文案 + 功能点介绍（登录前只做品牌介绍，不展示分区） */}
        <div className="relative z-10 max-w-md">
          <h1 className="font-display text-cocoa-900 text-[46px] leading-[1.22] tracking-tighter mb-6">
            让每一段成长，<br />都有迹可循
          </h1>
          <p className="text-cocoa-700 text-base leading-relaxed mb-12">
            导师认证 · 新人成长 · 师徒结对一体化<br />陪伴每一位秘书稳步成长
          </p>

          <div className="flex flex-col gap-4">
            {[
              { icon: GraduationCap, text: '导师资质认证体系', tint: 'bg-cocoa-200 text-cocoa-800' },
              { icon: Sprout, text: '新人成长追踪', tint: 'bg-petal-200 text-petal-800' },
              { icon: ClipboardCheck, text: '目标复盘与班会共创', tint: 'bg-blush text-sienna' },
            ].map(({ icon: Icon, text, tint }) => (
              <div key={text} className="flex items-center gap-3.5 text-cocoa-700 text-[15px]">
                <span className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 shadow-card ${tint}`}>
                  <Icon className="w-4 h-4" strokeWidth={2} />
                </span>
                {text}
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-cocoa-500 text-xs">TEG 办公室内务小组出品</p>
      </div>

      {/* ── 右侧表单区 —— 更多留白，不挤中间 ── */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-12 bg-paper">
        <div className="md:hidden flex items-center gap-2.5 mb-12">
          <span className="w-9 h-9 rounded-lg bg-cocoa-800 flex items-center justify-center">
            <Sprout className="w-4 h-4 text-blush" strokeWidth={2} />
          </span>
          <span className="font-medium text-cocoa-900 tracking-tight">TEG 秘书成长平台</span>
        </div>

        <div className="w-full max-w-md mx-auto animate-fade-up">
          <h2 className="font-display text-[32px] text-cocoa-900 mb-2 tracking-tight">欢迎回来</h2>
          <p className="text-cocoa-500 text-sm mb-10">登录你的账号，继续成长之旅</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[13px] font-medium text-cocoa-800 mb-2">企业邮箱</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="例：jamielv@tencent.com"
                className="w-full px-4 h-12 border border-cocoa-300 rounded-lg bg-cocoa-50/40 text-sm text-cocoa-900 placeholder:text-cocoa-400 focus:outline-none focus:border-cocoa-600 focus:ring-2 focus:ring-cocoa-600/15 focus:bg-paper transition-all"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-cocoa-800 mb-2">密码</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="请输入密码"
                className="w-full px-4 h-12 border border-cocoa-300 rounded-lg bg-cocoa-50/40 text-sm text-cocoa-900 placeholder:text-cocoa-400 focus:outline-none focus:border-cocoa-600 focus:ring-2 focus:ring-cocoa-600/15 focus:bg-paper transition-all"
              />
            </div>

            {error && (
              <div className="text-sienna text-sm bg-blush/60 border border-cocoa-200 px-4 py-3 rounded-lg animate-fade-in">
                {error}
              </div>
            )}

            <Button type="submit" size="lg" disabled={loading} className="w-full">
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> 登录中…</>
              ) : (
                <>登录 <ArrowRight className="w-4 h-4" /></>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-cocoa-500 mt-8">
            还没有账号？{' '}
            <Link href="/register" className="text-cocoa-800 font-medium hover:underline underline-offset-4">
              立即注册
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
