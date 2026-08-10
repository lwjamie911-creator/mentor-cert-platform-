'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle } from 'lucide-react'

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
      <p className="text-sm text-cocoa-600 leading-relaxed">
        请输入你的导师企业微信 ID（@ 之前的部分）完成绑定
      </p>
      <div className="flex gap-2">
        <input
          value={wxId}
          onChange={e => { setWxId(e.target.value); setError('') }}
          placeholder="例：jamielv"
          className="flex-1 px-4 py-2.5 border border-petal-200 rounded-lg text-sm text-cocoa-900 placeholder:text-cocoa-400 bg-petal-50/50 focus:outline-none focus:border-petal-500 focus:ring-2 focus:ring-petal-500/15 focus:bg-paper transition-all"
          onKeyDown={e => e.key === 'Enter' && handleBind()}
        />
        <button
          onClick={handleBind}
          disabled={loading || !wxId.trim()}
          className="px-5 py-2.5 rounded-lg text-sm font-medium text-paper bg-petal-700 hover:bg-petal-800 hover:-translate-y-0.5 hover:shadow-subtle transition-all active:scale-[0.97] disabled:opacity-50 flex-shrink-0"
        >
          {loading ? '绑定中…' : '确认绑定'}
        </button>
      </div>
      {error && (
        <div className="flex items-center gap-2 text-sienna text-xs bg-blush/60 border border-petal-200 px-3 py-2 rounded-lg">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2} /> {error}
        </div>
      )}
    </div>
  )
}
