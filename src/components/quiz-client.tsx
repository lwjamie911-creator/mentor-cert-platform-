'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MatchingQuestion } from './matching-question'

interface Question {
  id: string
  type: string
  content: string
  options: string[]
  rightItems?: string[] // 连线题右侧选项（由 API 下发）
}

interface ResultQuestion {
  id: string
  type: string
  content: string
  options: string[]
  answer: string[]
  explanation: string | null
  userAnswer: any
}

export function QuizClient({
  chapterId,
  courseId,
  examType,
  title,
}: {
  chapterId?: string
  courseId: string
  examType: 'chapter' | 'final'
  title: string
}) {
  const router = useRouter()
  const [questions,  setQuestions]  = useState<Question[]>([])
  const [answers,    setAnswers]    = useState<Record<string, any>>({})
  const [result,     setResult]     = useState<{ attempt: any; questions: ResultQuestion[] } | null>(null)
  const [loading,    setLoading]    = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const url = examType === 'chapter' && chapterId
      ? `/api/chapters/${chapterId}/questions`
      : `/api/courses/${courseId}/final-questions`
    fetch(url)
      .then(r => r.json())
      .then(data => { setQuestions(data); setLoading(false) })
  }, [])

  function handleAnswer(qId: string, option: string, type: string) {
    if (type === 'multiple') {
      setAnswers(prev => {
        const current = (prev[qId] as string[]) || []
        return {
          ...prev,
          [qId]: current.includes(option) ? current.filter(o => o !== option) : [...current, option],
        }
      })
    } else {
      setAnswers(prev => ({ ...prev, [qId]: option }))
    }
  }

  function handleMatchingAnswer(qId: string, val: Record<number, number>) {
    setAnswers(prev => ({ ...prev, [qId]: val }))
  }

  function isAnswered(q: Question): boolean {
    const a = answers[q.id]
    if (q.type === 'matching') {
      const options = Array.isArray(q.options) ? q.options : JSON.parse(q.options as any)
      return a && typeof a === 'object' && Object.keys(a).length === options.length
    }
    return Array.isArray(a) ? a.length > 0 : !!a
  }

  async function handleSubmit() {
    setSubmitting(true)
    const res = await fetch('/api/exam/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ examType, chapterId: chapterId || null, courseId, answers }),
    })
    const data = await res.json()
    setResult(data)
    setSubmitting(false)
  }

  const answeredCount = questions.filter(q => isAnswered(q)).length
  const allAnswered   = answeredCount >= questions.length

  /* ── 加载中 ── */
  if (loading) return (
    <div className="text-center py-20 text-gray-400">
      <div className="text-4xl mb-3 animate-pulse">📝</div>
      <p className="text-sm">加载题目中…</p>
    </div>
  )

  if (questions.length === 0) return (
    <div className="text-center py-20 text-gray-400">
      <div className="text-4xl mb-3">📭</div>
      <p className="text-sm">暂无题目</p>
    </div>
  )

  /* ── 结果页 ── */
  if (result) {
    const { attempt, questions: resultQs } = result
    const passed = attempt.passed
    return (
      <div className="space-y-5">
        {/* 得分卡 */}
        <div className={`rounded-2xl p-8 text-center border ${passed ? 'border-green-100' : 'border-red-100'}`}
          style={{ background: passed ? 'linear-gradient(135deg,#f0fdf4,#dcfce7)' : 'linear-gradient(135deg,#fff1f2,#ffe4e6)' }}>
          <div className="text-7xl font-black mb-2" style={{ color: passed ? '#16a34a' : '#dc2626' }}>
            {attempt.score}
          </div>
          <div className="text-sm font-semibold text-gray-500 mb-3">分</div>
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
            {passed ? '🎉 通过' : `❌ 未通过 · 需要 ${attempt.passThreshold} 分`}
          </div>
          <p className="text-xs text-gray-400 mt-3">答对 {attempt.correctCount} / {attempt.totalQuestions} 题</p>
        </div>

        {/* 答题详情 */}
        <div className="space-y-3">
          {resultQs.map((q, i) => {
            if (q.type === 'matching') {
              return <MatchingResult key={q.id} q={q} index={i} />
            }
            const userArr = Array.isArray(q.userAnswer) ? q.userAnswer : q.userAnswer ? [q.userAnswer] : []
            const correct = q.answer.length === userArr.length && q.answer.every(a => userArr.includes(a))
            return (
              <div key={q.id} className={`bg-white rounded-2xl border p-5 ${correct ? 'border-green-100' : 'border-red-100'}`}>
                <div className="flex items-start gap-2 mb-3">
                  <span className={`flex-shrink-0 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${correct ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                    {correct ? '✓' : '✗'}
                  </span>
                  <p className="text-sm font-medium text-gray-800 leading-relaxed">{i + 1}. {q.content}</p>
                </div>
                <div className="space-y-1.5 ml-8">
                  {q.options.map((opt, oi) => {
                    const optKey     = String.fromCharCode(65 + oi)
                    const isAnswer   = q.answer.includes(optKey)
                    const isSelected = userArr.includes(optKey)
                    return (
                      <div key={oi} className={`text-sm px-3 py-2 rounded-xl flex items-center gap-2 ${
                        isAnswer                ? 'bg-green-50 text-green-800 font-medium' :
                        isSelected && !isAnswer ? 'bg-red-50 text-red-700' : 'text-gray-500'
                      }`}>
                        <span className={`w-5 h-5 rounded-full text-xs flex items-center justify-center flex-shrink-0 font-bold ${
                          isAnswer                ? 'bg-green-200 text-green-700' :
                          isSelected && !isAnswer ? 'bg-red-200 text-red-600' : 'bg-gray-100 text-gray-400'
                        }`}>{optKey}</span>
                        {opt}
                        {isAnswer   && <span className="ml-auto text-green-500 text-xs">正确答案</span>}
                        {isSelected && !isAnswer && <span className="ml-auto text-red-400 text-xs">你的选择</span>}
                      </div>
                    )
                  })}
                </div>
                {q.explanation && (
                  <div className="mt-3 ml-8 px-3 py-2.5 bg-indigo-50 rounded-xl text-xs text-indigo-700 leading-relaxed">
                    💡 解析：{q.explanation}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="flex gap-3 justify-center pb-2">
          <Link href={`/dashboard/courses/${courseId}`}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors">
            返回课程
          </Link>
          {!passed && (
            <button onClick={() => { setResult(null); setAnswers({}) }}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-all"
              style={{ background: 'linear-gradient(90deg,#3b82f6,#6366f1)' }}>
              重新答题
            </button>
          )}
          {passed && examType === 'final' && (
            <Link href="/dashboard/certificates"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-all"
              style={{ background: 'linear-gradient(90deg,#22c55e,#16a34a)' }}>
              🏆 查看证书
            </Link>
          )}
        </div>
      </div>
    )
  }

  /* ── 答题页 ── */
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900 mb-1">{title}</h1>
        <div className="flex items-center gap-3">
          <p className="text-sm text-gray-400">共 {questions.length} 题</p>
          <div className="flex items-center gap-1.5">
            {questions.map(q => (
              <div key={q.id} className={`w-2 h-2 rounded-full transition-colors ${isAnswered(q) ? 'bg-indigo-500' : 'bg-gray-200'}`} />
            ))}
          </div>
          <span className="text-xs text-indigo-500 font-medium">{answeredCount}/{questions.length} 已答</span>
        </div>
      </div>

      <div className="space-y-4">
        {questions.map((q, i) => {
          const options   = Array.isArray(q.options) ? q.options : JSON.parse(q.options as any)
          const selected  = answers[q.id]
          const answered  = isAnswered(q)

          if (q.type === 'matching') {
            return (
              <div key={q.id} className={`bg-white rounded-2xl border p-5 transition-all ${answered ? 'border-indigo-200 shadow-sm' : 'border-gray-100'}`}>
                <div className="flex items-start gap-2 mb-1">
                  <span className={`flex-shrink-0 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${answered ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>{i + 1}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800 leading-relaxed">{q.content}</p>
                    <span className="text-xs text-indigo-400 mt-0.5 inline-block">连线题 · 点击左侧项后再点击右侧匹配项</span>
                  </div>
                </div>
                <MatchingQuestion
                  questionId={q.id}
                  leftItems={options}
                  rightItems={q.rightItems ?? options}
                  value={selected}
                  onChange={val => handleMatchingAnswer(q.id, val)}
                />
              </div>
            )
          }

          return (
            <div key={q.id} className={`bg-white rounded-2xl border p-5 transition-all ${answered ? 'border-indigo-200 shadow-sm' : 'border-gray-100'}`}>
              <div className="flex items-start gap-2 mb-4">
                <span className={`flex-shrink-0 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${answered ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>{i + 1}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800 leading-relaxed">{q.content}</p>
                  <span className="text-xs text-gray-400 mt-0.5 inline-block">
                    {q.type === 'multiple' ? '多选题' : q.type === 'truefalse' ? '判断题' : '单选题'}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                {options.map((opt: string, oi: number) => {
                  const optKey    = String.fromCharCode(65 + oi)
                  const isSelected= q.type === 'multiple'
                    ? ((selected as string[]) || []).includes(optKey)
                    : selected === optKey
                  return (
                    <label key={oi} className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${
                      isSelected ? 'bg-indigo-50 border-2 border-indigo-300' : 'border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/40'
                    }`}>
                      <input type={q.type === 'multiple' ? 'checkbox' : 'radio'} name={q.id} value={optKey}
                        checked={isSelected} onChange={() => handleAnswer(q.id, optKey, q.type)} className="sr-only" />
                      <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 transition-colors ${isSelected ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-500'}`}>{optKey}</span>
                      <span className={`text-sm ${isSelected ? 'text-indigo-700 font-medium' : 'text-gray-600'}`}>{opt}</span>
                    </label>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <div className="sticky bottom-4">
        <button onClick={handleSubmit} disabled={submitting || !allAnswered}
          className="w-full py-3.5 rounded-2xl text-sm font-semibold text-white shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
          style={{ background: allAnswered ? 'linear-gradient(90deg,#4f46e5,#7c3aed)' : undefined, backgroundColor: !allAnswered ? '#d1d5db' : undefined }}>
          {submitting ? '提交中…' : allAnswered ? '提交答案 →' : `还有 ${questions.length - answeredCount} 题未作答`}
        </button>
      </div>
    </div>
  )
}

/* ── 连线题结果展示 ── */
function MatchingResult({ q, index }: { q: ResultQuestion; index: number }) {
  const leftItems  = Array.isArray(q.options) ? q.options : JSON.parse(q.options as any)
  const rightItems = Array.isArray(q.answer)  ? q.answer  : JSON.parse(q.answer as any)
  const userAnswer = q.userAnswer as Record<number, number> | null

  const allCorrect = leftItems.every((_: any, li: number) => userAnswer?.[li] === li)

  return (
    <div className={`bg-white rounded-2xl border p-5 ${allCorrect ? 'border-green-100' : 'border-red-100'}`}>
      <div className="flex items-start gap-2 mb-3">
        <span className={`flex-shrink-0 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${allCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
          {allCorrect ? '✓' : '✗'}
        </span>
        <p className="text-sm font-medium text-gray-800">{index + 1}. {q.content}</p>
      </div>
      <div className="ml-8 space-y-1.5">
        {leftItems.map((left: string, li: number) => {
          const selectedOrigIndex = userAnswer?.[li]
          const selectedRight     = selectedOrigIndex !== undefined ? rightItems[selectedOrigIndex] : null
          const isCorrect         = selectedOrigIndex === li
          return (
            <div key={li} className={`flex items-center gap-2 text-xs px-3 py-2 rounded-xl ${isCorrect ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
              <span className="font-bold">{String.fromCharCode(65 + li)}. {left}</span>
              <span className="text-gray-400">→</span>
              <span className={isCorrect ? 'font-medium' : 'line-through opacity-60'}>{selectedRight ?? '未作答'}</span>
              {!isCorrect && <span className="text-green-600 ml-1">✓ 应为：{rightItems[li]}</span>}
            </div>
          )
        })}
      </div>
      {q.explanation && (
        <div className="mt-3 ml-8 px-3 py-2.5 bg-indigo-50 rounded-xl text-xs text-indigo-700">
          💡 解析：{q.explanation}
        </div>
      )}
    </div>
  )
}
