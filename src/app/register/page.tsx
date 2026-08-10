'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Sprout, UserPlus, BookOpen, Award, ArrowRight, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

const inputCls = 'w-full px-4 h-11 border border-cocoa-300 rounded-lg bg-cocoa-50/50 text-sm text-cocoa-900 placeholder:text-cocoa-400 focus:outline-none focus:border-cocoa-600 focus:ring-2 focus:ring-cocoa-600/15 focus:bg-paper transition-all'
const labelCls = 'block text-[13px] font-medium text-cocoa-800 mb-1.5'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm]     = useState({ name: '', email: '', password: '' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res  = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error || '注册失败，请重试')
    } else {
      router.push('/login?registered=1')
    }
  }

  return (
    <div className="min-h-screen flex bg-cocoa-50">

      {/* ── 左侧品牌区 —— 暖蜜桃渐变 + 漂移光晕 ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[420px] flex-shrink-0 p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(150deg, #fdf4ec 0%, #fbe6d6 45%, #f5d9c4 100%)' }}
      >
        {/* 漂移光晕 */}
        <div className="absolute top-[-10%] right-[-15%] w-96 h-96 rounded-full opacity-60 blur-3xl animate-drift-1"
          style={{ background: 'radial-gradient(circle, #fbe1d1 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-12%] left-[-10%] w-80 h-80 rounded-full opacity-50 blur-3xl animate-drift-2"
          style={{ background: 'radial-gradient(circle, #e8c4ac 0%, transparent 70%)' }} />
        {/* 网点纹理 */}
        <div className="absolute inset-0 opacity-[0.4]" style={{
          backgroundImage: 'radial-gradient(#cf9c84 0.5px, transparent 0.5px)',
          backgroundSize: '22px 22px',
        }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-lg bg-cocoa-800 flex items-center justify-center">
            <Sprout className="w-4 h-4 text-blush" strokeWidth={2} />
          </span>
          <span className="text-cocoa-900 font-medium tracking-tight">TEG 秘书成长平台</span>
        </div>

        {/* 中间文案 */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-paper/60 text-cocoa-600 text-xs mb-6">
            加入我们
          </div>
          <h2 className="font-display text-[32px] text-cocoa-900 leading-snug mb-3 tracking-tight">
            开启你的<br />成长之旅
          </h2>
          <p className="text-cocoa-700 text-sm leading-relaxed mb-8">
            让每一段成长，都有迹可循
          </p>

          {/* 步骤说明 */}
          <div className="space-y-4">
            {[
              { icon: UserPlus, title: '注册账号', desc: '填写姓名、邮箱完成注册' },
              { icon: BookOpen, title: '学习课程', desc: '系统学习导师认证所需知识' },
              { icon: Award, title: '获得认证', desc: '通过考核，领取专属证书' },
            ].map(({ icon: Icon, title, desc }, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-lg bg-paper/70 flex items-center justify-center flex-shrink-0 shadow-card">
                  <Icon className="w-4 h-4 text-cocoa-700" strokeWidth={2} />
                </span>
                <div>
                  <div className="text-cocoa-900 text-sm font-medium">{title}</div>
                  <div className="text-cocoa-500 text-xs mt-0.5">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 底部 */}
        <p className="relative z-10 text-cocoa-500 text-xs">TEG办公室内务小组出品</p>
      </div>

      {/* ── 右侧表单区 ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-paper">

        {/* 移动端 Logo */}
        <div className="lg:hidden flex items-center gap-2 mb-8">
          <span className="w-8 h-8 rounded-lg bg-cocoa-800 flex items-center justify-center">
            <Sprout className="w-4 h-4 text-blush" strokeWidth={2} />
          </span>
          <span className="font-medium text-cocoa-900 tracking-tight">TEG 秘书成长平台</span>
        </div>

        <div className="w-full max-w-sm animate-fade-up">
          {/* 标题 */}
          <div className="mb-8">
            <h1 className="font-display text-[28px] text-cocoa-900 tracking-tight">创建账号</h1>
            <p className="text-sm text-cocoa-500 mt-1">注册后即可参与课程学习</p>
          </div>

          {/* 表单 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelCls}>姓名</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="请输入真实姓名"
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>邮箱</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="请输入邮箱地址"
                className={inputCls}
              />
              <p className="text-xs text-cocoa-400 mt-1.5 ml-1">
                企业微信账号格式：企微ID@tencent.com
              </p>
            </div>

            <div>
              <label className={labelCls}>密码</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
                placeholder="至少 6 位"
                className={inputCls}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sienna text-sm bg-blush/60 border border-cocoa-200 px-4 py-2.5 rounded-lg animate-fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0" strokeWidth={2} /> {error}
              </div>
            )}

            <Button type="submit" size="lg" disabled={loading} className="w-full mt-2">
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} /> 注册中…</>
              ) : (
                <>注册账号 <ArrowRight className="w-4 h-4" strokeWidth={2} /></>
              )}
            </Button>
          </form>

          {/* 登录链接 */}
          <p className="text-center text-sm text-cocoa-500 mt-6">
            已有账号？{' '}
            <Link href="/login" className="text-cocoa-800 font-medium hover:underline underline-offset-4">
              立即登录
            </Link>
          </p>
        </div>

        {/* 移动端底部 */}
        <p className="lg:hidden text-xs text-cocoa-400 mt-10">TEG办公室内务小组出品</p>
      </div>
    </div>
  )
}
