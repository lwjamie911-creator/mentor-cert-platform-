'use client'

import { useState, useRef } from 'react'

interface MentorProfileData {
  yearsOfExperience: string | null
  projectExperience: string | null
  highlights: string | null
  photoBase64: string | null
}

interface Props {
  initialProfile: MentorProfileData | null
}

export function MentorProfilePanel({ initialProfile }: Props) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const [years, setYears] = useState(initialProfile?.yearsOfExperience ?? '')
  const [projects, setProjects] = useState(initialProfile?.projectExperience ?? '')
  const [highlights, setHighlights] = useState(initialProfile?.highlights ?? '')
  const [photo, setPhoto] = useState<string | null>(initialProfile?.photoBase64 ?? null)

  // Local edit drafts
  const [draftYears, setDraftYears] = useState(years)
  const [draftProjects, setDraftProjects] = useState(projects)
  const [draftHighlights, setDraftHighlights] = useState(highlights)
  const [draftPhoto, setDraftPhoto] = useState<string | null>(photo)

  const fileRef = useRef<HTMLInputElement>(null)

  function startEdit() {
    setDraftYears(years)
    setDraftProjects(projects)
    setDraftHighlights(highlights)
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
        projectExperience: draftProjects.trim() || null,
        highlights: draftHighlights.trim() || null,
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
    setProjects(draftProjects.trim())
    setHighlights(draftHighlights.trim())
    setPhoto(draftPhoto)
    setEditing(false)
    setSaved(true)
  }

  const hasContent = years || projects || highlights || photo

  if (!editing) {
    return (
      <div className="space-y-4">
        {saved && (
          <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 border border-green-200 px-4 py-2.5 rounded-xl">
            <span>✅</span> 档案已保存，新人可以查看你的导师档案了！
          </div>
        )}

        {hasContent ? (
          <div className="space-y-4">
            {/* Photo + basic info */}
            <div className="flex items-start gap-4">
              {photo ? (
                <img
                  src={photo}
                  alt="导师照片"
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-amber-200 flex-shrink-0"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl">👨‍💼</span>
                </div>
              )}
              <div className="flex-1 space-y-2">
                {years && (
                  <div>
                    <p className="text-xs font-semibold text-amber-600 mb-0.5">职业年限</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{years}</p>
                  </div>
                )}
              </div>
            </div>

            {projects && (
              <div className="bg-amber-50/60 rounded-xl px-4 py-3 border border-amber-100">
                <p className="text-xs font-semibold text-amber-600 mb-1">📂 过往项目经验</p>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{projects}</p>
              </div>
            )}

            {highlights && (
              <div className="bg-orange-50/60 rounded-xl px-4 py-3 border border-orange-100">
                <p className="text-xs font-semibold text-orange-600 mb-1">🏆 高光成绩</p>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{highlights}</p>
              </div>
            )}

            <button
              onClick={startEdit}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-amber-700 border border-amber-300 hover:bg-amber-50 transition-colors"
            >
              ✏️ 编辑档案
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-amber-50/50 rounded-xl border border-amber-100">
              <span className="text-3xl flex-shrink-0">📋</span>
              <div>
                <p className="text-sm font-semibold text-amber-800 mb-0.5">尚未填写导师档案</p>
                <p className="text-xs text-amber-600 leading-relaxed">
                  给新人介绍一下你的职业年限、过往项目经验和高光成绩吧，帮助新人更好地了解你！
                </p>
              </div>
            </div>
            <button
              onClick={startEdit}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(90deg,#f59e0b,#fb923c)' }}
            >
              ✏️ 填写我的导师档案
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
        <p className="text-xs font-semibold text-gray-500 mb-2">个人照片（可选，不超过 2MB）</p>
        <div className="flex items-center gap-4">
          {draftPhoto ? (
            <img
              src={draftPhoto}
              alt="预览"
              className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-200 flex-shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border-2 border-dashed border-amber-200 flex items-center justify-center flex-shrink-0 text-2xl">
              👤
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <button
              onClick={() => fileRef.current?.click()}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-amber-700 border border-amber-300 hover:bg-amber-50 transition-colors"
            >
              📷 上传照片
            </button>
            {draftPhoto && (
              <button
                onClick={() => setDraftPhoto(null)}
                className="px-4 py-2 rounded-xl text-xs text-gray-400 hover:text-red-400 transition-colors"
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
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">
          职业年限 <span className="font-normal text-gray-400">（如：5年，在 xx 领域工作 xx 年）</span>
        </label>
        <input
          value={draftYears}
          onChange={e => setDraftYears(e.target.value)}
          placeholder="例：从事行政/秘书工作 6 年，其中 TEG 秘书中心 3 年"
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 placeholder:text-gray-300 transition-all"
        />
      </div>

      {/* Project experience */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">
          过往项目经验
        </label>
        <textarea
          value={draftProjects}
          onChange={e => setDraftProjects(e.target.value)}
          rows={4}
          placeholder="介绍你参与或主导过的项目，包括项目背景、你的角色和贡献……"
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 placeholder:text-gray-300 transition-all resize-none leading-relaxed"
        />
      </div>

      {/* Highlights */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">
          高光成绩 <span className="font-normal text-gray-400">（奖项、荣誉、代表性成果）</span>
        </label>
        <textarea
          value={draftHighlights}
          onChange={e => setDraftHighlights(e.target.value)}
          rows={3}
          placeholder="例：年度优秀员工、主导 xx 项目获部门表彰、完成 xx 重大活动保障……"
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 placeholder:text-gray-300 transition-all resize-none leading-relaxed"
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-500 text-xs bg-red-50 border border-red-100 px-3 py-2 rounded-xl">
          <span>⚠️</span> {error}
        </div>
      )}

      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={save}
          disabled={saving}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
          style={{ background: 'linear-gradient(90deg,#f59e0b,#fb923c)' }}
        >
          {saving ? '保存中…' : '保存档案'}
        </button>
        <button
          onClick={cancelEdit}
          className="px-4 py-2.5 rounded-xl text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          取消
        </button>
      </div>
    </div>
  )
}
