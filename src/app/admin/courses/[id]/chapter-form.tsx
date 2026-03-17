'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ChapterFormProps {
  courseId: string
  initialData?: {
    id?: string
    title: string
    description: string
    contentType: string
    contentText: string
    contentUrl: string
    minReadSeconds: number
    orderIndex: number
    isRequired: boolean
  }
}

const inputCls = 'w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 bg-white transition-all'
const labelCls = 'block text-xs font-semibold text-gray-500 mb-1.5'

const contentTypeOptions = [
  { value: 'text',          label: '📝 图文（Markdown）', desc: '支持 Markdown 富文本编辑' },
  { value: 'pdf',           label: '📄 PDF 文件',         desc: '填写 PDF 文件路径' },
  { value: 'external_link', label: '🔗 外部链接',          desc: '填写外部网页 URL' },
]

export default function ChapterForm({ courseId, initialData }: ChapterFormProps) {
  const router = useRouter()
  const isEdit = !!initialData?.id
  const [form, setForm] = useState({
    title:           initialData?.title ?? '',
    description:     initialData?.description ?? '',
    contentType:     initialData?.contentType ?? 'text',
    contentText:     initialData?.contentText ?? '',
    contentUrl:      initialData?.contentUrl ?? '',
    minReadSeconds:  initialData?.minReadSeconds ?? 0,
    orderIndex:      initialData?.orderIndex ?? 0,
    isRequired:      initialData?.isRequired ?? true,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target
    setForm((f) => ({
      ...f,
      [name]: type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : (name === 'minReadSeconds' || name === 'orderIndex') ? Number(value) : value,
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const url    = isEdit ? `/api/admin/chapters/${initialData!.id}` : '/api/admin/chapters'
    const method = isEdit ? 'PATCH' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, courseId }),
    })

    setLoading(false)
    if (!res.ok) {
      const data = await res.json()
      setError(data.error || '保存失败')
    } else {
      router.push(`/admin/courses/${courseId}`)
      router.refresh()
    }
  }

  const selectedType = contentTypeOptions.find(o => o.value === form.contentType)

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">

      {/* 标题 + 简介 */}
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className={labelCls}>章节标题 <span className="text-red-400">*</span></label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            placeholder="请输入章节标题"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>章节简介</label>
          <input
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="一句话描述章节内容（可选）"
            className={inputCls}
          />
        </div>
      </div>

      {/* 内容类型选择 */}
      <div>
        <label className={labelCls}>内容类型</label>
        <div className="flex gap-2 flex-wrap">
          {contentTypeOptions.map((opt) => (
            <label
              key={opt.value}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer transition-all text-sm font-medium ${
                form.contentType === opt.value
                  ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-sm'
                  : 'bg-white border-gray-200 text-gray-500 hover:border-blue-200 hover:text-blue-600'
              }`}
            >
              <input
                type="radio"
                name="contentType"
                value={opt.value}
                checked={form.contentType === opt.value}
                onChange={handleChange}
                className="sr-only"
              />
              {opt.label}
            </label>
          ))}
        </div>
        {selectedType && (
          <p className="text-xs text-gray-400 mt-2 ml-1">{selectedType.desc}</p>
        )}
      </div>

      {/* 图文内容 */}
      {form.contentType === 'text' && (
        <div>
          <label className={labelCls}>正文内容（支持 Markdown）</label>
          <textarea
            name="contentText"
            value={form.contentText}
            onChange={handleChange}
            rows={12}
            placeholder={'# 标题\n\n正文内容...'}
            className={`${inputCls} font-mono leading-relaxed`}
          />
          <p className="text-xs text-gray-400 mt-1.5 ml-1">支持 Markdown 语法，如 **粗体**、`代码`、## 标题 等</p>
        </div>
      )}

      {/* PDF / 外链 URL */}
      {(form.contentType === 'pdf' || form.contentType === 'external_link') && (
        <div>
          <label className={labelCls}>
            {form.contentType === 'pdf' ? 'PDF 文件路径' : '外链 URL'}
          </label>
          <input
            name="contentUrl"
            value={form.contentUrl}
            onChange={handleChange}
            placeholder={form.contentType === 'pdf' ? '/uploads/file.pdf' : 'https://example.com/...'}
            className={inputCls}
          />
        </div>
      )}

      {/* 附加设置 */}
      <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4 space-y-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">附加设置</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>最少阅读时间（秒）</label>
            <input
              type="number"
              name="minReadSeconds"
              value={form.minReadSeconds}
              onChange={handleChange}
              min={0}
              className={inputCls}
            />
            <p className="text-xs text-gray-400 mt-1">0 = 不限制</p>
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

        {/* 必学开关 */}
        <label className="flex items-center gap-3 cursor-pointer group">
          <div
            onClick={() => setForm(f => ({ ...f, isRequired: !f.isRequired }))}
            className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 ${
              form.isRequired ? 'bg-blue-500' : 'bg-gray-300'
            }`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
              form.isRequired ? 'translate-x-5' : 'translate-x-1'
            }`} />
            <input
              type="checkbox"
              name="isRequired"
              checked={form.isRequired}
              onChange={handleChange}
              className="sr-only"
            />
          </div>
          <div>
            <span className="text-sm font-medium text-gray-700">必学章节</span>
            <p className="text-xs text-gray-400">关闭后此章节标记为「选学」</p>
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
          style={{ background: loading ? '#93c5fd' : 'linear-gradient(90deg, #3b82f6, #6366f1)' }}
        >
          {loading ? '保存中…' : isEdit ? '💾 保存修改' : '✅ 创建章节'}
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
