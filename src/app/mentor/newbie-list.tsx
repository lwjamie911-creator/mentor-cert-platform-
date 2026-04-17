'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Newbie {
  id: string
  newbieId: string
  newbieName: string | null
  newbieEmail: string
  exam: any
  badge: any
  learningProgress: { completed: number; total: number }
}

type Step = 'idle' | 'enter-email' | 'write-letter' | 'sending' | 'sent'

export function MentorNewbieList({ mentorId, pairs }: { mentorId: string; pairs: Newbie[] }) {
  const router = useRouter()

  // Claim flow state
  const [step, setStep] = useState<Step>('idle')
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [emailLoading, setEmailLoading] = useState(false)
  const [pendingPairId, setPendingPairId] = useState('')
  const [pendingName, setPendingName] = useState('')
  const [message, setMessage] = useState('')
  const [messageError, setMessageError] = useState('')
  const [sendLoading, setSendLoading] = useState(false)

  // Release state
  const [releasing, setReleasing] = useState<string | null>(null)
  const [releaseTarget, setReleaseTarget] = useState<string | null>(null)

  async function checkEmail() {
    if (!email.trim()) return
    setEmailError('')
    setEmailLoading(true)
    const res = await fetch('/api/mentor/add-newbie', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim() }),
    })
    const data = await res.json()
    setEmailLoading(false)
    if (!res.ok) {
      setEmailError(data.error || '查询失败')
    } else {
      setPendingPairId(data.pairId)
      setPendingName(data.newbieName ?? email)
      setStep('write-letter')
    }
  }

  async function sendLetter() {
    if (message.trim().length < 10) {
      setMessageError('寄语至少需要 10 个字符哦 ✨')
      return
    }
    setMessageError('')
    setSendLoading(true)
    setStep('sending')
    const res = await fetch('/api/mentor/confirm-newbie', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pairId: pendingPairId, mentorMessage: message.trim() }),
    })
    const data = await res.json()
    setSendLoading(false)
    if (!res.ok) {
      setStep('write-letter')
      setMessageError(data.error || '发送失败，请重试')
    } else {
      setStep('sent')
      setTimeout(() => {
        resetFlow()
        router.refresh()
      }, 2000)
    }
  }

  function resetFlow() {
    setStep('idle')
    setEmail('')
    setEmailError('')
    setPendingPairId('')
    setPendingName('')
    setMessage('')
    setMessageError('')
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
      {/* 认领区 */}
      <div className="mb-5">
        {step === 'idle' && (
          <button
            onClick={() => setStep('enter-email')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-amber-600 border border-amber-200 hover:bg-amber-50 transition-colors"
          >
            + 认领新人
          </button>
        )}

        {step === 'enter-email' && (
          <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-4 space-y-3">
            <p className="text-xs font-semibold text-amber-700">输入新人企业微信邮箱地址</p>
            <div className="flex gap-2">
              <input
                value={email}
                onChange={e => { setEmail(e.target.value); setEmailError('') }}
                placeholder="例：jamielv@tencent.com"
                type="email"
                className="flex-1 px-4 py-2.5 border border-amber-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white placeholder:text-gray-300 transition-all"
                onKeyDown={e => e.key === 'Enter' && checkEmail()}
              />
              <button
                onClick={checkEmail}
                disabled={emailLoading || !email.trim()}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 disabled:opacity-50 flex-shrink-0"
                style={{ background: 'linear-gradient(90deg, #f59e0b, #d97706)' }}
              >
                {emailLoading ? '查询中…' : '下一步'}
              </button>
              <button
                onClick={resetFlow}
                className="px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                取消
              </button>
            </div>
            {emailError && (
              <div className="flex items-center gap-2 text-red-500 text-xs bg-red-50 border border-red-100 px-3 py-2 rounded-xl">
                <span>⚠️</span> {emailError}
              </div>
            )}
          </div>
        )}

        {(step === 'write-letter' || step === 'sending') && (
          <div className="rounded-2xl overflow-hidden border border-amber-200 shadow-sm">
            {/* Letter Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-400 px-5 py-3 flex items-center gap-2">
              <span className="text-white text-base">✉️</span>
              <div>
                <p className="text-white text-xs font-semibold">给 {pendingName} 写一封导师寄语</p>
                <p className="text-amber-100 text-[10px]">写完发送后，新人进入专区时将会收到你的寄语</p>
              </div>
            </div>

            {/* Letter Body */}
            <div className="bg-amber-50/40 px-5 pt-4 pb-2">
              <div className="bg-white rounded-xl border border-amber-100 p-4 shadow-sm relative">
                {/* decorative lines */}
                <div className="absolute inset-x-4 top-8 space-y-[22px] pointer-events-none">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-px bg-amber-50" />
                  ))}
                </div>
                <textarea
                  value={message}
                  onChange={e => { setMessage(e.target.value); setMessageError('') }}
                  placeholder="亲爱的新同学，很高兴成为你的导师……"
                  rows={5}
                  disabled={step === 'sending'}
                  className="relative z-10 w-full text-sm text-gray-700 leading-relaxed resize-none focus:outline-none bg-transparent placeholder:text-gray-300"
                />
              </div>
              <div className="flex items-center justify-between mt-2 px-1">
                <span className={`text-xs ${message.trim().length < 10 ? 'text-gray-300' : 'text-green-500'}`}>
                  {message.trim().length} / 最少 10 字
                </span>
              </div>
              {messageError && (
                <div className="mt-2 flex items-center gap-2 text-red-500 text-xs bg-red-50 border border-red-100 px-3 py-2 rounded-xl">
                  <span>⚠️</span> {messageError}
                </div>
              )}
            </div>

            {/* Letter Footer */}
            <div className="bg-amber-50/40 px-5 pb-4 flex items-center gap-2">
              <button
                onClick={sendLetter}
                disabled={step === 'sending' || message.trim().length < 10}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: 'linear-gradient(90deg,#f59e0b,#fb923c)' }}
              >
                {step === 'sending' ? (
                  <>
                    <span className="animate-spin">✉️</span> 发送中…
                  </>
                ) : (
                  <>✉️ 发送寄语并认领</>
                )}
              </button>
              <button
                onClick={resetFlow}
                disabled={step === 'sending'}
                className="px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                取消
              </button>
            </div>
          </div>
        )}

        {step === 'sent' && (
          <div className="rounded-2xl border border-green-200 bg-green-50 px-5 py-4 flex items-center gap-3">
            <span className="text-2xl">🎉</span>
            <div>
              <p className="font-semibold text-green-800 text-sm">寄语已发出，{pendingName} 加入成功！</p>
              <p className="text-green-600 text-xs mt-0.5">新人进入专区时将会看到你的寄语</p>
            </div>
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
            const allBadge   = !!p.badge
            const examPassed = p.exam?.passed
            const { completed, total } = p.learningProgress
            const progressPct = total > 0 ? Math.round((completed / total) * 100) : 0
            const isReleasePending = releaseTarget === p.id

            return (
              <div key={p.id} className={`rounded-2xl border overflow-hidden transition-all ${
                allBadge ? 'border-green-100' : 'border-gray-100'
              }`}>
                {/* 新人信息头 */}
                <div className={`px-4 py-3 flex items-center justify-between gap-3 ${
                  allBadge ? 'bg-gradient-to-r from-green-50 to-emerald-50' : 'bg-gray-50'
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

                  {/* 考试结果 */}
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
                    <div className="px-3 py-2.5 bg-blue-50 rounded-xl">
                      <p className="text-xs text-blue-600 font-semibold mb-1">📝 主观题回答</p>
                      <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">{p.exam.subjectiveAnswer}</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
