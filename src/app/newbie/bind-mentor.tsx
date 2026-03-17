'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function NewbieBindMentor({ userId }: { userId: string }) {
  const router = useRouter()
  const [wxId, setWxId]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  async function handleBind() {
    if (!wxId.trim()) return
    setError('')
    setLoading(true)
    const res  = await fetch('/api/newbie/bind-mentor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mentorWxId: wxId.trim() }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) {
      setError(data.error || '绑定失败')
    } else {
      router.refresh()
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500 leading-relaxed">
        请输入你的导师企业微信 ID（@ 之前的部分）完成绑定
      </p>
      <div className="flex gap-2">
        <input
          value={wxId}
          onChange={e => { setWxId(e.target.value); setError('') }}
          placeholder="例：jamielv"
          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 bg-white transition-all placeholder:text-gray-300"
          onKeyDown={e => e.key === 'Enter' && handleBind()}
        />
        <button
          onClick={handleBind}
          disabled={loading || !wxId.trim()}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 disabled:opacity-50 flex-shrink-0"
          style={{ background: 'linear-gradient(90deg, #3b82f6, #6366f1)' }}
        >
          {loading ? '绑定中…' : '确认绑定'}
        </button>
      </div>
      {error && (
        <div className="flex items-center gap-2 text-red-500 text-xs bg-red-50 border border-red-100 px-3 py-2 rounded-xl">
          <span>⚠️</span> {error}
        </div>
      )}
    </div>
  )
}
