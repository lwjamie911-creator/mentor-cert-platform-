'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MeetingData {
  title: string
  timeText: string
  location: string
  description: string | null
  posterBase64: string | null
  isPublished: boolean
}

export function ClassMeetingManager({ initial }: { initial: MeetingData | null }) {
  const router = useRouter()
  const [title, setTitle] = useState(initial?.title ?? '')
  const [timeText, setTimeText] = useState(initial?.timeText ?? '')
  const [location, setLocation] = useState(initial?.location ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [poster, setPoster] = useState<string | null>(initial?.posterBase64 ?? null)
  const [isPublished, setIsPublished] = useState(initial?.isPublished ?? true)

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

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
    setSaved(false)
    const res = await fetch('/api/admin/class-meeting', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, timeText, location, description, posterBase64: poster, isPublished }),
    })
    setSaving(false)
    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      setError(d.error || '保存失败，请重试')
      return
    }
    setSaved(true)
    router.refresh()
  }

  return (
    <div className="max-w-2xl bg-paper rounded-2xl border border-line shadow-card p-6 space-y-5">
      {saved && (
        <div className="flex items-center gap-2 text-emerald-700 text-sm bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-xl">
          <CheckCircle2 className="w-4 h-4" strokeWidth={2} /> 已保存，新人端班会预告已更新
        </div>
      )}

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

      <Field label="发布状态">
        <label className="flex items-center gap-2 text-sm text-cocoa-600 cursor-pointer">
          <input type="checkbox" checked={isPublished} onChange={e => setIsPublished(e.target.checked)}
            className="w-4 h-4 rounded accent-cocoa-700" />
          发布（新人端可见）；取消勾选则暂时隐藏
        </label>
      </Field>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button onClick={save} disabled={saving}>
        {saving ? '保存中…' : '保存班会预告'}
      </Button>
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
