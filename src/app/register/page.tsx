'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const inputCls = 'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 bg-white transition-all placeholder:text-gray-300'
const labelCls = 'block text-xs font-semibold text-gray-500 mb-1.5'

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
    <div className="min-h-screen flex" style={{ background: '#f5f8ff' }}>

      {/* ── 左侧品牌区 ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[420px] flex-shrink-0 p-12"
        style={{ background: 'linear-gradient(160deg, #3730a3 0%, #4f46e5 40%, #7c3aed 100%)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-xl">🌱</div>
          <span className="text-white font-bold text-base tracking-wide">TEG秘书成长平台</span>
        </div>

        {/* 中间文案 */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white/70 text-xs mb-6">
            ✨ 加入我们
          </div>
          <h2 className="text-3xl font-bold text-white leading-snug mb-3">
            开启你的<br />成长之旅
          </h2>
          <p className="text-white/60 text-sm leading-relaxed mb-8">
            让每一段成长，都有迹可循
          </p>

          {/* 步骤说明 */}
          <div className="space-y-4">
            {[
              { icon: '📝', title: '注册账号', desc: '填写姓名、邮箱完成注册' },
              { icon: '📚', title: '学习课程', desc: '系统学习导师认证所需知识' },
              { icon: '🏆', title: '获得认证', desc: '通过考核，领取专属证书' },
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center text-base flex-shrink-0">
                  {step.icon}
                </div>
                <div>
                  <div className="text-white text-sm font-semibold">{step.title}</div>
                  <div className="text-white/50 text-xs mt-0.5">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 底部 */}
        <p className="text-white/30 text-xs">TEG办公室内务小组出品</p>
      </div>

      {/* ── 右侧表单区 ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">

        {/* 移动端 Logo */}
        <div className="lg:hidden flex items-center gap-2 mb-8">
          <span className="text-2xl">🌱</span>
          <span className="font-bold text-gray-800">TEG秘书成长平台</span>
        </div>

        <div className="w-full max-w-sm">
          {/* 标题 */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">创建账号</h1>
            <p className="text-sm text-gray-400 mt-1">注册后即可参与课程学习</p>
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
              <p className="text-xs text-gray-400 mt-1.5 ml-1">
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
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-100 px-4 py-3 rounded-xl">
                <span>⚠️</span> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 disabled:opacity-60 mt-2"
              style={{ background: loading ? '#a5b4fc' : 'linear-gradient(90deg, #4f46e5, #7c3aed)' }}
            >
              {loading ? '注册中…' : '注册账号'}
            </button>
          </form>

          {/* 登录链接 */}
          <p className="text-center text-sm text-gray-400 mt-6">
            已有账号？{' '}
            <Link href="/login" className="text-indigo-600 font-semibold hover:underline">
              立即登录
            </Link>
          </p>
        </div>

        {/* 移动端底部 */}
        <p className="lg:hidden text-xs text-gray-300 mt-10">TEG办公室内务小组出品</p>
      </div>
    </div>
  )
}
