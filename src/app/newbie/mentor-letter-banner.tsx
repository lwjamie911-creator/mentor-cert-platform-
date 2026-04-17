'use client'

import { useState } from 'react'

interface Props {
  mentorName: string | null
  message: string
}

export function MentorLetterBanner({ mentorName, message }: Props) {
  const [opened, setOpened] = useState(false)

  if (!opened) {
    return (
      <div
        onClick={() => setOpened(true)}
        className="cursor-pointer rounded-2xl overflow-hidden border border-amber-200 shadow-sm hover:shadow-md transition-all group"
      >
        {/* Envelope flap */}
        <div
          className="relative h-10 flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg,#fbbf24 0%,#f97316 100%)' }}
        >
          {/* decorative triangle */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[160px] border-r-[160px] border-t-[40px] border-l-transparent border-r-transparent border-t-amber-400/60"
          />
          <span className="relative z-10 text-white text-xs font-semibold group-hover:scale-105 transition-transform">
            ✉️ 你有一封来自导师的信，点击开启
          </span>
        </div>
        {/* Envelope body */}
        <div className="bg-amber-50 px-5 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold flex-shrink-0">
            {mentorName?.[0] ?? '师'}
          </div>
          <div>
            <p className="text-xs text-amber-700 font-semibold">来自导师 {mentorName ?? '—'} 的寄语</p>
            <p className="text-xs text-amber-500 mt-0.5">点击查看导师写给你的话 →</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl overflow-hidden border border-amber-200 shadow-sm animate-in fade-in slide-in-from-top-2 duration-500">
      {/* Letter header */}
      <div
        className="px-5 py-3 flex items-center gap-2"
        style={{ background: 'linear-gradient(135deg,#fbbf24 0%,#f97316 100%)' }}
      >
        <span className="text-white text-base">✉️</span>
        <div className="flex-1">
          <p className="text-white text-xs font-semibold">导师寄语</p>
          <p className="text-amber-100 text-[10px]">来自 {mentorName ?? '你的导师'}</p>
        </div>
        <button
          onClick={() => setOpened(false)}
          className="text-amber-200 hover:text-white text-sm transition-colors"
          title="收起"
        >
          收起 ↑
        </button>
      </div>

      {/* Letter body */}
      <div className="bg-amber-50/40 px-5 py-4">
        <div className="bg-white rounded-xl border border-amber-100 px-5 py-5 shadow-sm relative">
          {/* lined paper decoration */}
          <div className="absolute inset-x-5 top-10 space-y-[22px] pointer-events-none">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-px bg-amber-50" />
            ))}
          </div>
          <p className="relative z-10 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-[system-ui]">
            {message}
          </p>
          <p className="relative z-10 text-xs text-amber-400 mt-4 text-right">—— {mentorName ?? '你的导师'}</p>
        </div>
      </div>
    </div>
  )
}
