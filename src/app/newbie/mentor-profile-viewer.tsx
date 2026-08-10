'use client'

import { useState } from 'react'
import { ClipboardList, ChevronDown, Sprout, FileText, Clock, MessageCircle } from 'lucide-react'
import type { AccentTheme } from '../mentor/accent-theme'

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
  accent?: AccentTheme
}

export function MentorProfileViewer({ mentorId, mentorName, accent }: Props) {
  const borderClass = accent?.softBorder ?? 'border-petal-200'
  const ringText = accent?.text ?? 'text-petal-700'
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
    <div className={`rounded-2xl border overflow-hidden ${borderClass}`}>
      {/* Header / Trigger */}
      <button
        onClick={open ? () => setOpen(false) : load}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-petal-50/60 transition-colors text-left"
      >
        <div className="w-10 h-10 rounded-full bg-petal-100 flex items-center justify-center flex-shrink-0">
          <ClipboardList className="w-5 h-5 text-petal-700" strokeWidth={2} />
        </div>
        <div className="flex-1">
          <p className={`text-sm font-semibold ${ringText}`}>查看导师档案</p>
          <p className="text-xs text-cocoa-400 mt-0.5">了解你的导师 {mentorName} 的经历与成就</p>
        </div>
        <ChevronDown className="w-5 h-5 text-petal-400 transition-transform duration-300 flex-shrink-0" strokeWidth={2}
          style={{ transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>

      {/* Expanded profile */}
      {open && (
        <div className={`border-t animate-fade-in ${borderClass}`}>
          {loading && (
            <div className="flex items-center justify-center py-10 text-cocoa-400">
              <span className="text-sm">加载中…</span>
            </div>
          )}

          {!loading && (profile === 'empty' || !hasContent) && (
            <div className="flex flex-col items-center justify-center py-10 gap-2 text-petal-400">
              <Sprout className="w-8 h-8" strokeWidth={1.5} />
              <p className="text-sm">导师还未填写档案，期待他/她更多分享~</p>
            </div>
          )}

          {!loading && hasContent && p && (
            <div className="px-5 py-5 space-y-5 bg-gradient-to-b from-petal-50/60 to-paper">
              {/* Mentor avatar + name card */}
              <div className="flex items-center gap-4">
                {p.photoBase64 ? (
                  <img
                    src={p.photoBase64}
                    alt={`导师 ${mentorName}`}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-petal-200 flex-shrink-0 shadow-card"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-petal-100 flex items-center justify-center flex-shrink-0 shadow-card">
                    <span className="text-2xl font-bold text-petal-700">{mentorName[0]}</span>
                  </div>
                )}
                <div>
                  <p className="text-xs text-petal-700 font-semibold mb-0.5">你的导师</p>
                  <p className="text-lg font-display font-bold text-petal-900">{mentorName}</p>
                  {p.yearsOfExperience && (
                    <p className="text-xs text-cocoa-500 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" strokeWidth={2} /> {p.yearsOfExperience}
                    </p>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-petal-100" />

              {/* Intro */}
              {(p.projectExperience || p.highlights) && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-petal-600" strokeWidth={2} />
                    <h3 className="text-sm font-bold text-petal-800">个人介绍</h3>
                  </div>
                  <div className="bg-paper rounded-xl border border-petal-200 px-4 py-3 shadow-card">
                    <p className="text-sm text-cocoa-700 leading-relaxed whitespace-pre-wrap">
                      {[p.projectExperience, p.highlights].filter(Boolean).join('\n\n')}
                    </p>
                  </div>
                </div>
              )}

              {/* Footer message —— 蜜桃点缀 */}
              <div className="bg-blush/50 rounded-xl px-4 py-3 flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-sienna flex-shrink-0" strokeWidth={2} />
                <p className="text-xs text-sienna leading-relaxed">
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
