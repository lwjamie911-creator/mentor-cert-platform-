'use client'

import { useState, useRef } from 'react'
import { CheckCircle, UserCircle2, User, FileText, ClipboardList, Pencil, Camera, AlertCircle } from 'lucide-react'
import type { AccentTheme } from './accent-theme'

interface MentorProfileData {
  yearsOfExperience: string | null
  projectExperience: string | null
  highlights: string | null
  photoBase64: string | null
}

interface Props {
  initialProfile: MentorProfileData | null
  accent: AccentTheme
}

export function MentorProfilePanel({ initialProfile, accent }: Props) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  // 将旧的两个字段合并展示：优先用 projectExperience，拼接 highlights
  function mergeIntro(p: MentorProfileData | null) {
    if (!p) return ''
    const parts = [p.projectExperience, p.highlights].filter(Boolean)
    return parts.join('\n\n')
  }

  const [years, setYears] = useState(initialProfile?.yearsOfExperience ?? '')
  const [intro, setIntro] = useState(mergeIntro(initialProfile))
  const [photo, setPhoto] = useState<string | null>(initialProfile?.photoBase64 ?? null)

  const [draftYears, setDraftYears] = useState(years)
  const [draftIntro, setDraftIntro] = useState(intro)
  const [draftPhoto, setDraftPhoto] = useState<string | null>(photo)

  const fileRef = useRef<HTMLInputElement>(null)

  function startEdit() {
    setDraftYears(years)
    setDraftIntro(intro)
    setDraftPhoto(photo)
    setError('')
    setSaved(false)
    setEditing(true)
  }

  function cancelEdit() {
    setEditing(false)
    setError('')
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      setError('照片不能超过 2MB')
      return
    }
    const reader = new FileReader()
    reader.onload = () => setDraftPhoto(reader.result as string)
    reader.readAsDataURL(file)
  }

  async function save() {
    setSaving(true)
    setError('')
    const res = await fetch('/api/mentor/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        yearsOfExperience: draftYears.trim() || null,
        projectExperience: draftIntro.trim() || null,
        highlights: null,
        photoBase64: draftPhoto,
      }),
    })
    setSaving(false)
    if (!res.ok) {
      const d = await res.json()
      setError(d.error || '保存失败，请重试')
      return
    }
    setYears(draftYears.trim())
    setIntro(draftIntro.trim())
    setPhoto(draftPhoto)
    setEditing(false)
    setSaved(true)
  }

  const hasContent = years || intro || photo

  if (!editing) {
    return (
      <div className="space-y-4">
        {saved && (
          <div className={`flex items-center gap-2 text-sm ${accent.softBg} border ${accent.softBorder} ${accent.text} px-4 py-2.5 rounded-lg animate-fade-in`}>
            <CheckCircle className="w-4 h-4 flex-shrink-0" strokeWidth={2} /> 档案已保存，新人可以查看你的导师档案了！
          </div>
        )}

        {hasContent ? (
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              {photo ? (
                <img
                  src={photo}
                  alt="导师照片"
                  className={`w-20 h-20 rounded-2xl object-cover border-2 ${accent.softBorder} flex-shrink-0`}
                />
              ) : (
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 ${accent.iconChip}`}>
                  <UserCircle2 className="w-9 h-9" strokeWidth={1.5} />
                </div>
              )}
              <div className="flex-1 space-y-2">
                {years && (
                  <div>
                    <p className={`text-xs font-semibold mb-0.5 ${accent.text}`}>职业年限</p>
                    <p className="text-sm text-cocoa-700 leading-relaxed">{years}</p>
                  </div>
                )}
              </div>
            </div>

            {intro && (
              <div className={`${accent.softBg} rounded-lg px-4 py-3 border ${accent.softBorder}`}>
                <p className={`inline-flex items-center gap-1 text-xs font-semibold mb-1 ${accent.text}`}><FileText className="w-3.5 h-3.5" strokeWidth={2} /> 个人介绍</p>
                <p className="text-sm text-cocoa-700 leading-relaxed whitespace-pre-wrap">{intro}</p>
              </div>
            )}

            <button
              onClick={startEdit}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold ${accent.text} border ${accent.softBorder} hover:opacity-80 transition-all active:scale-[0.97]`}
            >
              <Pencil className="w-3.5 h-3.5" strokeWidth={2} /> 编辑档案
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className={`flex items-center gap-4 p-4 ${accent.softBg} rounded-lg border ${accent.softBorder}`}>
              <span className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${accent.iconChip}`}><ClipboardList className="w-6 h-6" strokeWidth={2} /></span>
              <div>
                <p className={`text-sm font-semibold mb-0.5 ${accent.text}`}>尚未填写导师档案</p>
                <p className="text-xs text-cocoa-500 leading-relaxed">
                  给新人介绍一下你的职业年限、过往项目经验和高光成绩吧，帮助新人更好地了解你！
                </p>
              </div>
            </div>
            <button
              onClick={startEdit}
              className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all active:scale-[0.97] hover:-translate-y-0.5 ${accent.btn}`}
            >
              <Pencil className="w-4 h-4" strokeWidth={2} /> 填写我的导师档案
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Photo upload */}
      <div>
        <p className={`text-xs font-semibold mb-2 ${accent.text}`}>个人照片（可选，不超过 2MB）</p>
        <div className="flex items-center gap-4">
          {draftPhoto ? (
            <img
              src={draftPhoto}
              alt="预览"
              className={`w-16 h-16 rounded-2xl object-cover border-2 ${accent.softBorder} flex-shrink-0`}
            />
          ) : (
            <div className={`w-16 h-16 rounded-2xl bg-cocoa-50 border-2 border-dashed ${accent.softBorder} flex items-center justify-center flex-shrink-0 text-cocoa-400`}>
              <User className="w-7 h-7" strokeWidth={1.5} />
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <button
              onClick={() => fileRef.current?.click()}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold ${accent.text} border ${accent.softBorder} hover:opacity-80 transition-all active:scale-[0.97]`}
            >
              <Camera className="w-3.5 h-3.5" strokeWidth={2} /> 上传照片
            </button>
            {draftPhoto && (
              <button
                onClick={() => setDraftPhoto(null)}
                className="px-4 py-2 rounded-lg text-xs text-cocoa-400 hover:text-sienna transition-colors"
              >
                删除照片
              </button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
          />
        </div>
      </div>

      {/* Years */}
      <div>
        <label className={`block text-xs font-semibold mb-1.5 ${accent.text}`}>
          职业年限 <span className="font-normal text-cocoa-400">（如：从事行政工作 6 年）</span>
        </label>
        <input
          value={draftYears}
          onChange={e => setDraftYears(e.target.value)}
          placeholder="例：从事行政/秘书工作 6 年，其中 TEG 秘书中心 3 年"
          className={`w-full px-4 py-2.5 border border-cocoa-300 rounded-lg text-sm bg-cocoa-50/50 text-cocoa-900 focus:outline-none ${accent.inputFocus} focus:ring-2 focus:bg-paper placeholder:text-cocoa-400 transition-all`}
        />
      </div>

      {/* Intro */}
      <div>
        <label className={`block text-xs font-semibold mb-1.5 ${accent.text}`}>
          个人介绍 <span className="font-normal text-cocoa-400">（过往经历、项目经验、高光成绩，随便写）</span>
        </label>
        <textarea
          value={draftIntro}
          onChange={e => setDraftIntro(e.target.value)}
          rows={6}
          placeholder="介绍一下自己吧，比如参与过哪些项目、有什么值得骄傲的成绩……"
          className={`w-full px-4 py-2.5 border border-cocoa-300 rounded-lg text-sm bg-cocoa-50/50 text-cocoa-900 focus:outline-none ${accent.inputFocus} focus:ring-2 focus:bg-paper placeholder:text-cocoa-400 transition-all resize-none leading-relaxed`}
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sienna text-xs bg-blush/60 border border-cocoa-200 px-3 py-2 rounded-lg">
          <AlertCircle className="w-4 h-4 flex-shrink-0" strokeWidth={2} /> {error}
        </div>
      )}

      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={save}
          disabled={saving}
          className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all active:scale-[0.97] hover:-translate-y-0.5 ${accent.btn} disabled:opacity-50`}
        >
          {saving ? '保存中…' : '保存档案'}
        </button>
        <button
          onClick={cancelEdit}
          className="px-4 py-2.5 rounded-lg text-sm text-cocoa-400 hover:text-cocoa-700 hover:bg-cocoa-100 transition-colors"
        >
          取消
        </button>
      </div>
    </div>
  )
}
