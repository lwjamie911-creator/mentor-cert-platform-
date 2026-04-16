'use client'

import { useState, useEffect } from 'react'

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
    <div className="rounded-xl border border-green-200 bg-green-50 px-5 py-4 flex items-start gap-3">
      <span className="text-xl mt-0.5">🎉</span>
      <div className="flex-1">
        <p className="font-semibold text-green-800 text-sm">{visible.length} 位新人已完成全部考核！</p>
        <p className="text-green-600 text-xs mt-0.5">{visible.map(n => n.name ?? '—').join('、')} 已达标</p>
      </div>
      <button
        onClick={dismiss}
        className="text-green-400 hover:text-green-600 text-lg leading-none flex-shrink-0 mt-0.5 transition-colors"
        title="知道了，不再提示"
      >
        ×
      </button>
    </div>
  )
}
