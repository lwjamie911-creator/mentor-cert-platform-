'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function EnrollButton({ courseId }: { courseId: string }) {
  const router  = useRouter()
  const [loading, setLoading] = useState(false)

  async function enroll() {
    setLoading(true)
    const res = await fetch(`/api/courses/${courseId}/enroll`, { method: 'POST' })
    setLoading(false)
    if (res.ok) router.refresh()
  }

  return (
    <button
      onClick={enroll}
      disabled={loading}
      className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 disabled:opacity-60"
      style={{ background: 'linear-gradient(90deg, #3b82f6, #6366f1)' }}
    >
      {loading ? '报名中…' : '✅ 立即报名'}
    </button>
  )
}
