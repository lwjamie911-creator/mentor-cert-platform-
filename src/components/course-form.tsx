'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface CourseFormProps {
  initialData?: {
    id?: string
    title: string
    description: string
    deadlineDays: number
    orderIndex: number
    isPublished: boolean
  }
}

const inputCls = 'w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 bg-white transition-all'
const labelCls = 'block text-xs font-semibold text-gray-500 mb-1.5'

export default function CourseForm({ initialData }: CourseFormProps) {
  const router = useRouter()
  const isEdit = !!initialData?.id
  const [form, setForm] = useState({
    title:        initialData?.title ?? '',
    description:  initialData?.description ?? '',
    deadlineDays: initialData?.deadlineDays ?? 30,
    orderIndex:   initialData?.orderIndex ?? 0,
    isPublished:  initialData?.isPublished ?? false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target
    setForm((f) => ({
      ...f,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked :
               type === 'number'   ? Number(value) : value,
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const url    = isEdit ? `/api/admin/courses/${initialData!.id}` : '/api/admin/courses'
    const method = isEdit ? 'PATCH' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    setLoading(false)
    if (!res.ok) {
      const data = await res.json()
      setError(data.error || '保存失败')
    } else {
      const data = await res.json()
      router.push(`/admin/courses/${data.id ?? initialData!.id}`)
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">

      {/* 课程名称 */}
      <div>
        <label className={labelCls}>
          课程名称 <span className="text-red-400">*</span>
        </label>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          required
          placeholder="请输入课程名称"
          className={inputCls}
        />
      </div>

      {/* 课程简介 */}
      <div>
        <label className={labelCls}>课程简介</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={3}
          placeholder="简单描述课程内容、学习目标等（可选）"
          className={`${inputCls} resize-none`}
        />
      </div>

      {/* 附加设置 */}
      <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4 space-y-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">课程设置</p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>完成天数限制</label>
            <div className="relative">
              <input
                type="number"
                name="deadlineDays"
                value={form.deadlineDays}
                onChange={handleChange}
                min={1}
                className={`${inputCls} pr-10`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">天</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">学员报名后需在此天数内完成</p>
          </div>
          <div>
            <label className={labelCls}>排序序号</label>
            <input
              type="number"
              name="orderIndex"
              value={form.orderIndex}
              onChange={handleChange}
              min={0}
              className={inputCls}
            />
            <p className="text-xs text-gray-400 mt-1">数字越小越靠前</p>
          </div>
        </div>

        {/* 发布开关 */}
        <label className="flex items-center gap-3 cursor-pointer group">
          <div
            onClick={() => setForm(f => ({ ...f, isPublished: !f.isPublished }))}
            className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 ${
              form.isPublished ? 'bg-green-500' : 'bg-gray-300'
            }`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
              form.isPublished ? 'translate-x-5' : 'translate-x-1'
            }`} />
            <input
              type="checkbox"
              name="isPublished"
              checked={form.isPublished}
              onChange={handleChange}
              className="sr-only"
            />
          </div>
          <div>
            <span className={`text-sm font-medium ${form.isPublished ? 'text-green-700' : 'text-gray-600'}`}>
              {form.isPublished ? '✅ 已上线发布' : '草稿（未上线）'}
            </span>
            <p className="text-xs text-gray-400">上线后学员可见并报名</p>
          </div>
        </label>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-100 px-4 py-3 rounded-xl">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm transition-all disabled:opacity-60"
          style={{ background: loading ? '#a5b4fc' : 'linear-gradient(90deg, #4f46e5, #7c3aed)' }}
        >
          {loading ? '保存中…' : isEdit ? '💾 保存修改' : '✅ 创建课程'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          取消
        </button>
      </div>
    </form>
  )
}
