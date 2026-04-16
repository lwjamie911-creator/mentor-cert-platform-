'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Newbie {
  id: string
  newbieId: string
  newbieName: string | null
  newbieEmail: string
  checklist: any
  exam: any
  badge: any
  learningProgress: { completed: number; total: number }
}

export function MentorNewbieList({ mentorId, pairs }: { mentorId: string; pairs: Newbie[] }) {
  const router = useRouter()
  const [adding, setAdding]     = useState(false)
  const [email, setEmail]       = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [confirming, setConfirming]   = useState<string | null>(null)
  const [releasing, setReleasing]     = useState<string | null>(null)
  const [releaseTarget, setReleaseTarget] = useState<string | null>(null) // pairId 待确认释放

  async function addNewbie() {
    if (!email.trim()) return
    setError('')
    setLoading(true)
    const res  = await fetch('/api/mentor/add-newbie', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim() }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) {
      setError(data.error || '添加失败')
    } else {
      setEmail('')
      setAdding(false)
      router.refresh()
    }
  }

  async function confirmCheck(newbieId: string, checkKey: string) {
    const key = `${newbieId}-${checkKey}`
    setConfirming(key)
    await fetch('/api/mentor/confirm-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newbieId, checkKey }),
    })
    setConfirming(null)
    router.refresh()
  }

  async function releaseNewbie(pairId: string) {
    setReleasing(pairId)
    const res = await fetch('/api/mentor/release-newbie', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pairId }),
    })
    setReleasing(null)
    setReleaseTarget(null)
    if (res.ok) router.refresh()
  }

  return (
    <div>
      {/* 添加新人区 */}
      <div className="mb-5">
        {!adding ? (
          <button
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-amber-600 border border-amber-200 hover:bg-amber-50 transition-colors"
          >
            + 认领新人
          </button>
        ) : (
          <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-4 space-y-3">
            <p className="text-xs font-semibold text-amber-700">输入新人企业微信邮箱地址</p>
            <div className="flex gap-2">
              <input
                value={email}
                onChange={e => { setEmail(e.target.value); setError('') }}
                placeholder="例：jamielv@tencent.com"
                type="email"
                className="flex-1 px-4 py-2.5 border border-amber-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white placeholder:text-gray-300 transition-all"
                onKeyDown={e => e.key === 'Enter' && addNewbie()}
              />
              <button
                onClick={addNewbie}
                disabled={loading || !email.trim()}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 disabled:opacity-50 flex-shrink-0"
                style={{ background: 'linear-gradient(90deg, #f59e0b, #d97706)' }}
              >
                {loading ? '认领中…' : '确认'}
              </button>
              <button
                onClick={() => { setAdding(false); setError(''); setEmail('') }}
                className="px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                取消
              </button>
            </div>
            {error && (
              <div className="flex items-center gap-2 text-red-500 text-xs bg-red-50 border border-red-100 px-3 py-2 rounded-xl">
                <span>⚠️</span> {error}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 新人列表 */}
      {pairs.length === 0 ? (
        <div className="text-center py-10 text-gray-300">
          <div className="text-3xl mb-2">🌱</div>
          <p className="text-sm">暂无新人，点击上方认领</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pairs.map(p => {
            const cl            = p.checklist
            const allBadge      = !!p.badge
            const examPassed    = p.exam?.passed
            const pendingChecks = cl
              ? ['A', 'B', 'C'].filter(k => cl[`check${k}_self`] && !cl[`check${k}_mentor`])
              : []
            const { completed, total } = p.learningProgress
            const progressPct = total > 0 ? Math.round((completed / total) * 100) : 0
            const isReleasePending = releaseTarget === p.id

            return (
              <div key={p.id} className={`rounded-2xl border overflow-hidden transition-all ${
                allBadge ? 'border-green-100' : pendingChecks.length > 0 ? 'border-amber-200' : 'border-gray-100'
              }`}>
                {/* 新人信息头 */}
                <div className={`px-4 py-3 flex items-center justify-between gap-3 ${
                  allBadge ? 'bg-gradient-to-r from-green-50 to-emerald-50' :
                  pendingChecks.length > 0 ? 'bg-gradient-to-r from-amber-50 to-yellow-50' :
                  'bg-gray-50'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      allBadge ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {p.newbieName?.[0] ?? '?'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{p.newbieName ?? '—'}</p>
                      <p className="text-xs text-gray-400 font-mono">{p.newbieEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {allBadge && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                        🏅 已达标
                      </span>
                    )}
                    {pendingChecks.length > 0 && !allBadge && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold animate-pulse">
                        ⏳ 待确认
                      </span>
                    )}
                    {/* 释放按钮 */}
                    {!isReleasePending ? (
                      <button
                        onClick={() => setReleaseTarget(p.id)}
                        className="px-2.5 py-1 rounded-lg text-xs text-gray-400 border border-gray-200 hover:border-red-200 hover:text-red-400 transition-colors"
                      >
                        释放
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-gray-500">确认释放？</span>
                        <button
                          onClick={() => releaseNewbie(p.id)}
                          disabled={releasing === p.id}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold text-white bg-red-400 hover:bg-red-500 disabled:opacity-60 transition-colors"
                        >
                          {releasing === p.id ? '…' : '确认'}
                        </button>
                        <button
                          onClick={() => setReleaseTarget(null)}
                          className="px-2.5 py-1 rounded-lg text-xs text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          取消
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-4 py-3 space-y-3 bg-white">
                  {/* 课程学习进度 */}
                  {total > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-gray-400">课程学习进度</span>
                        <span className="text-xs font-semibold text-gray-600">{completed}/{total} 门</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${progressPct === 100 ? 'bg-green-400' : 'bg-blue-400'}`}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* ABC 指标 */}
                  <div className="flex gap-2">
                    {['A', 'B', 'C'].map(k => {
                      const self   = cl?.[`check${k}_self`]
                      const mentor = cl?.[`check${k}_mentor`]
                      return (
                        <div key={k} className={`flex-1 rounded-xl px-3 py-2 text-center text-xs border transition-all ${
                          mentor ? 'bg-green-50 border-green-200 text-green-700' :
                          self   ? 'bg-amber-50 border-amber-200 text-amber-700' :
                          'bg-gray-50 border-gray-100 text-gray-400'
                        }`}>
                          <div className="font-bold mb-0.5">指标 {k}</div>
                          <div>{mentor ? '✓ 已通过' : self ? '待确认' : '未完成'}</div>
                        </div>
                      )
                    })}
                  </div>

                  {/* 待确认印章按钮 */}
                  {pendingChecks.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {pendingChecks.map(k => {
                        const key = `${p.newbieId}-${k}`
                        return (
                          <button
                            key={k}
                            onClick={() => confirmCheck(p.newbieId, k)}
                            disabled={confirming === key}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-sm transition-all hover:opacity-90 disabled:opacity-60"
                            style={{ background: 'linear-gradient(90deg, #f59e0b, #d97706)' }}
                          >
                            {confirming === key ? '确认中…' : `🔖 确认${k}项通过`}
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {/* 考试结果 */}
                  <div className="pt-2 border-t border-gray-50">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-gray-400">知识测试：</span>
                      {!p.exam ? (
                        <span className="text-gray-300">未参加</span>
                      ) : examPassed ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded-full font-semibold">
                          ✓ 通过 · {p.exam.score} 分
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-500 rounded-full font-semibold">
                          ✗ 未通过 · {p.exam.score} 分
                        </span>
                      )}
                    </div>
                    {p.exam?.subjectiveAnswer && (
                      <div className="mt-2 px-3 py-2.5 bg-blue-50 rounded-xl">
                        <p className="text-xs text-blue-600 font-semibold mb-1">📝 主观题回答</p>
                        <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">{p.exam.subjectiveAnswer}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
