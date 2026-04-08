'use client'

import { useState } from 'react'

interface Material {
  id: string
  title: string
  subject: string
  zone: string
  contentType: string
  contentUrl: string | null
  contentText: string | null
  minReadSeconds: number
  orderIndex: number
  isPublished: boolean
  _count?: { progress: number }
}

type FormData = Omit<Material, 'id' | '_count'>

const blank: FormData = {
  title: '', subject: '', zone: 'mentor',
  contentType: 'external_link', contentUrl: '', contentText: '',
  minReadSeconds: 600, orderIndex: 0, isPublished: true,
}

export function MentorCoursesManager({ initialMaterials }: { initialMaterials: Material[] }) {
  const [materials, setMaterials] = useState<Material[]>(initialMaterials)
  const [editing, setEditing] = useState<Material | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<FormData>(blank)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  function openCreate() {
    setForm({ ...blank, orderIndex: materials.length + 1 })
    setCreating(true)
    setEditing(null)
  }

  function openEdit(m: Material) {
    setForm({
      title: m.title, subject: m.subject, zone: m.zone,
      contentType: m.contentType, contentUrl: m.contentUrl ?? '',
      contentText: m.contentText ?? '', minReadSeconds: m.minReadSeconds,
      orderIndex: m.orderIndex, isPublished: m.isPublished,
    })
    setEditing(m)
    setCreating(false)
  }

  function closeForm() {
    setCreating(false)
    setEditing(null)
  }

  async function handleSave() {
    if (!form.title.trim()) return
    setSaving(true)
    try {
      const payload = {
        ...form,
        contentUrl: form.contentUrl?.trim() || null,
        contentText: form.contentText?.trim() || null,
      }
      if (creating) {
        const res = await fetch('/api/admin/materials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const created = await res.json()
        setMaterials(prev => [...prev, { ...created, _count: { progress: 0 } }])
      } else if (editing) {
        const res = await fetch(`/api/admin/materials/${editing.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const updated = await res.json()
        setMaterials(prev => prev.map(m => m.id === editing.id ? { ...updated, _count: m._count } : m))
      }
      closeForm()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('确定删除这门课程？已记录的学习进度也会一并删除。')) return
    setDeleting(id)
    try {
      await fetch(`/api/admin/materials/${id}`, { method: 'DELETE' })
      setMaterials(prev => prev.filter(m => m.id !== id))
    } finally {
      setDeleting(null)
    }
  }

  async function togglePublish(m: Material) {
    const res = await fetch(`/api/admin/materials/${m.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublished: !m.isPublished }),
    })
    const updated = await res.json()
    setMaterials(prev => prev.map(x => x.id === m.id ? { ...updated, _count: x._count } : x))
  }

  const showForm = creating || !!editing
  const sorted = [...materials].sort((a, b) => a.orderIndex - b.orderIndex)

  return (
    <div className="space-y-4">
      {/* 操作栏 */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">共 {materials.length} 门课程</p>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-all"
          style={{ background: 'linear-gradient(90deg,#f59e0b,#fb923c)' }}
        >
          + 新增课程
        </button>
      </div>

      {/* 新增 / 编辑表单 */}
      {showForm && (
        <div className="rounded-2xl border border-amber-100 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between"
            style={{ background: 'linear-gradient(135deg,#fffbeb,#fef3c7)' }}>
            <h3 className="font-bold text-amber-800">{creating ? '新增导师课程' : '编辑课程'}</h3>
            <button onClick={closeForm} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
          </div>
          <div className="px-6 py-5 space-y-4">
            {/* 标题 + 科目 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">课程标题 *</label>
                <input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="例：腾讯新员工导师手册"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">科目标签</label>
                <input
                  value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  placeholder="例：导师必读 / 导师技能"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400"
                />
              </div>
            </div>

            {/* 内容类型 + URL */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">内容类型</label>
              <div className="flex gap-3 mb-3">
                {[
                  { value: 'external_link', label: '🔗 外部链接' },
                  { value: 'pdf',           label: '📄 PDF 文件' },
                  { value: 'text',          label: '📝 内嵌文本' },
                ].map(opt => (
                  <label key={opt.value} className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="contentType"
                      value={opt.value}
                      checked={form.contentType === opt.value}
                      onChange={() => setForm(f => ({ ...f, contentType: opt.value }))}
                      className="accent-amber-500"
                    />
                    <span className="text-sm text-gray-700">{opt.label}</span>
                  </label>
                ))}
              </div>

              {form.contentType !== 'text' && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    {form.contentType === 'pdf' ? 'PDF 路径（/materials/xxx.pdf）' : '外部链接 URL'}
                  </label>
                  <input
                    value={form.contentUrl ?? ''}
                    onChange={e => setForm(f => ({ ...f, contentUrl: e.target.value }))}
                    placeholder={form.contentType === 'pdf' ? '/materials/filename.pdf' : 'https://...'}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 font-mono"
                  />
                </div>
              )}

              {form.contentType === 'text' && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">正文内容（Markdown）</label>
                  <textarea
                    value={form.contentText ?? ''}
                    onChange={e => setForm(f => ({ ...f, contentText: e.target.value }))}
                    rows={8}
                    placeholder="支持 Markdown 格式：**粗体**、# 标题、- 列表……"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 font-mono leading-relaxed resize-y"
                  />
                </div>
              )}
            </div>

            {/* 最短阅读时间 + 排序 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">最短阅读时间（秒）</label>
                <input
                  type="number"
                  min={0}
                  value={form.minReadSeconds}
                  onChange={e => setForm(f => ({ ...f, minReadSeconds: Number(e.target.value) }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
                <p className="text-xs text-gray-400 mt-0.5">0 = 无限制</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">排序（数字越小越靠前）</label>
                <input
                  type="number"
                  value={form.orderIndex}
                  onChange={e => setForm(f => ({ ...f, orderIndex: Number(e.target.value) }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
              </div>
            </div>

            {/* 发布状态 + 操作按钮 */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div
                  onClick={() => setForm(f => ({ ...f, isPublished: !f.isPublished }))}
                  className={`relative w-10 h-6 rounded-full transition-colors cursor-pointer ${form.isPublished ? 'bg-green-400' : 'bg-gray-200'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.isPublished ? 'left-5' : 'left-1'}`} />
                </div>
                <span className="text-sm text-gray-600">{form.isPublished ? '已发布（学员可见）' : '草稿（学员不可见）'}</span>
              </label>
              <div className="flex items-center gap-2">
                <button onClick={closeForm} className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">取消</button>
                <button
                  onClick={handleSave}
                  disabled={saving || !form.title.trim()}
                  className="px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50 hover:opacity-90 transition-all shadow-sm"
                  style={{ background: 'linear-gradient(90deg,#f59e0b,#fb923c)' }}
                >
                  {saving ? '保存中…' : '保存'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 课程列表 */}
      {sorted.length === 0 ? (
        <div className="text-center py-16 text-gray-300 bg-white rounded-2xl border border-gray-100">
          <div className="text-4xl mb-3">📚</div>
          <p className="text-sm">暂无导师课程，点击右上角新增</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((m, i) => {
            const minMin = m.minReadSeconds > 0 ? Math.ceil(m.minReadSeconds / 60) : null
            return (
              <div key={m.id}
                className="bg-white rounded-xl border border-gray-100 px-5 py-4 flex items-start gap-4 hover:border-amber-200 transition-colors group">
                {/* 序号 */}
                <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-400 font-bold text-sm flex-shrink-0 mt-0.5">
                  {i + 1}
                </div>

                {/* 主体 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-sm font-semibold text-gray-800">{m.title}</p>
                    {!m.isPublished && (
                      <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">草稿</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap text-xs text-gray-400">
                    {m.subject && <span className="bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-medium">{m.subject}</span>}
                    <span className={`px-2 py-0.5 rounded-full ${
                      m.contentType === 'pdf' ? 'bg-red-50 text-red-500' :
                      m.contentType === 'external_link' ? 'bg-blue-50 text-blue-500' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {m.contentType === 'pdf' ? '📄 PDF' : m.contentType === 'external_link' ? '🔗 外链' : '📝 文本'}
                    </span>
                    {minMin && <span>约 {minMin} 分钟</span>}
                    {m._count && <span>{m._count.progress} 人已完成</span>}
                    {m.contentUrl && (
                      <a href={m.contentUrl} target="_blank" rel="noopener noreferrer"
                        className="text-blue-400 hover:underline truncate max-w-[200px]">
                        {m.contentUrl}
                      </a>
                    )}
                  </div>
                </div>

                {/* 操作 */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button
                    onClick={() => togglePublish(m)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      m.isPublished ? 'text-gray-500 hover:bg-gray-100' : 'text-green-600 hover:bg-green-50'
                    }`}
                  >
                    {m.isPublished ? '下架' : '发布'}
                  </button>
                  <button
                    onClick={() => openEdit(m)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-amber-600 hover:bg-amber-50 transition-colors"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => handleDelete(m.id)}
                    disabled={deleting === m.id}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    {deleting === m.id ? '…' : '删除'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
