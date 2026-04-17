'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface PairUser { id: string; name: string; email: string }
interface Pair {
  id: string
  mentorId: string
  newbieId: string
  isConfirmed: boolean
  mentorMessage: string | null
  confirmedAt: Date | string | null
  createdAt: Date | string
  mentor: PairUser
  newbie: PairUser
}

export function PairsClient({ initialPairs }: { initialPairs: Pair[] }) {
  const router = useRouter()
  const [pairs, setPairs] = useState<Pair[]>(initialPairs)
  const [mentorEmail, setMentorEmail] = useState('')
  const [newbieEmail, setNewbieEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  async function createPair() {
    if (!mentorEmail.trim() || !newbieEmail.trim()) return
    setError('')
    setLoading(true)
    const res = await fetch('/api/admin/pairs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mentorEmail: mentorEmail.trim(), newbieEmail: newbieEmail.trim() }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) {
      setError(data.error || '创建失败')
    } else {
      setMentorEmail('')
      setNewbieEmail('')
      setPairs([data, ...pairs])
    }
  }

  async function deletePair(id: string) {
    setDeletingId(id)
    const res = await fetch(`/api/admin/pairs/${id}`, { method: 'DELETE' })
    setDeletingId(null)
    setConfirmDeleteId(null)
    if (res.ok) {
      setPairs(pairs.filter(p => p.id !== id))
    }
  }

  return (
    <div className="space-y-6">
      {/* 创建配对表单 */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-base">🤝</span> 新增导师新人配对
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">导师邮箱</label>
            <input
              value={mentorEmail}
              onChange={e => { setMentorEmail(e.target.value); setError('') }}
              placeholder="例：mentor@tencent.com"
              type="email"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 placeholder:text-gray-300 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">新人邮箱</label>
            <input
              value={newbieEmail}
              onChange={e => { setNewbieEmail(e.target.value); setError('') }}
              placeholder="例：newbie@tencent.com"
              type="email"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 placeholder:text-gray-300 transition-all"
            />
          </div>
        </div>
        {error && (
          <div className="mb-4 flex items-center gap-2 text-red-500 text-xs bg-red-50 border border-red-100 px-3 py-2 rounded-xl">
            <span>⚠️</span> {error}
          </div>
        )}
        <button
          onClick={createPair}
          disabled={loading || !mentorEmail.trim() || !newbieEmail.trim()}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 disabled:opacity-50"
          style={{ background: 'linear-gradient(90deg,#6366f1,#8b5cf6)' }}
        >
          {loading ? '配对中…' : '+ 创建配对'}
        </button>
      </div>

      {/* 配对列表 */}
      {pairs.length === 0 ? (
        <div className="text-center py-16 text-gray-300">
          <div className="text-4xl mb-3">🤝</div>
          <p className="text-sm">暂无配对，请在上方创建</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pairs.map(pair => (
            <div key={pair.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
                {/* Mentor */}
                <div className="flex items-center gap-2.5 flex-1">
                  <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm flex-shrink-0">
                    {pair.mentor.name?.[0] ?? '?'}
                  </div>
                  <div>
                    <p className="text-xs text-amber-600 font-semibold mb-0.5">导师</p>
                    <p className="font-semibold text-gray-900 text-sm leading-none">{pair.mentor.name}</p>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">{pair.mentor.email}</p>
                  </div>
                </div>

                {/* Arrow */}
                <div className="hidden sm:flex items-center justify-center w-8">
                  <span className="text-gray-300 text-xl">→</span>
                </div>

                {/* Newbie */}
                <div className="flex items-center gap-2.5 flex-1">
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0">
                    {pair.newbie.name?.[0] ?? '?'}
                  </div>
                  <div>
                    <p className="text-xs text-blue-600 font-semibold mb-0.5">新人</p>
                    <p className="font-semibold text-gray-900 text-sm leading-none">{pair.newbie.name}</p>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">{pair.newbie.email}</p>
                  </div>
                </div>

                {/* Status + Actions */}
                <div className="flex items-center gap-2 sm:ml-2 flex-shrink-0">
                  {pair.isConfirmed ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold">
                      ✓ 导师已认领
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 bg-gray-50 text-gray-400 rounded-full text-xs">
                      待导师认领
                    </span>
                  )}
                  {confirmDeleteId !== pair.id ? (
                    <button
                      onClick={() => setConfirmDeleteId(pair.id)}
                      className="px-2.5 py-1 rounded-lg text-xs text-gray-400 border border-gray-200 hover:border-red-200 hover:text-red-400 transition-colors"
                    >
                      删除
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-500">确认删除？</span>
                      <button
                        onClick={() => deletePair(pair.id)}
                        disabled={deletingId === pair.id}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold text-white bg-red-400 hover:bg-red-500 disabled:opacity-60 transition-colors"
                      >
                        {deletingId === pair.id ? '…' : '确认'}
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-2.5 py-1 rounded-lg text-xs text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        取消
                      </button>
                    </div>
                  )}
                </div>
              </div>
              {pair.isConfirmed && pair.mentorMessage && (
                <div className="px-5 py-3 bg-amber-50/50 border-t border-amber-100">
                  <p className="text-xs text-amber-700 font-semibold mb-1">📝 导师寄语</p>
                  <p className="text-xs text-gray-600 leading-relaxed">{pair.mentorMessage}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
