'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, Plus, Megaphone, Clock, MapPin, MessageSquare, Trash2, Pencil, Radio } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface MeetingItem {
  id: string
  title: string
  timeText: string
  location: string
  description: string | null
  posterBase64: string | null
  isPublished: boolean
  reviewCount: number
}

// 空白新建表单的初始值
const EMPTY: Omit<MeetingItem, 'reviewCount'> = {
  id: '', title: '', timeText: '', location: '', description: '', posterBase64: null, isPublished: false,
}

export function ClassMeetingManager({ meetings }: { meetings: MeetingItem[] }) {
  const router = useRouter()
  // 当前正在编辑的班会（null = 未打开编辑器）
  const [editing, setEditing] = useState<Omit<MeetingItem, 'reviewCount'> | null>(null)

  return (
    <div className="space-y-5">
      {/* 顶部操作 */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-cocoa-500">共 {meetings.length} 期班会</p>
        <Button onClick={() => setEditing({ ...EMPTY })}>
          <Plus className="w-4 h-4 mr-1" strokeWidth={2} /> 新建班会
        </Button>
      </div>

      {/* 班会列表 */}
      {meetings.length === 0 ? (
        <div className="bg-paper rounded-2xl border border-line shadow-card p-10 flex flex-col items-center gap-2 text-cocoa-400">
          <Megaphone className="w-8 h-8" strokeWidth={1.5} />
          <p className="text-sm">还没有班会，点「新建班会」创建第一期～</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {meetings.map(m => (
            <MeetingRow key={m.id} meeting={m} onEdit={() => setEditing({ ...m })} onChanged={() => router.refresh()} />
          ))}
        </div>
      )}

      {/* 编辑 / 新建弹层 */}
      {editing && (
        <MeetingEditor
          initial={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); router.refresh() }}
        />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// 列表行
// ─────────────────────────────────────────────
function MeetingRow({ meeting, onEdit, onChanged }: { meeting: MeetingItem; onEdit: () => void; onChanged: () => void }) {
  const [busy, setBusy] = useState(false)

  async function publish() {
    setBusy(true)
    await fetch('/api/admin/class-meeting', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...meeting, isPublished: true }),
    })
    setBusy(false)
    onChanged()
  }

  async function remove() {
    if (!confirm(`确定删除「${meeting.title}」？该期的 ${meeting.reviewCount} 条班会感言也会一并删除，无法恢复。`)) return
    setBusy(true)
    await fetch(`/api/admin/class-meeting?id=${meeting.id}`, { method: 'DELETE' })
    setBusy(false)
    onChanged()
  }

  return (
    <div className={`bg-paper rounded-2xl border shadow-card p-4 flex items-start gap-4 ${meeting.isPublished ? 'border-sienna/50 ring-1 ring-sienna/20' : 'border-line'}`}>
      {meeting.posterBase64 ? (
        <img src={meeting.posterBase64} alt="海报" className="w-16 h-22 object-cover rounded-lg border border-line flex-shrink-0" />
      ) : (
        <div className="w-16 h-22 rounded-lg bg-cocoa-50 border border-line flex items-center justify-center text-cocoa-300 flex-shrink-0">
          <Megaphone className="w-5 h-5" strokeWidth={1.5} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-display font-semibold text-cocoa-900 text-sm truncate">{meeting.title}</h3>
          {meeting.isPublished && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-sienna bg-blush/60 px-2 py-0.5 rounded-full flex-shrink-0">
              <Radio className="w-3 h-3" strokeWidth={2.5} /> 当前上架
            </span>
          )}
        </div>
        <div className="mt-1.5 space-y-1 text-xs text-cocoa-500">
          <p className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" strokeWidth={2} />{meeting.timeText}</p>
          <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" strokeWidth={2} />{meeting.location}</p>
        </div>
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          {!meeting.isPublished && (
            <button onClick={publish} disabled={busy}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-sienna border border-sienna/40 rounded-lg hover:bg-blush/40 transition-colors disabled:opacity-50">
              <Radio className="w-3.5 h-3.5" strokeWidth={2} /> 设为上架
            </button>
          )}
          <button onClick={onEdit} disabled={busy}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-cocoa-700 border border-cocoa-300 rounded-lg hover:bg-cocoa-50 transition-colors disabled:opacity-50">
            <Pencil className="w-3.5 h-3.5" strokeWidth={2} /> 编辑
          </button>
          <Link href={`/admin/class-meeting/${meeting.id}/feedback`}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-cocoa-700 border border-cocoa-300 rounded-lg hover:bg-cocoa-50 transition-colors">
            <MessageSquare className="w-3.5 h-3.5" strokeWidth={2} /> 查看反馈（{meeting.reviewCount}）
          </Link>
          <button onClick={remove} disabled={busy}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-red-500 border border-red-100 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50">
            <Trash2 className="w-3.5 h-3.5" strokeWidth={2} /> 删除
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// 编辑 / 新建表单
// ─────────────────────────────────────────────
function MeetingEditor({
  initial, onClose, onSaved,
}: {
  initial: Omit<MeetingItem, 'reviewCount'>
  onClose: () => void
  onSaved: () => void
}) {
  const [title, setTitle] = useState(initial.title)
  const [timeText, setTimeText] = useState(initial.timeText)
  const [location, setLocation] = useState(initial.location)
  const [description, setDescription] = useState(initial.description ?? '')
  const [poster, setPoster] = useState<string | null>(initial.posterBase64)
  const [isPublished, setIsPublished] = useState(initial.isPublished)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const isNew = !initial.id

  function handlePoster(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 3 * 1024 * 1024) {
      setError('海报图不能超过 3MB（建议先压缩尺寸）')
      return
    }
    const reader = new FileReader()
    reader.onload = () => { setPoster(reader.result as string); setError('') }
    reader.readAsDataURL(file)
  }

  async function save() {
    if (!title.trim() || !timeText.trim() || !location.trim()) {
      setError('标题、时间、地点为必填项')
      return
    }
    setSaving(true)
    setError('')
    const res = await fetch('/api/admin/class-meeting', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: initial.id || undefined, title, timeText, location, description, posterBase64: poster, isPublished }),
    })
    setSaving(false)
    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      setError(d.error || '保存失败，请重试')
      return
    }
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-cocoa-900/40 p-4 py-10" onClick={onClose}>
      <div className="max-w-2xl w-full bg-paper rounded-2xl border border-line shadow-card p-6 space-y-5" onClick={e => e.stopPropagation()}>
        <h2 className="font-display text-lg text-cocoa-900">{isNew ? '新建班会' : '编辑班会'}</h2>

        <Field label="班会标题 *">
          <input value={title} onChange={e => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-cocoa-300 rounded-lg text-sm text-cocoa-900 placeholder:text-cocoa-400 focus:outline-none focus:ring-2 focus:ring-cocoa-600/15 focus:border-cocoa-600 transition-all"
            placeholder="如：【盛夏有约，未来可期】2026 秘书中心亦师亦友夏日班会" />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="时间 *">
            <input value={timeText} onChange={e => setTimeText(e.target.value)}
              className="w-full px-3 py-2 border border-cocoa-300 rounded-lg text-sm text-cocoa-900 placeholder:text-cocoa-400 focus:outline-none focus:ring-2 focus:ring-cocoa-600/15 focus:border-cocoa-600 transition-all"
              placeholder="8月18日（周二）10:15-12:00" />
          </Field>
          <Field label="地点 *">
            <input value={location} onChange={e => setLocation(e.target.value)}
              className="w-full px-3 py-2 border border-cocoa-300 rounded-lg text-sm text-cocoa-900 placeholder:text-cocoa-400 focus:outline-none focus:ring-2 focus:ring-cocoa-600/15 focus:border-cocoa-600 transition-all"
              placeholder="云海大厦4栋1216培训室" />
          </Field>
        </div>

        <Field label="文案说明">
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
            className="w-full px-3 py-2 border border-cocoa-300 rounded-lg text-sm text-cocoa-900 placeholder:text-cocoa-400 focus:outline-none focus:ring-2 focus:ring-cocoa-600/15 focus:border-cocoa-600 resize-y transition-all"
            placeholder="请关注企业微信日程通知，并期待班会后你的记录分享哦" />
        </Field>

        <Field label="海报图">
          <div className="flex items-start gap-4">
            {poster ? (
              <img src={poster} alt="海报" className="w-32 rounded-lg border border-cocoa-200" />
            ) : (
              <div className="w-32 h-44 rounded-lg border-2 border-dashed border-cocoa-300 flex items-center justify-center text-cocoa-400 text-xs">无海报</div>
            )}
            <div className="flex flex-col gap-2">
              <button type="button" onClick={() => fileRef.current?.click()}
                className="px-4 py-2 text-sm text-cocoa-700 border border-cocoa-300 rounded-lg hover:bg-cocoa-50 hover:border-cocoa-500 transition-all active:scale-[0.97]">
                {poster ? '更换海报' : '上传海报'}
              </button>
              {poster && (
                <button type="button" onClick={() => setPoster(null)}
                  className="px-4 py-2 text-sm text-red-500 border border-red-100 rounded-lg hover:bg-red-50 transition-colors">
                  移除海报
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" onChange={handlePoster} className="hidden" />
              <p className="text-xs text-cocoa-400">建议 3MB 以内</p>
            </div>
          </div>
        </Field>

        <Field label="上架状态">
          <label className="flex items-center gap-2 text-sm text-cocoa-600 cursor-pointer">
            <input type="checkbox" checked={isPublished} onChange={e => setIsPublished(e.target.checked)}
              className="w-4 h-4 rounded accent-cocoa-700" />
            设为当前上架期（导师/新人端只显示上架期，勾选后会自动把其它期下架）
          </label>
        </Field>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex items-center gap-3">
          <Button onClick={save} disabled={saving}>
            {saving ? '保存中…' : (isNew ? '创建班会' : '保存修改')}
          </Button>
          <button onClick={onClose} className="px-4 py-2 text-sm text-cocoa-600 hover:text-cocoa-900 transition-colors">取消</button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-cocoa-700 mb-1.5">{label}</label>
      {children}
    </div>
  )
}
