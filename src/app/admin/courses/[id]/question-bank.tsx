'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Question {
  id: string
  type: string
  content: string
  difficulty: number
}

interface QuestionBankProps {
  courseId?: string
  chapterId?: string
  questions: Question[]
  scope: 'course' | 'chapter'
}

const typeConfig: Record<string, { label: string; color: string }> = {
  single:    { label: '单选', color: 'bg-blue-50 text-blue-600' },
  multiple:  { label: '多选', color: 'bg-violet-50 text-violet-600' },
  truefalse: { label: '判断', color: 'bg-amber-50 text-amber-600' },
}

const difficultyConfig: Record<number, { label: string; color: string }> = {
  1: { label: '简单', color: 'bg-green-50 text-green-600' },
  2: { label: '中等', color: 'bg-orange-50 text-orange-500' },
  3: { label: '困难', color: 'bg-red-50 text-red-500' },
}

const inputCls = 'w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 bg-white transition-all'
const labelCls = 'block text-xs font-semibold text-gray-500 mb-1.5'

export function QuestionBank({ courseId, chapterId, questions, scope }: QuestionBankProps) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    type: 'single',
    content: '',
    optionA: '', optionB: '', optionC: '', optionD: '',
    answer: [] as string[],
    explanation: '',
    difficulty: 1,
  })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: name === 'difficulty' ? Number(value) : value }))
  }

  function toggleAnswer(opt: string) {
    setForm((f) => {
      if (f.type !== 'multiple') return { ...f, answer: [opt] }
      return {
        ...f,
        answer: f.answer.includes(opt) ? f.answer.filter((a) => a !== opt) : [...f.answer, opt],
      }
    })
  }

  async function saveQuestion() {
    if (!form.content || form.answer.length === 0) return alert('请填写题目内容和正确答案')
    setSaving(true)

    const options = [form.optionA, form.optionB, form.optionC, form.optionD].filter(Boolean)
    if (form.type !== 'truefalse' && options.length < 2) {
      alert('至少填写两个选项')
      setSaving(false)
      return
    }

    await fetch('/api/admin/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        courseId: scope === 'course' ? courseId : null,
        chapterId: scope === 'chapter' ? chapterId : null,
        type: form.type,
        content: form.content,
        options: JSON.stringify(form.type === 'truefalse' ? ['正确', '错误'] : options),
        answer: JSON.stringify(form.answer),
        explanation: form.explanation || null,
        difficulty: form.difficulty,
      }),
    })

    setSaving(false)
    setShowForm(false)
    setForm({ type: 'single', content: '', optionA: '', optionB: '', optionC: '', optionD: '', answer: [], explanation: '', difficulty: 1 })
    router.refresh()
  }

  async function deleteQuestion(id: string) {
    if (!confirm('确定删除该题目？')) return
    setDeleting(id)
    await fetch(`/api/admin/questions/${id}`, { method: 'DELETE' })
    setDeleting(null)
    router.refresh()
  }

  return (
    <div>
      {/* 题目列表 */}
      <div className="space-y-2 mb-4">
        {questions.map((q, i) => {
          const tc = typeConfig[q.type] ?? { label: q.type, color: 'bg-gray-100 text-gray-500' }
          const dc = difficultyConfig[q.difficulty] ?? difficultyConfig[1]
          return (
            <div key={q.id}
              className="flex items-start gap-3 bg-gray-50 hover:bg-purple-50/30 border border-gray-100 hover:border-purple-200 rounded-xl px-4 py-3 transition-all group">
              {/* 序号 */}
              <div className="w-6 h-6 rounded-md bg-white border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-400 flex-shrink-0 mt-0.5">
                {i + 1}
              </div>

              {/* 内容 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tc.color}`}>{tc.label}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${dc.color}`}>{dc.label}</span>
                </div>
                <p className="text-sm text-gray-800 leading-relaxed">{q.content}</p>
              </div>

              {/* 删除 */}
              <button
                onClick={() => deleteQuestion(q.id)}
                disabled={deleting === q.id}
                className="flex-shrink-0 mt-0.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 border border-red-100 hover:bg-red-50 transition-colors opacity-60 group-hover:opacity-100 disabled:opacity-30"
              >
                {deleting === q.id ? '…' : '删除'}
              </button>
            </div>
          )
        })}

        {questions.length === 0 && (
          <div className="text-center py-10 text-gray-300">
            <div className="text-3xl mb-2">❓</div>
            <p className="text-sm">暂无题目，点击下方添加</p>
          </div>
        )}
      </div>

      {/* 添加按钮 / 表单 */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-purple-600 border border-purple-200 hover:bg-purple-50 transition-colors"
        >
          + 添加题目
        </button>
      ) : (
        <div className="bg-gradient-to-br from-gray-50 to-indigo-50/30 rounded-2xl border border-indigo-100 p-5 space-y-4 mt-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base">✏️</span>
            <h3 className="font-bold text-sm text-indigo-800">添加新题目</h3>
          </div>

          {/* 题型 + 难度 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>题型</label>
              <select name="type" value={form.type} onChange={handleChange} className={inputCls}>
                <option value="single">单选题</option>
                <option value="multiple">多选题</option>
                <option value="truefalse">判断题</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>难度</label>
              <select name="difficulty" value={form.difficulty} onChange={handleChange} className={inputCls}>
                <option value={1}>⭐ 简单</option>
                <option value={2}>⭐⭐ 中等</option>
                <option value={3}>⭐⭐⭐ 困难</option>
              </select>
            </div>
          </div>

          {/* 题目内容 */}
          <div>
            <label className={labelCls}>题目内容</label>
            <textarea name="content" value={form.content} onChange={handleChange} rows={2}
              className={inputCls}
              placeholder="请输入题目内容" />
          </div>

          {/* 选项 */}
          {form.type !== 'truefalse' && (
            <div>
              <label className={labelCls}>选项</label>
              <div className="grid grid-cols-2 gap-2">
                {(['A', 'B', 'C', 'D'] as const).map((letter) => (
                  <div key={letter} className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {letter}
                    </span>
                    <input
                      name={`option${letter}`}
                      value={(form as unknown as Record<string, string>)[`option${letter}`]}
                      onChange={handleChange}
                      className={inputCls}
                      placeholder={letter === 'A' || letter === 'B' ? '必填' : '选填'}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 正确答案 */}
          <div>
            <label className={labelCls}>
              正确答案{form.type === 'multiple' ? ' (多选，可选多个)' : ''}
            </label>
            <div className="flex gap-2 flex-wrap">
              {(form.type === 'truefalse' ? ['A', 'B'] : ['A', 'B', 'C', 'D']).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggleAnswer(opt)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                    form.answer.includes(opt)
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white border-gray-200 text-gray-500 hover:border-indigo-300 hover:text-indigo-500'
                  }`}
                >
                  {form.type === 'truefalse' ? (opt === 'A' ? '✓ 正确' : '✗ 错误') : opt}
                </button>
              ))}
            </div>
          </div>

          {/* 解析 */}
          <div>
            <label className={labelCls}>解析（可选）</label>
            <textarea name="explanation" value={form.explanation} onChange={handleChange} rows={2}
              className={inputCls}
              placeholder="答题解析，提交后展示给学员" />
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={saveQuestion}
              disabled={saving}
              className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60"
              style={{ background: saving ? '#a5b4fc' : 'linear-gradient(90deg, #4f46e5, #7c3aed)' }}
            >
              {saving ? '保存中…' : '💾 保存题目'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-xl text-sm font-medium text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
