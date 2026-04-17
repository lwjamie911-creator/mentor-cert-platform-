'use client'

import { useState } from 'react'

interface PairUser { id: string; name: string; email: string }
interface Pair {
  id: string
  mentorId: string
  newbieId: string
  isAdminPaired: boolean
  isConfirmed: boolean
  mentorMessage: string | null
  confirmedAt: Date | string | null
  createdAt: Date | string
  mentor: PairUser
  newbie: PairUser
}

export function PairsClient({ initialPairs }: { initialPairs: Pair[] }) {
  const [pairs, setPairs] = useState<Pair[]>(initialPairs)

  // Create form
  const [mentorEmail, setMentorEmail] = useState('')
  const [newbieEmail, setNewbieEmail] = useState('')
  const [createError, setCreateError] = useState('')
  const [creating, setCreating] = useState(false)

  // Edit state: pairId → { mentorEmail, newbieEmail }
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editMentor, setEditMentor] = useState('')
  const [editNewbie, setEditNewbie] = useState('')
  const [editError, setEditError] = useState('')
  const [editLoading, setEditLoading] = useState(false)

  // Delete confirm
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function createPair() {
    if (!mentorEmail.trim() || !newbieEmail.trim()) return
    setCreateError('')
    setCreating(true)
    const res = await fetch('/api/admin/pairs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mentorEmail: mentorEmail.trim(), newbieEmail: newbieEmail.trim() }),
    })
    const data = await res.json()
    setCreating(false)
    if (!res.ok) {
      setCreateError(data.error || '创建失败')
    } else {
      setMentorEmail('')
      setNewbieEmail('')
      setPairs([data, ...pairs])
    }
  }

  function startEdit(pair: Pair) {
    setEditingId(pair.id)
    setEditMentor(pair.mentor.email)
    setEditNewbie(pair.newbie.email)
    setEditError('')
  }

  async function saveEdit(id: string) {
    setEditError('')
    setEditLoading(true)
    const res = await fetch(`/api/admin/pairs/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mentorEmail: editMentor.trim(), newbieEmail: editNewbie.trim() }),
    })
    const data = await res.json()
    setEditLoading(false)
    if (!res.ok) {
      setEditError(data.error || '修改失败')
    } else {
      setPairs(pairs.map(p => p.id === id ? data : p))
      setEditingId(null)
    }
  }

  async function deletePair(id: string) {
    setDeletingId(id)
    const res = await fetch(`/api/admin/pairs/${id}`, { method: 'DELETE' })
    setDeletingId(null)
    setConfirmDeleteId(null)
    if (res.ok) setPairs(pairs.filter(p => p.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* ── 创建配对 ── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>🤝</span> 新增导师新人配对
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">导师邮箱</label>
            <input
              value={mentorEmail}
              onChange={e => { setMentorEmail(e.target.value); setCreateError('') }}
              placeholder="mentor@tencent.com"
              type="email"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 placeholder:text-gray-300 transition-all"
              onKeyDown={e => e.key === 'Enter' && createPair()}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">新人邮箱</label>
            <input
              value={newbieEmail}
              onChange={e => { setNewbieEmail(e.target.value); setCreateError('') }}
              placeholder="newbie@tencent.com"
              type="email"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 placeholder:text-gray-300 transition-all"
              onKeyDown={e => e.key === 'Enter' && createPair()}
            />
          </div>
        </div>
        {createError && (
          <div className="mb-4 flex items-center gap-2 text-red-500 text-xs bg-red-50 border border-red-100 px-3 py-2 rounded-xl">
            <span>⚠️</span> {createError}
          </div>
        )}
        <button
          onClick={createPair}
          disabled={creating || !mentorEmail.trim() || !newbieEmail.trim()}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 disabled:opacity-50"
          style={{ background: 'linear-gradient(90deg,#6366f1,#8b5cf6)' }}
        >
          {creating ? '配对中…' : '+ 创建配对'}
        </button>
      </div>

      {/* ── 配对列表 ── */}
      <div className="flex items-center gap-2 px-1">
        <span className="text-sm font-semibold text-gray-700">全部配对</span>
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{pairs.length} 对</span>
      </div>

      {pairs.length === 0 ? (
        <div className="text-center py-16 text-gray-300">
          <div className="text-4xl mb-3">🤝</div>
          <p className="text-sm">暂无配对，请在上方创建</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pairs.map(pair => (
            <div key={pair.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">

              {/* ── 正常展示行 ── */}
              {editingId !== pair.id && (
                <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
                  {/* Mentor */}
                  <UserChip color="amber" label="导师" user={pair.mentor} />

                  <div className="hidden sm:block text-gray-300 text-lg">→</div>

                  {/* Newbie */}
                  <UserChip color="blue" label="新人" user={pair.newbie} />

                  {/* Status + Actions */}
                  <div className="flex items-center gap-2 sm:ml-auto flex-shrink-0 flex-wrap">
                    {pair.isConfirmed ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold">
                        ✓ 导师已认领
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-gray-50 text-gray-400 rounded-full text-xs">
                        待导师认领
                      </span>
                    )}

                    <button
                      onClick={() => startEdit(pair)}
                      className="px-2.5 py-1 rounded-lg text-xs text-indigo-500 border border-indigo-200 hover:bg-indigo-50 transition-colors"
                    >
                      修改
                    </button>

                    {confirmDeleteId !== pair.id ? (
                      <button
                        onClick={() => setConfirmDeleteId(pair.id)}
                        className="px-2.5 py-1 rounded-lg text-xs text-gray-400 border border-gray-200 hover:border-red-200 hover:text-red-400 transition-colors"
                      >
                        解绑
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-gray-500">确认解绑？</span>
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
              )}

              {/* ── 编辑行 ── */}
              {editingId === pair.id && (
                <div className="px-5 py-4 space-y-3 bg-indigo-50/40">
                  <p className="text-xs font-semibold text-indigo-600">修改配对关系</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">导师邮箱</label>
                      <input
                        value={editMentor}
                        onChange={e => { setEditMentor(e.target.value); setEditError('') }}
                        type="email"
                        className="w-full px-3 py-2 border border-indigo-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">新人邮箱</label>
                      <input
                        value={editNewbie}
                        onChange={e => { setEditNewbie(e.target.value); setEditError('') }}
                        type="email"
                        className="w-full px-3 py-2 border border-indigo-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white transition-all"
                      />
                    </div>
                  </div>
                  {editError && (
                    <div className="flex items-center gap-2 text-red-500 text-xs bg-red-50 border border-red-100 px-3 py-2 rounded-xl">
                      <span>⚠️</span> {editError}
                    </div>
                  )}
                  {pair.isConfirmed && (
                    <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 px-3 py-2 rounded-xl">
                      ⚠️ 该配对导师已认领并写了寄语，修改后将清空认领状态，导师需重新认领
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => saveEdit(pair.id)}
                      disabled={editLoading}
                      className="px-5 py-2 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                      style={{ background: 'linear-gradient(90deg,#6366f1,#8b5cf6)' }}
                    >
                      {editLoading ? '保存中…' : '保存'}
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-2 rounded-xl text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      取消
                    </button>
                  </div>
                </div>
              )}

              {/* 导师寄语展示 */}
              {pair.isConfirmed && pair.mentorMessage && editingId !== pair.id && (
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

function UserChip({ color, label, user }: {
  color: 'amber' | 'blue'
  label: string
  user: PairUser
}) {
  const cls = color === 'amber'
    ? { bg: 'bg-amber-100', text: 'text-amber-700', label: 'text-amber-600' }
    : { bg: 'bg-blue-100',  text: 'text-blue-700',  label: 'text-blue-600'  }
  return (
    <div className="flex items-center gap-2.5 flex-1 min-w-0">
      <div className={`w-9 h-9 rounded-full ${cls.bg} ${cls.text} flex items-center justify-center font-bold text-sm flex-shrink-0`}>
        {user.name?.[0] ?? '?'}
      </div>
      <div className="min-w-0">
        <p className={`text-xs ${cls.label} font-semibold mb-0.5`}>{label}</p>
        <p className="font-semibold text-gray-900 text-sm leading-none truncate">{user.name}</p>
        <p className="text-xs text-gray-400 font-mono mt-0.5 truncate">{user.email}</p>
      </div>
    </div>
  )
}
