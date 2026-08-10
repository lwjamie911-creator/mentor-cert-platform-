'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { HelpCircle, Plus, Save, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
  single:    { label: '单选', color: 'bg-cocoa-100 text-cocoa-700' },
  multiple:  { label: '多选', color: 'bg-cocoa-100 text-cocoa-700' },
  truefalse: { label: '判断', color: 'bg-cocoa-100 text-cocoa-700' },
  matching:  { label: '连线', color: 'bg-cocoa-100 text-cocoa-700' },
}

const difficultyConfig: Record<number, { label: string; color: string }> = {
  1: { label: '简单', color: 'bg-green-50 text-green-600' },
  2: { label: '中等', color: 'bg-blush/60 text-sienna' },
  3: { label: '困难', color: 'bg-red-50 text-red-500' },
}

const inputCls = 'w-full px-3 py-2 border border-cocoa-300 rounded-lg text-sm text-cocoa-900 placeholder:text-cocoa-400 focus:outline-none focus:ring-2 focus:ring-cocoa-600/15 focus:border-cocoa-600 bg-cocoa-50/50 transition-all'
const labelCls = 'block text-xs font-semibold text-cocoa-600 mb-1.5'

export function QuestionBank({ courseId, chapterId, questions, scope }: QuestionBankProps) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    type: 'single',
    content: '',
    optionA: '', optionB: '', optionC: '', optionD: '',
    answer: [] as string[],
    // matching type: pairs of [left, right]
    matchingPairs: [
      { left: '', right: '' },
      { left: '', right: '' },
    ] as { left: string; right: string }[],
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

  function updateMatchingPair(idx: number, side: 'left' | 'right', value: string) {
    setForm(f => {
      const pairs = [...f.matchingPairs]
      pairs[idx] = { ...pairs[idx], [side]: value }
      return { ...f, matchingPairs: pairs }
    })
  }

  function addMatchingPair() {
    setForm(f => ({ ...f, matchingPairs: [...f.matchingPairs, { left: '', right: '' }] }))
  }

  function removeMatchingPair(idx: number) {
    setForm(f => ({ ...f, matchingPairs: f.matchingPairs.filter((_, i) => i !== idx) }))
  }

  async function saveQuestion() {
    if (!form.content) return alert('请填写题目内容')
    setSaving(true)

    let options: string
    let answer: string

    if (form.type === 'matching') {
      const validPairs = form.matchingPairs.filter(p => p.left.trim() && p.right.trim())
      if (validPairs.length < 2) {
        alert('连线题至少需要 2 对完整的连线对')
        setSaving(false)
        return
      }
      // options = left items (JSON array), answer = right items in correct order (JSON array)
      options = JSON.stringify(validPairs.map(p => p.left.trim()))
      answer  = JSON.stringify(validPairs.map(p => p.right.trim()))
    } else {
      if (form.answer.length === 0) return alert('请选择正确答案')
      const opts = [form.optionA, form.optionB, form.optionC, form.optionD].filter(Boolean)
      if (form.type !== 'truefalse' && opts.length < 2) {
        alert('至少填写两个选项')
        setSaving(false)
        return
      }
      options = JSON.stringify(form.type === 'truefalse' ? ['正确', '错误'] : opts)
      answer  = JSON.stringify(form.answer)
    }

    await fetch('/api/admin/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        courseId: scope === 'course' ? courseId : null,
        chapterId: scope === 'chapter' ? chapterId : null,
        type: form.type,
        content: form.content,
        options,
        answer,
        explanation: form.explanation || null,
        difficulty: form.difficulty,
      }),
    })

    setSaving(false)
    setShowForm(false)
    setForm({
      type: 'single', content: '',
      optionA: '', optionB: '', optionC: '', optionD: '',
      answer: [],
      matchingPairs: [{ left: '', right: '' }, { left: '', right: '' }],
      explanation: '', difficulty: 1,
    })
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
          const tc = typeConfig[q.type] ?? { label: q.type, color: 'bg-cocoa-50 text-cocoa-500' }
          const dc = difficultyConfig[q.difficulty] ?? difficultyConfig[1]
          return (
            <div key={q.id}
              className="flex items-start gap-3 bg-cocoa-50/60 hover:bg-cocoa-100/60 border border-line hover:border-cocoa-300 rounded-xl px-4 py-3 transition-all group">
              {/* 序号 */}
              <div className="w-6 h-6 rounded-md bg-paper border border-cocoa-200 flex items-center justify-center text-xs font-bold text-cocoa-500 flex-shrink-0 mt-0.5">
                {i + 1}
              </div>

              {/* 内容 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tc.color}`}>{tc.label}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${dc.color}`}>{dc.label}</span>
                </div>
                <p className="text-sm text-cocoa-800 leading-relaxed">{q.content}</p>
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
          <div className="text-center py-10 text-cocoa-400">
            <HelpCircle className="w-8 h-8 mx-auto mb-2 text-cocoa-300" strokeWidth={1.5} />
            <p className="text-sm">暂无题目，点击下方添加</p>
          </div>
        )}
      </div>

      {/* 添加按钮 / 表单 */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-cocoa-700 border border-cocoa-300 hover:bg-cocoa-100 transition-all active:scale-[0.97]"
        >
          <Plus className="w-4 h-4" strokeWidth={2} /> 添加题目
        </button>
      ) : (
        <div className="bg-cocoa-50/60 rounded-2xl border border-cocoa-200 p-5 space-y-4 mt-2">
          <div className="flex items-center gap-2 mb-1">
            <Pencil className="w-4 h-4 text-cocoa-700" strokeWidth={2} />
            <h3 className="font-semibold text-sm text-cocoa-900">添加新题目</h3>
          </div>

          {/* 题型 + 难度 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>题型</label>
              <select name="type" value={form.type} onChange={handleChange} className={inputCls}>
                <option value="single">单选题</option>
                <option value="multiple">多选题</option>
                <option value="truefalse">判断题</option>
                <option value="matching">连线题</option>
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

          {/* 选项（非连线题） */}
          {form.type !== 'truefalse' && form.type !== 'matching' && (
            <div>
              <label className={labelCls}>选项</label>
              <div className="grid grid-cols-2 gap-2">
                {(['A', 'B', 'C', 'D'] as const).map((letter) => (
                  <div key={letter} className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-cocoa-100 text-cocoa-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
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

          {/* 正确答案（非连线题） */}
          {form.type !== 'matching' && (
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
                    className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all active:scale-[0.97] ${
                      form.answer.includes(opt)
                        ? 'bg-cocoa-800 text-paper border-cocoa-800 shadow-card'
                        : 'bg-paper border-cocoa-300 text-cocoa-600 hover:border-cocoa-500 hover:text-cocoa-800'
                    }`}
                  >
                    {form.type === 'truefalse' ? (opt === 'A' ? '✓ 正确' : '✗ 错误') : opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 连线题配对 */}
          {form.type === 'matching' && (
            <div>
              <label className={labelCls}>连线对（左侧 → 右侧，顺序即为正确配对）</label>
              <div className="space-y-2">
                {form.matchingPairs.map((pair, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      value={pair.left}
                      onChange={e => updateMatchingPair(idx, 'left', e.target.value)}
                      className={inputCls}
                      placeholder="左侧项"
                    />
                    <span className="text-cocoa-300 flex-shrink-0">→</span>
                    <input
                      value={pair.right}
                      onChange={e => updateMatchingPair(idx, 'right', e.target.value)}
                      className={inputCls}
                      placeholder="右侧项"
                    />
                    {form.matchingPairs.length > 2 && (
                      <button
                        onClick={() => removeMatchingPair(idx)}
                        className="flex-shrink-0 w-6 h-6 rounded-full text-cocoa-400 hover:text-red-400 hover:bg-red-50 transition-colors text-sm"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={addMatchingPair}
                className="mt-2 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
              >
                + 增加一对
              </button>
              <p className="text-xs text-cocoa-400 mt-1">右侧项将在答题时被随机打乱顺序，学员需要将其正确匹配到左侧</p>
            </div>
          )}

          {/* 解析 */}
          <div>
            <label className={labelCls}>解析（可选）</label>
            <textarea name="explanation" value={form.explanation} onChange={handleChange} rows={2}
              className={inputCls}
              placeholder="答题解析，提交后展示给学员" />
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-2 pt-1">
            <Button size="sm" onClick={saveQuestion} disabled={saving}>
              <Save className="w-4 h-4" strokeWidth={2} /> {saving ? '保存中…' : '保存题目'}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
              取消
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
