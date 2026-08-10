'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Megaphone, Clock, MapPin, Lightbulb, MessageCircle, Sun, BookOpen, Bird, Plus, X, CheckCircle2, Save } from 'lucide-react'

// ─────────────────────────────────────────────
// 共享类型
// ─────────────────────────────────────────────
export interface ReviewData {
  text: string
  photos: string[]
}

export interface ClassMeetingData {
  title: string
  timeText: string
  location: string
  description: string | null
  posterBase64: string | null
}

const MAX_REVIEW_PHOTOS = 9
const REVIEW_TITLE = 'TEG秘书中心主题班会感言'

// ─────────────────────────────────────────────
// 通用外壳（新人/导师两端共用；主题色可切换）
// ─────────────────────────────────────────────
export function SectionShell({
  title, icon, subtitle, children,
}: {
  title: string
  icon: React.ReactNode
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <section className="bg-paper rounded-2xl border border-line shadow-card overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-line/70">
        <span className="w-9 h-9 rounded-lg bg-blush/60 flex items-center justify-center text-sienna flex-shrink-0">{icon}</span>
        <div>
          <h2 className="font-display font-semibold text-cocoa-900 text-[15px]">{title}</h2>
          {subtitle && <p className="text-xs text-cocoa-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="px-5 sm:px-6 py-5">{children}</div>
    </section>
  )
}

// ─────────────────────────────────────────────
// 班会预告展示（只读，数据来自管理员后台）
// ─────────────────────────────────────────────
export function ClassMeetingCard({ classMeeting }: { classMeeting: ClassMeetingData | null }) {
  if (!classMeeting) {
    return (
      <SectionShell title="班会预告" icon={<Megaphone className="w-4 h-4" strokeWidth={2} />}>
        <div className="flex flex-col items-center justify-center py-10 gap-2 text-cocoa-400">
          <Megaphone className="w-8 h-8" strokeWidth={1.5} />
          <p className="text-sm">暂无班会预告，敬请期待～</p>
        </div>
      </SectionShell>
    )
  }
  return (
    <SectionShell title="班会预告" icon={<Megaphone className="w-4 h-4" strokeWidth={2} />}>
      <div className="space-y-4">
        {classMeeting.posterBase64 && (
          <img
            src={classMeeting.posterBase64}
            alt="班会海报"
            className="w-full max-w-md mx-auto rounded-2xl border border-line shadow-card"
          />
        )}
        <div className="space-y-2">
          <h3 className="text-base font-display font-bold text-cocoa-900">{classMeeting.title}</h3>
          <div className="flex items-start gap-2 text-sm text-cocoa-700">
            <Clock className="w-4 h-4 text-sienna flex-shrink-0 mt-0.5" strokeWidth={2} /><span>{classMeeting.timeText}</span>
          </div>
          <div className="flex items-start gap-2 text-sm text-cocoa-700">
            <MapPin className="w-4 h-4 text-sienna flex-shrink-0 mt-0.5" strokeWidth={2} /><span>{classMeeting.location}</span>
          </div>
          {classMeeting.description && (
            <div className="flex items-start gap-2 text-sm text-cocoa-600 bg-blush/40 rounded-2xl px-4 py-3 mt-2">
              <Lightbulb className="w-4 h-4 text-sienna flex-shrink-0 mt-0.5" strokeWidth={2} />
              <span className="leading-relaxed whitespace-pre-wrap">{classMeeting.description}</span>
            </div>
          )}
        </div>
      </div>
    </SectionShell>
  )
}

// ─────────────────────────────────────────────
// 感言编辑（自己写；新人和导师都用这个，写入各自 userId 那条 NewbieReview）
// ─────────────────────────────────────────────
export function ReviewSharing({
  initial,
  role = 'newbie',
}: {
  initial: ReviewData
  role?: 'newbie' | 'mentor'
}) {
  const router = useRouter()
  const [text, setText] = useState(initial.text)
  const [photos, setPhotos] = useState<string[]>(initial.photos)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const subtitle = role === 'mentor'
    ? '记录你与新人一路同行的带教感悟，分享给你的新人～'
    : '从入职懵懂到克服困难成长，写下你这一路培养期的心得体会，畅所欲言'
  const hint = role === 'mentor'
    ? '建议在参加夏日主题班会、与新人一起重温成长历程之后，再来这里记录你的分享～'
    : '建议在参加夏日主题班会、与导师一起重温成长历程之后，再来这里记录你的分享～'
  const placeholder = role === 'mentor'
    ? '在这里写下你的带教感悟与寄语……'
    : '在这里写下你的成长故事与心得体会……'

  function handleAddPhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    if (photos.length + files.length > MAX_REVIEW_PHOTOS) {
      setError(`最多上传 ${MAX_REVIEW_PHOTOS} 张照片`)
      return
    }
    for (const file of files) {
      if (file.size > 2 * 1024 * 1024) {
        setError(`「${file.name}」超过 2MB，已跳过`)
        continue
      }
      const reader = new FileReader()
      reader.onload = () => {
        setPhotos(prev => prev.length < MAX_REVIEW_PHOTOS ? [...prev, reader.result as string] : prev)
      }
      reader.readAsDataURL(file)
    }
    setError('')
    if (fileRef.current) fileRef.current.value = ''
  }

  function removePhoto(idx: number) {
    setPhotos(prev => prev.filter((_, i) => i !== idx))
  }

  async function save() {
    setSaving(true)
    setError('')
    setSaved(false)
    const res = await fetch('/api/newbie/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, photos }),
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
    <SectionShell title={REVIEW_TITLE} icon={<MessageCircle className="w-4 h-4" strokeWidth={2} />} subtitle={subtitle}>
      <div className="space-y-4">
        {/* 软提示 */}
        <div className="flex items-start gap-2 text-xs text-sienna bg-blush/50 rounded-2xl px-4 py-2.5">
          <Sun className="w-4 h-4 text-sienna flex-shrink-0 mt-px" strokeWidth={2} />
          <span>{hint}</span>
        </div>

        {/* 文本域 */}
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          rows={8}
          placeholder={placeholder}
          className="w-full px-4 py-3 border border-line rounded-lg text-sm leading-relaxed text-cocoa-900 placeholder:text-cocoa-400 bg-fog focus:outline-none focus:border-sienna/50 focus:ring-2 focus:ring-blush/50 focus:bg-paper transition-all resize-y"
        />

        {/* 照片九宫格 */}
        <div>
          <p className="text-xs text-cocoa-500 mb-2">配图（最多 {MAX_REVIEW_PHOTOS} 张，每张 ≤2MB）</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {photos.map((p, i) => (
              <div key={i} className="relative group aspect-square">
                <img src={p} alt={`感言配图 ${i + 1}`} className="w-full h-full object-cover rounded-lg border border-line" />
                <button
                  onClick={() => removePhoto(i)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-cocoa-900/60 text-paper flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  title="删除"
                ><X className="w-3 h-3" strokeWidth={2.5} /></button>
              </div>
            ))}
            {photos.length < MAX_REVIEW_PHOTOS && (
              <button
                onClick={() => fileRef.current?.click()}
                className="aspect-square rounded-lg border-2 border-dashed border-cocoa-300 flex flex-col items-center justify-center text-cocoa-400 hover:border-sienna/50 hover:text-sienna transition-colors"
              >
                <Plus className="w-6 h-6" strokeWidth={2} />
                <span className="text-[10px] mt-1">添加照片</span>
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleAddPhotos} className="hidden" />
        </div>

        {error && <p className="text-xs text-sienna">{error}</p>}
        {saved && (
          <p className="text-xs text-emerald-700 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} /> 已保存你的班会感言
          </p>
        )}

        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium text-paper bg-sienna hover:brightness-110 hover:-translate-y-0.5 hover:shadow-subtle transition-all active:scale-[0.97] disabled:opacity-60"
        >
          <Save className="w-4 h-4" strokeWidth={2} />
          {saving ? '保存中…' : '保存感言'}
        </button>
      </div>
    </SectionShell>
  )
}

// ─────────────────────────────────────────────
// 只读查看对方的感言（新人看导师 / 导师看新人）
// ─────────────────────────────────────────────
export function PeerReviewView({
  authorName,
  review,
  emptyHint,
}: {
  authorName: string
  review: ReviewData | null
  emptyHint: string
}) {
  const hasContent = review && (review.text?.trim() || review.photos.length > 0)
  return (
    <SectionShell title={`${authorName} 的班会感言`} icon={<BookOpen className="w-4 h-4" strokeWidth={2} />}>
      {!hasContent ? (
        <div className="flex flex-col items-center justify-center py-8 gap-2 text-cocoa-400">
          <Bird className="w-8 h-8" strokeWidth={1.5} />
          <p className="text-sm">{emptyHint}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {review!.text?.trim() && (
            <p className="text-sm text-cocoa-700 leading-relaxed whitespace-pre-wrap bg-blush/40 rounded-2xl px-4 py-3">
              {review!.text}
            </p>
          )}
          {review!.photos.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {review!.photos.map((p, i) => (
                <a key={i} href={p} target="_blank" rel="noopener noreferrer" className="aspect-square">
                  <img src={p} alt={`配图 ${i + 1}`} className="w-full h-full object-cover rounded-lg border border-line hover:opacity-90 transition-opacity" />
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </SectionShell>
  )
}
