'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { ArrowLeft, Lock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

const inputCls = 'w-full px-4 h-11 border border-cocoa-300 rounded-lg bg-cocoa-50/50 text-sm text-cocoa-900 placeholder:text-cocoa-400 focus:outline-none focus:border-cocoa-600 focus:ring-2 focus:ring-cocoa-600/15 focus:bg-paper transition-all'
const labelCls = 'block text-[13px] font-medium text-cocoa-800 mb-1.5'

export default function ProfilePage() {
  const [form, setForm]       = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
    setSuccess(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.newPassword !== form.confirmPassword) {
      setError('两次输入的新密码不一致')
      return
    }
    setLoading(true)
    const res  = await fetch('/api/user/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) {
      setError(data.error || '修改失败，请重试')
    } else {
      setSuccess(true)
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setTimeout(() => signOut({ callbackUrl: '/login' }), 2000)
    }
  }

  return (
    <div className="space-y-6">
      {/* 页头 */}
      <div>
        <Link href="/zone"
          className="inline-flex items-center gap-1 text-sm text-cocoa-500 hover:text-cocoa-800 transition-colors mb-3">
          <ArrowLeft className="w-4 h-4" strokeWidth={2} /> 返回首页
        </Link>
        <h1 className="font-display text-2xl text-cocoa-900 tracking-tight">个人设置</h1>
      </div>

      {/* 修改密码卡片 */}
      <div className="bg-paper rounded-2xl border border-line shadow-card overflow-hidden max-w-md">
        <div className="px-5 py-4 border-b border-line/70"
          style={{ background: 'linear-gradient(135deg, #fdf4ec, #fbe6d6)' }}>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-cocoa-700" strokeWidth={2} />
            <h2 className="font-medium text-cocoa-900 text-sm">修改密码</h2>
          </div>
        </div>

        <div className="p-5">
          {success ? (
            <div className="flex items-center gap-3 text-cocoa-800 bg-cocoa-50 border border-cocoa-200 rounded-lg px-4 py-4 text-sm animate-fade-in">
              <CheckCircle2 className="w-6 h-6 text-cocoa-700 flex-shrink-0" strokeWidth={2} />
              <div>
                <p className="font-medium">密码修改成功！</p>
                <p className="text-xs text-cocoa-500 mt-0.5">即将跳转到登录页重新登录…</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={labelCls}>当前密码</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={form.currentPassword}
                  onChange={handleChange}
                  required
                  placeholder="请输入当前密码"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>新密码</label>
                <input
                  type="password"
                  name="newPassword"
                  value={form.newPassword}
                  onChange={handleChange}
                  required
                  minLength={6}
                  placeholder="至少 6 位"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>确认新密码</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="再次输入新密码"
                  className={inputCls}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sienna text-sm bg-blush/60 border border-cocoa-200 px-4 py-2.5 rounded-lg animate-fade-in">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" strokeWidth={2} /> {error}
                </div>
              )}

              <Button type="submit" disabled={loading} className="w-full mt-1">
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} /> 修改中…</>
                ) : '确认修改'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
