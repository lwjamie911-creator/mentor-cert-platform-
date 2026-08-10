'use client'

import { useState } from 'react'
import Link from 'next/link'
import { GraduationCap, PartyPopper, Check, X, ArrowRight, ArrowLeft } from 'lucide-react'
import { MatchingQuestion } from '@/components/matching-question'

interface Question {
  id: string
  type: string
  content: string
  options: string
  answer: string
}

const SUBJECTIVE_QUESTION = '请结合你在入职前三个月的实际经历，谈谈你对"导师制"的理解，以及导师对你成长的影响。（开放作答，不计入分数）'

export function NewbieExamClient({ questions }: { questions: Question[] }) {
  const [answers, setAnswers] = useState<Record<string, string | string[] | Record<number, number>>>({})
  const [subjectiveAnswer, setSubjectiveAnswer] = useState('')
  const [result, setResult] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)

  function handleAnswer(qId: string, val: string | string[] | Record<number, number>, type: string) {
    if (type === 'multiple') {
      setAnswers(prev => {
        const cur = (prev[qId] as string[]) || []
        const opt = val as string
        return { ...prev, [qId]: cur.includes(opt) ? cur.filter(o => o !== opt) : [...cur, opt] }
      })
    } else if (type === 'matching') {
      setAnswers(prev => ({ ...prev, [qId]: val as Record<number, number> }))
    } else {
      setAnswers(prev => ({ ...prev, [qId]: val as string }))
    }
  }

  function isAnswered(q: Question): boolean {
    const ans = answers[q.id]
    if (q.type === 'multiple') return Array.isArray(ans) && ans.length > 0
    if (q.type === 'matching') {
      if (!ans || typeof ans !== 'object' || Array.isArray(ans)) return false
      const opts: string[] = JSON.parse(q.options)
      return Object.keys(ans).length === opts.length
    }
    return ans !== undefined
  }

  async function handleSubmit() {
    setSubmitting(true)
    const res = await fetch('/api/newbie/exam/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        answers,
        questionIds: questions.map(q => q.id),
        subjectiveAnswer: subjectiveAnswer.trim() || null,
      }),
    })
    const data = await res.json()
    setResult(data)
    setSubmitting(false)
  }

  const answeredCount = questions.filter(isAnswered).length

  // 结果页
  if (result) {
    const passed = result.passed
    return (
      <div className="max-w-lg mx-auto text-center py-8">
        <div className={`rounded-2xl p-10 mb-6 relative overflow-hidden border ${passed
          ? 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200'
          : 'bg-gradient-to-br from-petal-50 to-petal-100 border-petal-200'}`}>
          <GraduationCap className={`absolute top-2 right-2 w-24 h-24 ${passed ? 'text-emerald-200/50' : 'text-petal-200/50'}`} strokeWidth={1.5} />
          <div className="relative z-10">
            <div className="flex justify-center mb-4">
              {passed
                ? <PartyPopper className="w-14 h-14 text-emerald-600" strokeWidth={1.75} />
                : <span className="text-5xl">😅</span>}
            </div>
            <div className={`text-7xl font-display font-black mb-2 ${passed ? 'text-emerald-600' : 'text-petal-700'}`}>
              {result.score}
              <span className="text-2xl font-normal ml-1">分</span>
            </div>
            <div className={`text-sm font-medium mb-1 ${passed ? 'text-emerald-700' : 'text-cocoa-500'}`}>
              答对 {result.correctCount} / {result.total} 题
            </div>
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold mt-2
              ${passed ? 'bg-emerald-600 text-white' : 'bg-blush/70 text-sienna'}`}>
              {passed
                ? <><Check className="w-3.5 h-3.5" strokeWidth={2.5} /> 通过</>
                : <><X className="w-3.5 h-3.5" strokeWidth={2.5} /> 未通过（需 80 分）</>}
            </div>
          </div>
        </div>

        {passed && (
          <p className="text-cocoa-500 text-sm mb-6">恭喜！完成证书已颁发，记录你的成长里程碑</p>
        )}

        <div className="flex gap-3 justify-center">
          {passed ? (
            <Link href="/newbie/certificate"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-lg text-sm font-medium text-paper bg-petal-700 hover:bg-petal-800 hover:-translate-y-0.5 hover:shadow-subtle shadow-card transition-all active:scale-[0.97]"
            >
              <GraduationCap className="w-4 h-4" strokeWidth={2} /> 查看完成证书 <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </Link>
          ) : (
            <Link href="/newbie"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-lg text-sm font-medium bg-paper border border-petal-300 text-petal-700 hover:border-petal-500 hover:text-petal-900 hover:bg-petal-50 transition-all"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={2} /> 返回重试
            </Link>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* 顶部进度 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-xl font-display font-bold text-petal-900">新人知识测试</h1>
            <p className="text-sm text-cocoa-400 mt-0.5">{questions.length} 道客观题 + 1 道主观题 · 客观 80 分及以上通过</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-petal-600">{answeredCount}</span>
            <span className="text-cocoa-400 text-sm">/{questions.length}</span>
            <p className="text-xs text-cocoa-400">已作答</p>
          </div>
        </div>
        <div className="h-2 bg-petal-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${(answeredCount / questions.length) * 100}%`,
              background: 'linear-gradient(90deg, #c05e6d, #e59aa4)',
            }} />
        </div>
      </div>

      {/* 客观题 */}
      <div className="space-y-4 mb-4">
        {questions.map((q, i) => {
          const answered = isAnswered(q)

          if (q.type === 'matching') {
            const leftItems: string[] = JSON.parse(q.options)
            const rightItems: string[] = JSON.parse(q.answer)
            const val = (answers[q.id] as Record<number, number>) || {}
            const connectedCount = Object.keys(val).length

            return (
              <div key={q.id} className={`bg-paper rounded-2xl border-2 p-5 transition-all duration-200
                ${answered ? 'border-petal-300' : 'border-line hover:border-petal-200'}`}>
                <div className="flex items-start gap-3 mb-2">
                  <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                    ${answered ? 'bg-petal-600 text-white' : 'bg-petal-50 text-cocoa-400'}`}>
                    {answered ? '✓' : i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-cocoa-900 leading-relaxed">{q.content}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">连线题</span>
                      <span className="text-xs text-cocoa-400">{connectedCount}/{leftItems.length} 已连线</span>
                    </div>
                  </div>
                </div>
                <div className="pl-10">
                  <MatchingQuestion
                    questionId={q.id}
                    leftItems={leftItems}
                    rightItems={rightItems}
                    value={val}
                    onChange={(newVal) => handleAnswer(q.id, newVal, 'matching')}
                  />
                </div>
              </div>
            )
          }

          const options: string[] = JSON.parse(q.options)
          const selected = answers[q.id]
          const typeLabel = q.type === 'multiple' ? '多选' : q.type === 'truefalse' ? '判断' : '单选'

          return (
            <div key={q.id} className={`bg-paper rounded-2xl border-2 p-5 transition-all duration-200
              ${answered ? 'border-petal-300' : 'border-line hover:border-petal-200'}`}>
              <div className="flex items-start gap-3 mb-4">
                <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                  ${answered ? 'bg-petal-600 text-white' : 'bg-petal-50 text-cocoa-400'}`}>
                  {answered ? '✓' : i + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-cocoa-900 leading-relaxed">{q.content}</p>
                  <span className="inline-block mt-1 text-xs text-petal-700 bg-petal-100 px-2 py-0.5 rounded-full">{typeLabel}</span>
                </div>
              </div>
              <div className="space-y-2 pl-10">
                {options.map((opt, oi) => {
                  const key = String.fromCharCode(65 + oi)
                  const isSelected = q.type === 'multiple'
                    ? ((selected as string[]) || []).includes(key)
                    : selected === key
                  return (
                    <label key={oi} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl cursor-pointer transition-all
                      ${isSelected
                        ? 'bg-petal-50 border-2 border-petal-300 text-petal-900'
                        : 'border-2 border-line hover:border-petal-200 hover:bg-petal-50/50 text-cocoa-700'}`}>
                      <span className={`w-5 h-5 rounded flex items-center justify-center text-xs font-bold flex-shrink-0
                        ${isSelected ? 'bg-petal-600 text-white' : 'bg-petal-50 text-cocoa-400'}`}>
                        {key}
                      </span>
                      <input
                        type={q.type === 'multiple' ? 'checkbox' : 'radio'}
                        name={q.id}
                        value={key}
                        checked={isSelected}
                        onChange={() => handleAnswer(q.id, key, q.type)}
                        className="sr-only"
                      />
                      <span className="text-sm">{opt}</span>
                    </label>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* 主观题 */}
      <div className="bg-paper rounded-2xl border-2 border-amber-100 p-5 mb-6">
        <div className="flex items-start gap-3 mb-3">
          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xs font-bold">
            {questions.length + 1}
          </span>
          <div>
            <p className="text-sm font-medium text-cocoa-900 leading-relaxed">{SUBJECTIVE_QUESTION}</p>
            <span className="inline-block mt-1 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">开放题 · 不计入分数</span>
          </div>
        </div>
        <textarea
          value={subjectiveAnswer}
          onChange={e => setSubjectiveAnswer(e.target.value)}
          placeholder="请输入你的回答，与导师共同见证你的成长..."
          rows={5}
          className="w-full px-4 py-3 border-2 border-line rounded-xl text-sm focus:outline-none focus:border-amber-200 resize-none text-cocoa-700 bg-fog transition-colors"
        />
        {subjectiveAnswer.length > 0 && (
          <p className="text-xs text-right text-cocoa-300 mt-1">{subjectiveAnswer.length} 字</p>
        )}
      </div>

      {/* 提交按钮 */}
      <div className="sticky bottom-4">
        <button
          onClick={handleSubmit}
          disabled={submitting || answeredCount < questions.length}
          className="w-full py-3.5 rounded-2xl font-bold text-sm text-white shadow-lg transition-all"
          style={{
            background: answeredCount < questions.length || submitting
              ? '#e0cdd0'
              : 'linear-gradient(90deg, #c05e6d, #9d4552)',
          }}
        >
          {submitting ? '提交中...' : answeredCount < questions.length
            ? `还有 ${questions.length - answeredCount} 道客观题未作答`
            : '提交答案 →'}
        </button>
      </div>
    </div>
  )
}
