'use client'

import { useState, useEffect } from 'react'
import { PartyPopper, X } from 'lucide-react'

interface Props {
  newbiesDone: { pairId: string; name: string | null }[]
}

const STORAGE_KEY = 'mentor_dismissed_done'

export function NewbieDoneAlert({ newbiesDone }: Props) {
  const [visible, setVisible] = useState<{ pairId: string; name: string | null }[]>([])

  useEffect(() => {
    const dismissed: string[] = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    setVisible(newbiesDone.filter(n => !dismissed.includes(n.pairId)))
  }, [newbiesDone])

  function dismiss() {
    const dismissed: string[] = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    const newDismissed = Array.from(new Set([...dismissed, ...visible.map(n => n.pairId)]))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newDismissed))
    setVisible([])
  }

  if (visible.length === 0) return null

  return (
    <div className="rounded-lg border border-cocoa-300 bg-cocoa-100/70 px-5 py-4 flex items-start gap-3 animate-fade-in">
      <span className="w-8 h-8 rounded-lg bg-cocoa-200 flex items-center justify-center flex-shrink-0 mt-0.5">
        <PartyPopper className="w-4 h-4 text-cocoa-800" strokeWidth={2} />
      </span>
      <div className="flex-1">
        <p className="font-semibold text-cocoa-900 text-sm">{visible.length} 位新人已完成全部考核！</p>
        <p className="text-cocoa-600 text-xs mt-0.5">{visible.map(n => n.name ?? '—').join('、')} 已达标</p>
      </div>
      <button
        onClick={dismiss}
        className="text-cocoa-400 hover:text-cocoa-700 leading-none flex-shrink-0 mt-0.5 transition-colors"
        title="知道了，不再提示"
      >
        <X className="w-4 h-4" strokeWidth={2} />
      </button>
    </div>
  )
}
