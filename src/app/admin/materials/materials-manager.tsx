'use client'

import { useState } from 'react'

interface Material {
  id: string
  title: string
  subject: string
  zone: string
  contentType: string
  contentText: string | null
  contentUrl: string | null
  minReadSeconds: number
  orderIndex: number
  isPublished: boolean
  _count?: { progress: number }
}

const ZONE_LABELS: Record<string, { label: string; color: string }> = {
  mentor: { label: '导师专区', color: 'bg-amber-100 text-amber-700' },
  newbie: { label: '新人专区', color: 'bg-blue-100 text-blue-700' },
  both:   { label: '共用',     color: 'bg-purple-100 text-purple-700' },
}

export function MaterialsManager({ initialMaterials }: { initialMaterials: Material[] }) {
  const [materials, setMaterials] = useState<Material[]>(initialMaterials)
  const [editing, setEditing]     = useState<Material | null>(null)
  const [creating, setCreating]   = useState(false)
  const [saving, setSaving]       = useState(false)
  const [deleting, setDeleting]   = useState<string | null>(null)

  // blank form
  const blank: Omit<Material, 'id' | '_count'> = {
    title: '', subject: '', zone: 'mentor', contentType: 'text',
    contentText: '', contentUrl: '', minReadSeconds: 0,
    orderIndex: (materials.length) * 10, isPublished: true,
  }
  const [form, setForm] = useState<typeof blank>(blank)

  function openCreate() {
    setForm({ ...blank, orderIndex: materials.length * 10 })
    setCreating(true)
    setEditing(null)
  }

  function openEdit(m: Material) {
    setForm({
      title: m.title, subject: m.subject, zone: m.zone,
      contentType: m.contentType ?? 'text',
      contentText: m.contentText ?? '',
      contentUrl: m.contentUrl ?? '',
      minReadSeconds: m.minReadSeconds, orderIndex: m.orderIndex,
      isPublished: m.isPublished,
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
      if (creating) {
        const res = await fetch('/api/admin/materials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        const created = await res.json()
        setMaterials(prev => [...prev, { ...created, _count: { progress: 0 } }])
      } else if (editing) {
        const res = await fetch(`/api/admin/materials/${editing.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
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
    if (!confirm('确定删除这篇资料？已记录的学习进度也会一并删除。')) return
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

  return (
    <div className="space-y-4">
      {/* 操作栏 */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">共 {materials.length} 篇资料</p>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-all"
          style={{ background: 'linear-gradient(90deg,#6366f1,#8b5cf6)' }}
        >
          + 新增资料
        </button>
      </div>

      {/* 新增 / 编辑表单 */}
      {showForm && (
        <div className="rounded-2xl border border-indigo-100 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between"
            style={{ background: 'linear-gradient(135deg,#eef2ff,#f5f3ff)' }}>
            <h3 className="font-bold text-indigo-800">{creating ? '新增学习文档' : '编辑文档'}</h3>
            <button onClick={closeForm} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
          </div>
          <div className="px-6 py-5 space-y-4">
            {/* 标题 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">文档标题 *</label>
                <input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="例：导师职责与沟通规范"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">科目标签</label>
                <input
                  value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  placeholder="例：职责规范 / 安全规定"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
                />
              </div>
            </div>

            {/* 适用区域 + 最短阅读时间 + 排序 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">适用区域 *</label>
                <select
                  value={form.zone}
                  onChange={e => setForm(f => ({ ...f, zone: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
                >
                  <option value="mentor">导师专区</option>
                  <option value="newbie">新人专区</option>
                  <option value="both">共用（两者皆显示）</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">最短阅读时间（秒）</label>
                <input
                  type="number"
                  min={0}
                  value={form.minReadSeconds}
                  onChange={e => setForm(f => ({ ...f, minReadSeconds: Number(e.target.value) }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
                <p className="text-xs text-gray-400 mt-0.5">0 = 无限制，可直接标记已读</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">排序权重</label>
                <input
                  type="number"
                  value={form.orderIndex}
                  onChange={e => setForm(f => ({ ...f, orderIndex: Number(e.target.value) }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
                <p className="text-xs text-gray-400 mt-0.5">数字越小越靠前</p>
              </div>
            </div>

            {/* 内容类型 */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">内容类型 *</label>
              <div className="flex gap-2">
                {[
                  { value: 'text', label: '📝 Markdown 正文' },
                  { value: 'external_link', label: '🔗 外部链接' },
                  { value: 'pdf', label: '📄 PDF 链接' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, contentType: opt.value }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      form.contentType === opt.value
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 链接地址（外链/PDF 时显示） */}
            {(form.contentType === 'external_link' || form.contentType === 'pdf') && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  {form.contentType === 'pdf' ? 'PDF 地址 *' : '外链地址 *'}
                </label>
                <input
                  value={form.contentUrl ?? ''}
                  onChange={e => setForm(f => ({ ...f, contentUrl: e.target.value }))}
                  placeholder={form.contentType === 'pdf' ? 'https://example.com/file.pdf' : 'https://docs.example.com/...'}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 font-mono"
                />
                <p className="text-xs text-gray-400 mt-0.5">用户点击后将在新标签页打开此地址</p>
              </div>
            )}

            {/* 内容 (Markdown) — 仅 text 类型显示 */}
            {form.contentType === 'text' && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">正文内容（Markdown）</label>
                <textarea
                  value={form.contentText ?? ''}
                  onChange={e => setForm(f => ({ ...f, contentText: e.target.value }))}
                  rows={10}
                  placeholder="支持 Markdown 格式：**粗体**、# 标题、- 列表、> 引用……"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 font-mono leading-relaxed resize-y"
                />
              </div>
            )}

            {/* 发布状态 + 保存 */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div
                  onClick={() => setForm(f => ({ ...f, isPublished: !f.isPublished }))}
                  className={`relative w-10 h-6 rounded-full transition-colors cursor-pointer ${form.isPublished ? 'bg-green-400' : 'bg-gray-200'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.isPublished ? 'left-5' : 'left-1'}`} />
                </div>
                <span className="text-sm text-gray-600">{form.isPublished ? '已发布' : '草稿（不显示给学员）'}</span>
              </label>
              <div className="flex items-center gap-2">
                <button onClick={closeForm} className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">取消</button>
                <button
                  onClick={handleSave}
                  disabled={saving || !form.title.trim()}
                  className="px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50 hover:opacity-90 transition-all shadow-sm"
                  style={{ background: 'linear-gradient(90deg,#6366f1,#8b5cf6)' }}
                >
                  {saving ? '保存中…' : '保存'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 资料列表 */}
      {materials.length === 0 ? (
        <div className="text-center py-16 text-gray-300 bg-white rounded-2xl border border-gray-100">
          <div className="text-4xl mb-3">📄</div>
          <p className="text-sm">暂无学习文档，点击右上角新增</p>
        </div>
      ) : (
        <div className="space-y-2">
          {materials
            .sort((a, b) => a.orderIndex - b.orderIndex)
            .map(m => {
              const zone = ZONE_LABELS[m.zone] ?? { label: m.zone, color: 'bg-gray-100 text-gray-600' }
              const minMin = m.minReadSeconds > 0 ? Math.ceil(m.minReadSeconds / 60) : null
              return (
                <div key={m.id}
                  className="bg-white rounded-xl border border-gray-100 px-5 py-4 flex items-start gap-4 hover:border-indigo-100 transition-colors group">
                  {/* 排序号 */}
                  <div className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-xs text-gray-400 font-mono flex-shrink-0 mt-0.5">
                    {m.orderIndex}
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
                      <span className={`px-2 py-0.5 rounded-full font-medium ${zone.color}`}>{zone.label}</span>
                      {m.subject && <span className="bg-gray-100 px-2 py-0.5 rounded-full">{m.subject}</span>}
                      {m.contentType === 'external_link' && (
                        <span className="bg-blue-50 text-blue-500 px-2 py-0.5 rounded-full">🔗 外链</span>
                      )}
                      {m.contentType === 'pdf' && (
                        <span className="bg-orange-50 text-orange-500 px-2 py-0.5 rounded-full">📄 PDF</span>
                      )}
                      {m.contentUrl && (
                        <a href={m.contentUrl} target="_blank" rel="noopener noreferrer"
                          className="text-indigo-400 hover:text-indigo-600 underline truncate max-w-[200px]"
                          title={m.contentUrl}
                        >{m.contentUrl}</a>
                      )}
                      {minMin && <span>约 {minMin} 分钟</span>}
                      {m._count && <span>{m._count.progress} 人已读</span>}
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
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
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
