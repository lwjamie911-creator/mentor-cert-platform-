'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Question {
  id: string
  type: string
  content: string
  options: string
}

const SUBJECTIVE_QUESTION = '请结合你在入职前三个月的实际经历，谈谈你对"导师制"的理解，以及导师对你成长的影响。（开放作答，不计入分数）'

export function NewbieExamClient({ questions }: { questions: Question[] }) {
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [subjectiveAnswer, setSubjectiveAnswer] = useState('')
  const [result, setResult] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)

  function handleAnswer(qId: string, opt: string, type: string) {
    if (type === 'multiple') {
      setAnswers(prev => {
        const cur = (prev[qId] as string[]) || []
        return { ...prev, [qId]: cur.includes(opt) ? cur.filter(o => o !== opt) : [...cur, opt] }
      })
    } else {
      setAnswers(prev => ({ ...prev, [qId]: opt }))
    }
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

  const objectiveAnswered = Object.keys(answers).length

  // 结果页
  if (result) {
    const passed = result.passed
    return (
      <div className="max-w-lg mx-auto text-center py-8">
        <div className={`rounded-3xl p-10 mb-6 relative overflow-hidden ${passed
          ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200'
          : 'bg-gradient-to-br from-gray-50 to-slate-100 border border-gray-200'}`}>
          <div className="absolute top-[-20px] right-[-20px] text-8xl opacity-10">{passed ? '🏅' : '📝'}</div>
          <div className="text-6xl mb-4">{passed ? '🎉' : '😅'}</div>
          <div className={`text-7xl font-black mb-2 ${passed ? 'text-blue-500' : 'text-gray-400'}`}>
            {result.score}
            <span className="text-2xl font-normal ml-1">分</span>
          </div>
          <div className={`text-sm font-medium mb-1 ${passed ? 'text-blue-700' : 'text-gray-500'}`}>
            答对 {result.correctCount} / {result.total} 题
          </div>
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold mt-2
            ${passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
            {passed ? '✓ 通过' : '✗ 未通过（需 60 分）'}
          </div>
        </div>

        {passed && (
          <p className="text-gray-500 text-sm mb-6">恭喜！成长勋章已颁发，记录你的精彩时刻 🌱</p>
        )}

        <div className="flex gap-3 justify-center">
          {passed ? (
            <Link href="/newbie/badge"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold text-white shadow-sm"
              style={{ background: 'linear-gradient(90deg, #3b82f6, #6366f1)' }}
            >
              查看成长勋章 →
            </Link>
          ) : (
            <Link href="/newbie"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-300 hover:text-blue-700 transition-colors"
            >
              ← 返回重试
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
            <h1 className="text-xl font-bold text-gray-900">新人知识测试</h1>
            <p className="text-sm text-gray-400 mt-0.5">{questions.length} 道客观题 + 1 道主观题 · 客观 60 分及以上通过</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-blue-500">{objectiveAnswered}</span>
            <span className="text-gray-400 text-sm">/{questions.length}</span>
            <p className="text-xs text-gray-400">已作答</p>
          </div>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${(objectiveAnswered / questions.length) * 100}%`,
              background: 'linear-gradient(90deg, #3b82f6, #6366f1)',
            }} />
        </div>
      </div>

      {/* 客观题 */}
      <div className="space-y-4 mb-4">
        {questions.map((q, i) => {
          const options: string[] = JSON.parse(q.options)
          const selected = answers[q.id]
          const isAnswered = selected !== undefined && (Array.isArray(selected) ? selected.length > 0 : true)
          const typeLabel = q.type === 'multiple' ? '多选' : q.type === 'truefalse' ? '判断' : '单选'

          return (
            <div key={q.id} className={`bg-white rounded-2xl border-2 p-5 transition-all duration-200
              ${isAnswered ? 'border-blue-200' : 'border-gray-100 hover:border-gray-200'}`}>
              <div className="flex items-start gap-3 mb-4">
                <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                  ${isAnswered ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                  {isAnswered ? '✓' : i + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 leading-relaxed">{q.content}</p>
                  <span className="inline-block mt-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{typeLabel}</span>
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
                        ? 'bg-blue-50 border-2 border-blue-300 text-blue-900'
                        : 'border-2 border-gray-100 hover:border-blue-100 hover:bg-blue-50/50 text-gray-700'}`}>
                      <span className={`w-5 h-5 rounded flex items-center justify-center text-xs font-bold flex-shrink-0
                        ${isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
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
      <div className="bg-white rounded-2xl border-2 border-indigo-100 p-5 mb-6">
        <div className="flex items-start gap-3 mb-3">
          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
            {questions.length + 1}
          </span>
          <div>
            <p className="text-sm font-medium text-gray-900 leading-relaxed">{SUBJECTIVE_QUESTION}</p>
            <span className="inline-block mt-1 text-xs text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">开放题 · 不计入分数</span>
          </div>
        </div>
        <textarea
          value={subjectiveAnswer}
          onChange={e => setSubjectiveAnswer(e.target.value)}
          placeholder="请输入你的回答，与导师共同见证你的成长..."
          rows={5}
          className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-sm focus:outline-none focus:border-indigo-200 resize-none text-gray-700 bg-gray-50/50 transition-colors"
        />
        {subjectiveAnswer.length > 0 && (
          <p className="text-xs text-right text-gray-300 mt-1">{subjectiveAnswer.length} 字</p>
        )}
      </div>

      {/* 提交按钮 */}
      <div className="sticky bottom-4">
        <button
          onClick={handleSubmit}
          disabled={submitting || objectiveAnswered < questions.length}
          className="w-full py-3.5 rounded-2xl font-bold text-sm text-white shadow-lg transition-all"
          style={{
            background: objectiveAnswered < questions.length || submitting
              ? '#d1d5db'
              : 'linear-gradient(90deg, #3b82f6, #6366f1)',
          }}
        >
          {submitting ? '提交中...' : objectiveAnswered < questions.length
            ? `还有 ${questions.length - objectiveAnswered} 道客观题未作答`
            : '提交答案 →'}
        </button>
      </div>
    </div>
  )
}
