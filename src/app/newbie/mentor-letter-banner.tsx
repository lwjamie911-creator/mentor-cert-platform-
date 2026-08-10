'use client'

import { useState } from 'react'
import { Mail, ChevronUp } from 'lucide-react'
import type { AccentTheme } from '../mentor/accent-theme'

interface Props {
  mentorName: string | null
  message: string
  accent?: AccentTheme
}

export function MentorLetterBanner({ mentorName, message, accent }: Props) {
  const [opened, setOpened] = useState(false)
  const borderClass = accent?.softBorder ?? 'border-petal-300'

  if (!opened) {
    return (
      <div
        onClick={() => setOpened(true)}
        className={`cursor-pointer rounded-2xl overflow-hidden border ${borderClass} shadow-card hover:shadow-subtle hover:-translate-y-0.5 transition-all group`}
      >
        {/* Envelope flap */}
        <div
          className="relative h-10 flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg,#c05e6d 0%,#9d4552 100%)' }}
        >
          {/* decorative triangle */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[160px] border-r-[160px] border-t-[40px] border-l-transparent border-r-transparent border-t-petal-900/40"
          />
          <span className="relative z-10 text-white text-xs font-semibold flex items-center gap-1.5 group-hover:scale-105 transition-transform">
            <Mail className="w-3.5 h-3.5" strokeWidth={2} /> 你有一封来自导师的信，点击开启
          </span>
        </div>
        {/* Envelope body */}
        <div className="bg-petal-50 px-5 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-petal-100 flex items-center justify-center text-petal-700 font-bold flex-shrink-0">
            {mentorName?.[0] ?? '师'}
          </div>
          <div>
            <p className="text-xs text-petal-800 font-semibold">来自导师 {mentorName ?? '—'} 的寄语</p>
            <p className="text-xs text-cocoa-500 mt-0.5">点击查看导师写给你的话 →</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`rounded-2xl overflow-hidden border ${borderClass} shadow-card animate-fade-in`}>
      {/* Letter header */}
      <div
        className="px-5 py-3 flex items-center gap-2"
        style={{ background: 'linear-gradient(135deg,#c05e6d 0%,#9d4552 100%)' }}
      >
        <Mail className="w-4 h-4 text-white flex-shrink-0" strokeWidth={2} />
        <div className="flex-1">
          <p className="text-paper text-xs font-semibold">导师寄语</p>
          <p className="text-white/80 text-[10px]">来自 {mentorName ?? '你的导师'}</p>
        </div>
        <button
          onClick={() => setOpened(false)}
          className="text-white/70 hover:text-paper text-sm transition-colors flex items-center gap-1"
          title="收起"
        >
          收起 <ChevronUp className="w-3.5 h-3.5" strokeWidth={2} />
        </button>
      </div>

      {/* Letter body */}
      <div className="bg-petal-50/50 px-5 py-4">
        <div className="bg-paper rounded-xl border border-petal-200 px-5 py-5 shadow-card relative">
          {/* lined paper decoration */}
          <div className="absolute inset-x-5 top-10 space-y-[22px] pointer-events-none">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-px bg-petal-100" />
            ))}
          </div>
          <p className="relative z-10 text-sm text-cocoa-700 leading-relaxed whitespace-pre-wrap">
            {message}
          </p>
          <p className="relative z-10 text-xs text-cocoa-400 mt-4 text-right">—— {mentorName ?? '你的导师'}</p>
        </div>
      </div>
    </div>
  )
}
