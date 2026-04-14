'use client'

import { useState } from 'react'
import Link from 'next/link'
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
        <div className={`rounded-3xl p-10 mb-6 relative overflow-hidden ${passed
          ? 'bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200'
          : 'bg-gradient-to-br from-gray-50 to-slate-100 border border-gray-200'}`}>
          <div className="absolute top-[-20px] right-[-20px] text-8xl opacity-10">{passed ? '🏆' : '📝'}</div>
          <div className="text-6xl mb-4">{passed ? '🎉' : '😅'}</div>
          <div className={`text-7xl font-black mb-2 ${passed ? 'text-amber-500' : 'text-gray-400'}`}>
            {result.score}
            <span className="text-2xl font-normal ml-1">分</span>
          </div>
          <div className={`text-sm font-medium mb-1 ${passed ? 'text-amber-700' : 'text-gray-500'}`}>
            答对 {result.correctCount} / {result.total} 题
          </div>
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold mt-2
            ${passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
            {passed ? '✓ 通过' : '✗ 未通过（需 80 分）'}
          </div>
        </div>

        {passed && (
          <p className="text-gray-500 text-sm mb-6">恭喜！导师认证证书已颁发，快去查看吧 🎓</p>
        )}
        {!passed && (
          <p className="text-gray-500 text-sm mb-6">需要 80 分才能通过，再试一次吧！</p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {passed && (
            <Link href="/mentor/certificate"
              className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold text-white shadow-sm"
              style={{ background: 'linear-gradient(90deg, #f59e0b, #fb923c)' }}
            >
              查看导师认证证书 →
            </Link>
          )}
          <button
            onClick={handleRetake}
            className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold bg-white border-2 border-gray-200 text-gray-700 hover:border-amber-300 hover:text-amber-700 transition-colors"
          >
            🔄 重新测试
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
            <h1 className="text-xl font-bold text-gray-900">导师知识测试</h1>
            <p className="text-sm text-gray-400 mt-0.5">共 {questions.length} 题 · 80 分及以上通过</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-amber-500">{answeredCount}</span>
            <span className="text-gray-400 text-sm">/{questions.length}</span>
            <p className="text-xs text-gray-400">已作答</p>
          </div>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${(answeredCount / questions.length) * 100}%`,
              background: 'linear-gradient(90deg, #f59e0b, #fb923c)',
            }} />
        </div>
      </div>

      {/* 题目列表 */}
      <div className="space-y-4 mb-6">
        {questions.map((q, i) => {
          const answered = isAnswered(q)
          const typeLabel = { single: '单选', multiple: '多选', truefalse: '判断', matching: '连线' }[q.type] ?? q.type

          return (
            <div key={q.id} className={`bg-white rounded-2xl border-2 p-5 transition-all duration-200
              ${answered ? 'border-amber-200' : 'border-gray-100 hover:border-gray-200'}`}>

              {/* 题目头 */}
              <div className="flex items-start gap-3 mb-4">
                <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                  ${answered ? 'bg-amber-400 text-white' : 'bg-gray-100 text-gray-400'}`}>
                  {answered ? '✓' : i + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 leading-relaxed">{q.content}</p>
                  <span className="inline-block mt-1 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">{typeLabel}</span>
                </div>
              </div>

              {/* 连线题 */}
              {q.type === 'matching' && (() => {
                const leftItems: string[]  = JSON.parse(q.options)
                const rightItems: string[] = JSON.parse(q.answer)
                return (
                  <div className="pl-10">
                    <p className="text-xs text-gray-400 mb-3">点击左侧项，再点击右侧对应项完成连线</p>
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
                      <label key={oi} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl cursor-pointer transition-all
                        ${selected
                          ? 'bg-amber-50 border-2 border-amber-300 text-amber-900'
                          : 'border-2 border-gray-100 hover:border-amber-100 hover:bg-amber-50/50 text-gray-700'}`}>
                        <span className={`w-5 h-5 rounded flex items-center justify-center text-xs font-bold flex-shrink-0
                          ${selected ? 'bg-amber-400 text-white' : 'bg-gray-100 text-gray-400'}`}>
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
          className="w-full py-3.5 rounded-2xl font-bold text-sm text-white shadow-lg transition-all"
          style={{
            background: answeredCount < questions.length || submitting
              ? '#d1d5db'
              : 'linear-gradient(90deg, #f59e0b, #fb923c)',
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
