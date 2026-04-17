'use client'

import { useState } from 'react'

interface MentorProfileData {
  yearsOfExperience: string | null
  projectExperience: string | null
  highlights: string | null
  photoBase64: string | null
  user: { name: string; email: string }
}

interface Props {
  mentorId: string
  mentorName: string
}

export function MentorProfileViewer({ mentorId, mentorName }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<MentorProfileData | null | 'empty'>(null)

  async function load() {
    if (profile !== null) { setOpen(true); return }
    setLoading(true)
    const res = await fetch(`/api/mentor/profile/${mentorId}`)
    const data = await res.json()
    setProfile(data ?? 'empty')
    setLoading(false)
    setOpen(true)
  }

  const p = profile !== 'empty' ? profile : null
  const hasContent = p && (p.yearsOfExperience || p.projectExperience || p.highlights || p.photoBase64)

  return (
    <div className="rounded-2xl border border-indigo-100 overflow-hidden">
      {/* Header / Trigger */}
      <button
        onClick={open ? () => setOpen(false) : load}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-indigo-50/40 transition-colors text-left"
      >
        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
          <span className="text-xl">📋</span>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">查看导师档案</p>
          <p className="text-xs text-gray-400 mt-0.5">了解你的导师 {mentorName} 的经历与成就</p>
        </div>
        <span className="text-gray-300 text-lg transition-transform duration-300" style={{ transform: open ? 'rotate(180deg)' : 'none' }}>
          ▾
        </span>
      </button>

      {/* Expanded profile */}
      {open && (
        <div className="border-t border-indigo-100 animate-in fade-in slide-in-from-top-2 duration-300">
          {loading && (
            <div className="flex items-center justify-center py-10 text-gray-300">
              <span className="text-sm">加载中…</span>
            </div>
          )}

          {!loading && (profile === 'empty' || !hasContent) && (
            <div className="flex flex-col items-center justify-center py-10 gap-2 text-gray-400">
              <span className="text-3xl">🌱</span>
              <p className="text-sm">导师还未填写档案，期待他/她更多分享~</p>
            </div>
          )}

          {!loading && hasContent && p && (
            <div className="px-5 py-5 space-y-5 bg-gradient-to-b from-indigo-50/30 to-white">
              {/* Mentor avatar + name card */}
              <div className="flex items-center gap-4">
                {p.photoBase64 ? (
                  <img
                    src={p.photoBase64}
                    alt={`导师 ${mentorName}`}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-200 flex-shrink-0 shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <span className="text-2xl font-bold text-indigo-600">{mentorName[0]}</span>
                  </div>
                )}
                <div>
                  <p className="text-xs text-indigo-500 font-semibold mb-0.5">你的导师</p>
                  <p className="text-lg font-bold text-gray-900">{mentorName}</p>
                  {p.yearsOfExperience && (
                    <p className="text-xs text-gray-500 mt-0.5">🕐 {p.yearsOfExperience}</p>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-indigo-100" />

              {/* Intro */}
              {(p.projectExperience || p.highlights) && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-base">📝</span>
                    <h3 className="text-sm font-bold text-gray-800">个人介绍</h3>
                  </div>
                  <div className="bg-white rounded-xl border border-indigo-100 px-4 py-3 shadow-sm">
                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                      {[p.projectExperience, p.highlights].filter(Boolean).join('\n\n')}
                    </p>
                  </div>
                </div>
              )}

              {/* Footer message */}
              <div className="bg-indigo-50 rounded-xl px-4 py-3 flex items-center gap-3">
                <span className="text-xl flex-shrink-0">💬</span>
                <p className="text-xs text-indigo-600 leading-relaxed">
                  你的导师 {mentorName} 很期待带你成长，遇到任何问题都可以联系 ta！
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
