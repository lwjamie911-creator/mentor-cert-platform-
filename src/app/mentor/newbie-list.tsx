'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Mail, PartyPopper, Sprout, AlertCircle, Loader2 } from 'lucide-react'
import type { AccentTheme } from './accent-theme'

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

export function MentorNewbieList({ mentorId, pairs, accent }: { mentorId: string; pairs: Newbie[]; accent: AccentTheme }) {
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
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold ${accent.text} border ${accent.softBorder} hover:opacity-80 transition-all active:scale-[0.97]`}
          >
            <Plus className="w-4 h-4" strokeWidth={2} /> 认领新人
          </button>
        )}

        {step === 'enter-email' && (
          <div className={`${accent.softBg} border ${accent.softBorder} rounded-2xl p-4 space-y-3`}>
            <p className={`text-xs font-semibold ${accent.text}`}>输入新人企业微信邮箱地址</p>
            <div className="flex gap-2">
              <input
                value={email}
                onChange={e => { setEmail(e.target.value); setEmailError('') }}
                placeholder="例：jamielv@tencent.com"
                type="email"
                className={`flex-1 px-4 py-2.5 border border-cocoa-300 rounded-lg text-sm focus:outline-none ${accent.inputFocus} focus:ring-2 bg-paper text-cocoa-900 placeholder:text-cocoa-400 transition-all`}
                onKeyDown={e => e.key === 'Enter' && checkEmail()}
              />
              <button
                onClick={checkEmail}
                disabled={emailLoading || !email.trim()}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all active:scale-[0.97] hover:-translate-y-0.5 ${accent.btn} disabled:opacity-50 flex-shrink-0`}
              >
                {emailLoading ? '查询中…' : '下一步'}
              </button>
              <button
                onClick={resetFlow}
                className="px-3 py-2.5 rounded-lg text-sm text-cocoa-400 hover:text-cocoa-700 hover:bg-cocoa-100 transition-colors"
              >
                取消
              </button>
            </div>
            {emailError && (
              <div className="flex items-center gap-2 text-red-500 text-xs bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0" strokeWidth={2} /> {emailError}
              </div>
            )}
          </div>
        )}

        {(step === 'write-letter' || step === 'sending') && (
          <div className={`rounded-2xl overflow-hidden border ${accent.softBorder} shadow-card`}>
            {/* Letter Header */}
            <div className={`bg-gradient-to-r ${accent.bar} px-5 py-3 flex items-center gap-2`}>
              <Mail className="text-blush w-5 h-5 flex-shrink-0" strokeWidth={2} />
              <div>
                <p className="text-paper text-xs font-semibold">给 {pendingName} 写一封导师寄语</p>
                <p className="text-blush/90 text-[10px]">写完发送后，新人进入专区时将会收到你的寄语</p>
              </div>
            </div>

            {/* Letter Body */}
            <div className={`${accent.softBg} px-5 pt-4 pb-2`}>
              <div className={`bg-paper rounded-lg border ${accent.softBorder} p-4 shadow-card relative`}>
                {/* decorative lines */}
                <div className="absolute inset-x-4 top-8 space-y-[22px] pointer-events-none">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-px bg-cocoa-100" />
                  ))}
                </div>
                <textarea
                  value={message}
                  onChange={e => { setMessage(e.target.value); setMessageError('') }}
                  placeholder="亲爱的新同学，很高兴成为你的导师……"
                  rows={5}
                  disabled={step === 'sending'}
                  className="relative z-10 w-full text-sm text-cocoa-700 leading-relaxed resize-none focus:outline-none bg-transparent placeholder:text-cocoa-400"
                />
              </div>
              <div className="flex items-center justify-between mt-2 px-1">
                <span className={`text-xs ${message.trim().length < 10 ? 'text-cocoa-400' : 'text-green-500'}`}>
                  {message.trim().length} / 最少 10 字
                </span>
              </div>
              {messageError && (
                <div className="mt-2 flex items-center gap-2 text-red-500 text-xs bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" strokeWidth={2} /> {messageError}
                </div>
              )}
            </div>

            {/* Letter Footer */}
            <div className={`${accent.softBg} px-5 pb-4 flex items-center gap-2`}>
              <button
                onClick={sendLetter}
                disabled={step === 'sending' || message.trim().length < 10}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all active:scale-[0.97] hover:-translate-y-0.5 ${accent.btn} disabled:opacity-50`}
              >
                {step === 'sending' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} /> 发送中…
                  </>
                ) : (
                  <><Mail className="w-4 h-4" strokeWidth={2} /> 发送寄语并认领</>
                )}
              </button>
              <button
                onClick={resetFlow}
                disabled={step === 'sending'}
                className="px-3 py-2.5 rounded-lg text-sm text-cocoa-400 hover:text-cocoa-700 hover:bg-cocoa-100 transition-colors disabled:opacity-50"
              >
                取消
              </button>
            </div>
          </div>
        )}

        {step === 'sent' && (
          <div className="rounded-2xl border border-green-200 bg-green-50 px-5 py-4 flex items-center gap-3">
            <PartyPopper className="w-6 h-6 text-green-600 flex-shrink-0" strokeWidth={2} />
            <div>
              <p className="font-semibold text-green-800 text-sm">寄语已发出，{pendingName} 加入成功！</p>
              <p className="text-green-600 text-xs mt-0.5">新人进入专区时将会看到你的寄语</p>
            </div>
          </div>
        )}
      </div>

      {/* 新人列表 */}
      {pairs.length === 0 ? (
        <div className="text-center py-10 text-cocoa-400">
          <Sprout className="w-8 h-8 mx-auto mb-2" strokeWidth={1.5} />
          <p className="text-sm">暂无新人，点击上方认领</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pairs.map(p => {
            const isReleasePending = releaseTarget === p.id

            return (
              <div key={p.id} className="rounded-2xl border border-line overflow-hidden transition-all">
                {/* 新人信息头 */}
                <div className={`px-4 py-3 flex items-center justify-between gap-3 ${accent.softBg}`}>
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${accent.badge}`}>
                      {p.newbieName?.[0] ?? '?'}
                    </div>
                    <div>
                      <p className="font-semibold text-cocoa-900 text-sm">{p.newbieName ?? '—'}</p>
                      <p className="text-xs text-cocoa-400 font-mono">{p.newbieEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* 释放按钮 */}
                    {!isReleasePending ? (
                      <button
                        onClick={() => setReleaseTarget(p.id)}
                        className="px-2.5 py-1 rounded-lg text-xs text-cocoa-400 border border-cocoa-200 hover:border-red-200 hover:text-red-400 transition-colors"
                      >
                        释放
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-cocoa-500">确认释放？</span>
                        <button
                          onClick={() => releaseNewbie(p.id)}
                          disabled={releasing === p.id}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold text-white bg-red-400 hover:bg-red-500 disabled:opacity-60 transition-colors"
                        >
                          {releasing === p.id ? '…' : '确认'}
                        </button>
                        <button
                          onClick={() => setReleaseTarget(null)}
                          className="px-2.5 py-1 rounded-lg text-xs text-cocoa-400 hover:text-cocoa-700 transition-colors"
                        >
                          取消
                        </button>
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
