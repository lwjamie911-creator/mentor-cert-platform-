'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

const typeLabel: Record<string, string> = {
  matching:  '连线题',
  multiple:  '多选题',
  single:    '单选题',
  truefalse: '判断题',
}
const typeColor: Record<string, string> = {
  matching:  'bg-yellow-100 text-yellow-700',
  multiple:  'bg-green-100 text-green-700',
  single:    'bg-blue-100 text-blue-700',
  truefalse: 'bg-pink-100 text-pink-700',
}

interface Counts { matching: number; multiple: number; single: number; truefalse: number; total: number }
interface PreviewQ { id: string; type: string; content: string; optCount: number }

function ZoneBankPanel({
  zone,
  counts,
  preview,
}: {
  zone: 'mentor' | 'newbie'
  counts: Counts
  preview: PreviewQ[]
}) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [downloading, setDownloading] = useState(false)
  const [uploading, setUploading]     = useState(false)
  const [uploadResult, setUploadResult] = useState<{ success?: string; error?: string; details?: string[] } | null>(null)

  const isMentor = zone === 'mentor'
  const label = isMentor ? '导师认证' : '新人专区'
  const accentFrom = isMentor ? '#4f46e5' : '#3b82f6'
  const accentTo   = isMentor ? '#7c3aed' : '#6366f1'
  const ruleText = isMentor
    ? '每次随机抽取 10 题：必含 1 道连线题 + 1 道多选题 + 8 道单选/判断题'
    : '每次随机抽取 10 题：必含 1 道连线题 + 1 道多选题 + 8 道单选/判断题'

  async function handleDownload() {
    setDownloading(true)
    try {
      const res = await fetch(`/api/admin/questions/export?zone=${zone}`)
      if (!res.ok) throw new Error('导出失败')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${label}题库-${new Date().toISOString().slice(0, 10)}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('导出失败，请重试')
    } finally {
      setDownloading(false)
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadResult(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('zone', zone)
      const res = await fetch('/api/admin/questions/import', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) {
        setUploadResult({ error: data.error, details: data.details })
      } else {
        setUploadResult({ success: data.message })
        router.refresh()
      }
    } catch {
      setUploadResult({ error: '上传失败，请重试' })
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="space-y-6">
      {/* 操作栏 */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400 mt-1">管理{label}考试题库，支持下载 Excel 后修改再上传更新</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50"
          >
            {downloading ? '⏳' : '📥'} {downloading ? '导出中…' : '下载题库 Excel'}
          </button>
          <label className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white cursor-pointer transition-all
            ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
            style={{ background: `linear-gradient(90deg, ${accentFrom}, ${accentTo})` }}
          >
            {uploading ? '⏳ 上传中…' : '📤 上传更新题库'}
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              disabled={uploading}
              onChange={handleUpload}
            />
          </label>
        </div>
      </div>

      {/* 上传结果提示 */}
      {uploadResult && (
        <div className={`rounded-xl px-5 py-4 text-sm border ${
          uploadResult.success
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <p className="font-semibold">{uploadResult.success ?? uploadResult.error}</p>
          {uploadResult.details && (
            <ul className="mt-2 space-y-0.5 text-xs list-disc list-inside">
              {uploadResult.details.map((d, i) => <li key={i}>{d}</li>)}
            </ul>
          )}
        </div>
      )}

      {/* 题库统计卡片 */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: '题目总数', value: counts.total,     color: 'bg-indigo-50 text-indigo-700' },
          { label: '连线题',   value: counts.matching,  color: 'bg-yellow-50 text-yellow-700' },
          { label: '多选题',   value: counts.multiple,  color: 'bg-green-50 text-green-700'   },
          { label: '单选题',   value: counts.single,    color: 'bg-blue-50 text-blue-700'     },
          { label: '判断题',   value: counts.truefalse, color: 'bg-pink-50 text-pink-700'     },
        ].map(c => (
          <div key={c.label} className={`rounded-xl p-4 ${c.color}`}>
            <div className="text-3xl font-black">{c.value}</div>
            <div className="text-xs mt-0.5 opacity-80">{c.label}</div>
          </div>
        ))}
      </div>

      {/* 考试规则说明 */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 text-sm text-amber-800 flex items-start gap-3">
        <span className="text-lg mt-0.5">ℹ️</span>
        <div>
          <p className="font-semibold mb-1">当前考试规则</p>
          <p>{ruleText}</p>
          <p className="mt-0.5">通过标准：答对率 ≥ 80%（即 10 题中答对 8 题及以上）</p>
        </div>
      </div>

      {/* 题目预览列表 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg, #f8f7ff, #ede9fe)' }}>
          <h2 className="font-bold text-indigo-800 text-sm">题目列表（共 {preview.length} 题）</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {preview.length === 0 ? (
            <div className="px-5 py-10 text-center text-gray-400 text-sm">暂无题目，请上传题库</div>
          ) : (
            preview.map((q, i) => (
              <div key={q.id} className="px-5 py-3.5 flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-400 text-xs flex items-center justify-center font-bold mt-0.5">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 leading-relaxed line-clamp-2">{q.content}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{q.optCount} 个选项</p>
                </div>
                <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${typeColor[q.type] ?? 'bg-gray-100 text-gray-500'}`}>
                  {typeLabel[q.type] ?? q.type}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export function QuestionBankClient({
  mentorCounts, mentorPreview,
  newbieCounts, newbiePreview,
}: {
  mentorCounts: Counts; mentorPreview: PreviewQ[]
  newbieCounts: Counts; newbiePreview: PreviewQ[]
}) {
  const [tab, setTab] = useState<'mentor' | 'newbie'>('mentor')

  return (
    <div className="space-y-6">
      {/* 页头 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">题库管理</h1>
        <p className="text-sm text-gray-400 mt-1">管理各专区考试题库，支持下载 Excel 后修改再上传更新</p>
      </div>

      {/* 标签页 */}
      <div className="flex gap-2 border-b border-gray-200 pb-0">
        <button
          onClick={() => setTab('mentor')}
          className={`px-4 py-2 text-sm font-semibold transition-colors -mb-px ${
            tab === 'mentor'
              ? 'text-amber-700 border-b-2 border-amber-500 bg-white'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          🎓 导师题库
        </button>
        <button
          onClick={() => setTab('newbie')}
          className={`px-4 py-2 text-sm font-semibold transition-colors -mb-px ${
            tab === 'newbie'
              ? 'text-blue-700 border-b-2 border-blue-500 bg-white'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          🌱 新人题库
        </button>
      </div>

      {tab === 'mentor' && (
        <ZoneBankPanel zone="mentor" counts={mentorCounts} preview={mentorPreview} />
      )}
      {tab === 'newbie' && (
        <ZoneBankPanel zone="newbie" counts={newbieCounts} preview={newbiePreview} />
      )}
    </div>
  )
}
