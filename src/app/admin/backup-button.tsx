'use client'

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
    <Button
      variant="ghost"
      onClick={handleBackup}
      disabled={loading}
    >
      {loading
        ? <><Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} /> 导出中…</>
        : <><Download className="w-4 h-4" strokeWidth={2} /> 导出数据备份</>}
    </Button>
  )
}
