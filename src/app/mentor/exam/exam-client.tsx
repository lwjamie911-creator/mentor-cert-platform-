'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Award, FileText, PartyPopper, Frown, Check, X, RefreshCw, ArrowRight, GraduationCap } from 'lucide-react'
import { MatchingQuestion } from '@/components/matching-question'

interface Question {
  id: string
  type: string
  content: string
  options: string
  answer: string
}

export function MentorExamClient({ questions }: { questions: Question[] }) {
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [result, setResult] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)

  function handleAnswer(qId: string, val: any) {
    setAnswers(prev => ({ ...prev, [qId]: val }))
  }

  function handleChoiceAnswer(qId: string, opt: string, type: string) {
    if (type === 'multiple') {
      setAnswers(prev => {
        const cur = (prev[qId] as string[]) || []
        return { ...prev, [qId]: cur.includes(opt) ? cur.filter(o => o !== opt) : [...cur, opt] }
      })
    } else {
      setAnswers(prev => ({ ...prev, [qId]: opt }))
    }
  }

  function isAnswered(q: Question): boolean {
    const a = answers[q.id]
    if (q.type === 'matching') {
      const opts: string[] = JSON.parse(q.options)
      return typeof a === 'object' && a !== null && Object.keys(a).length === opts.length
    }
    if (q.type === 'multiple') return Array.isArray(a) && a.length > 0
    return a !== undefined
  }

  async function handleSubmit() {
    setSubmitting(true)
    const res = await fetch('/api/mentor/exam/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers, questionIds: questions.map(q => q.id) }),
    })
    const data = await res.json()
    setResult(data)
    setSubmitting(false)
  }

  function handleRetake() {
    setAnswers({})
    setResult(null)
  }

  const answeredCount = questions.filter(q => isAnswered(q)).length

  // ── 结果页 ──
  if (result) {
    const passed = result.passed
    return (
      <div className="max-w-lg mx-auto text-center py-8">
        <div className={`rounded-2xl p-10 mb-6 relative overflow-hidden ${passed
          ? 'bg-gradient-to-br from-cocoa-50 to-cocoa-100 border border-cocoa-300'
          : 'bg-gradient-to-br from-cocoa-50 to-cocoa-100/60 border border-line'}`}>
          <div className="absolute top-[-10px] right-[-10px] opacity-10 text-cocoa-800">
            {passed ? <Award className="w-32 h-32" strokeWidth={1.5} /> : <FileText className="w-32 h-32" strokeWidth={1.5} />}
          </div>
          <div className="flex justify-center mb-4 text-cocoa-700">
            {passed ? <PartyPopper className="w-14 h-14" strokeWidth={1.5} /> : <Frown className="w-14 h-14" strokeWidth={1.5} />}
          </div>
          <div className={`text-7xl font-black mb-2 ${passed ? 'text-cocoa-800' : 'text-cocoa-400'}`}>
            {result.score}
            <span className="text-2xl font-normal ml-1">分</span>
          </div>
          <div className={`text-sm font-medium mb-1 ${passed ? 'text-cocoa-700' : 'text-cocoa-500'}`}>
            答对 {result.correctCount} / {result.total} 题
          </div>
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold mt-2
            ${passed ? 'bg-cocoa-800 text-blush' : 'bg-blush text-sienna'}`}>
            {passed ? <><Check className="w-4 h-4" strokeWidth={2.5} /> 通过</> : <><X className="w-4 h-4" strokeWidth={2.5} /> 未通过（需 80 分）</>}
          </div>
        </div>

        {passed && (
          <p className="inline-flex items-center gap-1.5 text-cocoa-500 text-sm mb-6">恭喜！导师认证证书已颁发，快去查看吧 <GraduationCap className="w-4 h-4" strokeWidth={2} /></p>
        )}
        {!passed && (
          <p className="text-cocoa-500 text-sm mb-6">需要 80 分才能通过，再试一次吧！</p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {passed && (
            <Link href="/mentor/certificate"
              className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-lg text-sm font-semibold text-blush bg-cocoa-800 hover:bg-cocoa-900 transition-all active:scale-[0.97] hover:-translate-y-0.5 hover:shadow-subtle"
            >
              查看导师认证证书 <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </Link>
          )}
          <button
            onClick={handleRetake}
            className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-lg text-sm font-semibold bg-paper border border-cocoa-300 text-cocoa-700 hover:border-cocoa-400 hover:text-cocoa-900 transition-all active:scale-[0.97]"
          >
            <RefreshCw className="w-4 h-4" strokeWidth={2} /> 重新测试
          </button>
        </div>
      </div>
    )
  }

  // ── 答题页 ──
  return (
    <div className="max-w-2xl mx-auto">
      {/* 顶部进度 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="font-display text-xl text-cocoa-900">导师知识测试</h1>
            <p className="text-sm text-cocoa-400 mt-0.5">共 {questions.length} 题 · 80 分及以上通过</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-cocoa-700">{answeredCount}</span>
            <span className="text-cocoa-400 text-sm">/{questions.length}</span>
            <p className="text-xs text-cocoa-400">已作答</p>
          </div>
        </div>
        <div className="h-2 bg-cocoa-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${(answeredCount / questions.length) * 100}%`,
              background: 'linear-gradient(90deg, #7a4230, #b87a5e)',
            }} />
        </div>
      </div>

      {/* 题目列表 */}
      <div className="space-y-4 mb-6">
        {questions.map((q, i) => {
          const answered = isAnswered(q)
          const typeLabel = { single: '单选', multiple: '多选', truefalse: '判断', matching: '连线' }[q.type] ?? q.type

          return (
            <div key={q.id} className={`bg-paper rounded-2xl border p-5 shadow-card transition-all duration-200
              ${answered ? 'border-cocoa-300' : 'border-line hover:border-cocoa-200'}`}>

              {/* 题目头 */}
              <div className="flex items-start gap-3 mb-4">
                <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                  ${answered ? 'bg-cocoa-800 text-blush' : 'bg-cocoa-100 text-cocoa-400'}`}>
                  {answered ? <Check className="w-4 h-4" strokeWidth={2.5} /> : i + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-cocoa-900 leading-relaxed">{q.content}</p>
                  <span className="inline-block mt-1 text-xs text-cocoa-700 bg-cocoa-100 px-2 py-0.5 rounded-full">{typeLabel}</span>
                </div>
              </div>

              {/* 连线题 */}
              {q.type === 'matching' && (() => {
                const leftItems: string[]  = JSON.parse(q.options)
                const rightItems: string[] = JSON.parse(q.answer)
                return (
                  <div className="pl-10">
                    <p className="text-xs text-cocoa-400 mb-3">点击左侧项，再点击右侧对应项完成连线</p>
                    <MatchingQuestion
                      questionId={q.id}
                      leftItems={leftItems}
                      rightItems={rightItems}
                      value={answers[q.id]}
                      onChange={val => handleAnswer(q.id, val)}
                    />
                  </div>
                )
              })()}

              {/* 选择题 / 判断题 */}
              {q.type !== 'matching' && (
                <div className="space-y-2 pl-10">
                  {(JSON.parse(q.options) as string[]).map((opt, oi) => {
                    const key = String.fromCharCode(65 + oi)
                    const selected = q.type === 'multiple'
                      ? ((answers[q.id] as string[]) || []).includes(key)
                      : answers[q.id] === key
                    return (
                      <label key={oi} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer transition-all
                        ${selected
                          ? 'bg-cocoa-50 border border-cocoa-400 text-cocoa-900'
                          : 'border border-line hover:border-cocoa-200 hover:bg-cocoa-50/50 text-cocoa-700'}`}>
                        <span className={`w-5 h-5 rounded flex items-center justify-center text-xs font-bold flex-shrink-0
                          ${selected ? 'bg-cocoa-800 text-blush' : 'bg-cocoa-100 text-cocoa-400'}`}>
                          {key}
                        </span>
                        <input
                          type={q.type === 'multiple' ? 'checkbox' : 'radio'}
                          name={q.id}
                          value={key}
                          checked={selected}
                          onChange={() => handleChoiceAnswer(q.id, key, q.type)}
                          className="sr-only"
                        />
                        <span className="text-sm">{opt}</span>
                      </label>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* 提交按钮 */}
      <div className="sticky bottom-4">
        <button
          onClick={handleSubmit}
          disabled={submitting || answeredCount < questions.length}
          className="w-full py-3.5 rounded-lg font-bold text-sm text-paper shadow-float transition-all active:scale-[0.99]"
          style={{
            background: answeredCount < questions.length || submitting
              ? '#cf9c84'
              : 'linear-gradient(90deg, #5d2a1a, #7a4230)',
          }}
        >
          {submitting ? '提交中...' : answeredCount < questions.length
            ? `还有 ${questions.length - answeredCount} 题未作答`
            : '提交答案 →'}
        </button>
      </div>
    </div>
  )
}
