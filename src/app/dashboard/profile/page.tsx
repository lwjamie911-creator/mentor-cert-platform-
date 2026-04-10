'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import Link from 'next/link'

const inputCls = 'w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 bg-white transition-all'
const labelCls = 'block text-xs font-semibold text-gray-500 mb-1.5'

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
          className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-indigo-600 transition-colors mb-3">
          ← 返回首页
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">个人设置</h1>
      </div>

      {/* 修改密码卡片 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden max-w-md">
        <div className="px-5 py-4 border-b border-gray-50"
          style={{ background: 'linear-gradient(135deg, #f8f7ff, #ede9fe)' }}>
          <div className="flex items-center gap-2">
            <span>🔒</span>
            <h2 className="font-bold text-indigo-800 text-sm">修改密码</h2>
          </div>
        </div>

        <div className="p-5">
          {success ? (
            <div className="flex items-center gap-3 text-green-700 bg-green-50 border border-green-100 rounded-xl px-4 py-4 text-sm">
              <span className="text-xl">✅</span>
              <div>
                <p className="font-semibold">密码修改成功！</p>
                <p className="text-xs text-green-600 mt-0.5">即将跳转到登录页重新登录…</p>
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
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-100 px-4 py-3 rounded-xl">
                  <span>⚠️</span> {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white shadow-sm transition-all disabled:opacity-60"
                style={{ background: loading ? '#a5b4fc' : 'linear-gradient(90deg, #4f46e5, #7c3aed)' }}
              >
                {loading ? '修改中…' : '确认修改'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
