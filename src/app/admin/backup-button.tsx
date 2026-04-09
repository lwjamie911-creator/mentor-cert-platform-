'use client'

import { useState } from 'react'

export function BackupButton() {
  const [loading, setLoading] = useState(false)

  async function handleBackup() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/backup')
      if (!res.ok) throw new Error('备份失败')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `mentor-platform-backup-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      alert('导出失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleBackup}
      disabled={loading}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-500 border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50"
    >
      <span>{loading ? '⏳' : '💾'}</span>
      {loading ? '导出中…' : '导出数据备份'}
    </button>
  )
}
