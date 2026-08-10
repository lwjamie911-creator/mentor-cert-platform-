'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Download, Upload, Info, GraduationCap, Sprout } from 'lucide-react'

const typeLabel: Record<string, string> = {
  matching:  '连线题',
  multiple:  '多选题',
  single:    '单选题',
  truefalse: '判断题',
}
const typeColor: Record<string, string> = {
  matching:  'bg-blush/60 text-sienna',
  multiple:  'bg-emerald-50 text-emerald-700',
  single:    'bg-cocoa-100 text-cocoa-700',
  truefalse: 'bg-petal-100 text-petal-700',
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
  const accentFrom = isMentor ? '#5d2a1a' : '#c05e6d'
  const accentTo   = isMentor ? '#7a4230' : '#d67d8a'
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
          <p className="text-sm text-cocoa-500 mt-1">管理{label}考试题库，支持下载 Excel 后修改再上传更新</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-cocoa-700 border border-cocoa-300 bg-paper hover:bg-cocoa-50 hover:border-cocoa-500 transition-all active:scale-[0.97] disabled:opacity-50"
          >
            <Download className="w-4 h-4" strokeWidth={2} /> {downloading ? '导出中…' : '下载题库 Excel'}
          </button>
          <label className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white cursor-pointer transition-all active:scale-[0.97]
            ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-0.5 hover:shadow-subtle'}`}
            style={{ background: `linear-gradient(90deg, ${accentFrom}, ${accentTo})` }}
          >
            <Upload className="w-4 h-4" strokeWidth={2} /> {uploading ? '上传中…' : '上传更新题库'}
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
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
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
          { label: '题目总数', value: counts.total,     color: 'bg-cocoa-50 text-cocoa-700 border-cocoa-100'   },
          { label: '连线题',   value: counts.matching,  color: 'bg-blush/50 text-sienna border-cocoa-200'      },
          { label: '多选题',   value: counts.multiple,  color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
          { label: '单选题',   value: counts.single,    color: 'bg-cocoa-100 text-cocoa-800 border-cocoa-200'  },
          { label: '判断题',   value: counts.truefalse, color: 'bg-petal-100 text-petal-800 border-petal-200'  },
        ].map(c => (
          <div key={c.label} className={`rounded-2xl p-4 border ${c.color}`}>
            <div className="text-3xl font-black">{c.value}</div>
            <div className="text-xs mt-0.5 opacity-80">{c.label}</div>
          </div>
        ))}
      </div>

      {/* 考试规则说明 */}
      <div className="bg-blush/40 border border-cocoa-200 rounded-xl px-5 py-4 text-sm text-sienna flex items-start gap-3">
        <Info className="w-5 h-5 mt-0.5 flex-shrink-0 text-cocoa-600" strokeWidth={2} />
        <div>
          <p className="font-semibold mb-1">当前考试规则</p>
          <p>{ruleText}</p>
          <p className="mt-0.5">通过标准：答对率 ≥ 80%（即 10 题中答对 8 题及以上）</p>
        </div>
      </div>

      {/* 题目预览列表 */}
      <div className="bg-paper rounded-2xl border border-line shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-line/70 flex items-center justify-between"
          style={{ background: isMentor ? 'linear-gradient(135deg, #fdf4ec, #fbe6d6)' : 'linear-gradient(135deg, #fef6f7, #fce4e6)' }}>
          <h2 className={`font-semibold text-sm ${isMentor ? 'text-cocoa-900' : 'text-petal-900'}`}>题目列表（共 {preview.length} 题）</h2>
        </div>
        <div className="divide-y divide-line/70">
          {preview.length === 0 ? (
            <div className="px-5 py-10 text-center text-cocoa-400 text-sm">暂无题目，请上传题库</div>
          ) : (
            preview.map((q, i) => (
              <div key={q.id} className="px-5 py-3.5 flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cocoa-100 text-cocoa-500 text-xs flex items-center justify-center font-bold mt-0.5">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-cocoa-800 leading-relaxed line-clamp-2">{q.content}</p>
                  <p className="text-xs text-cocoa-400 mt-0.5">{q.optCount} 个选项</p>
                </div>
                <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${typeColor[q.type] ?? 'bg-cocoa-50 text-cocoa-500'}`}>
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
        <h1 className="font-display text-2xl text-cocoa-900">题库管理</h1>
        <p className="text-sm text-cocoa-500 mt-1">管理各专区考试题库，支持下载 Excel 后修改再上传更新</p>
      </div>

      {/* 标签页 */}
      <div className="flex gap-2 border-b border-line pb-0">
        <button
          onClick={() => setTab('mentor')}
          className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold transition-colors -mb-px ${
            tab === 'mentor'
              ? 'text-cocoa-800 border-b-2 border-cocoa-700 bg-paper'
              : 'text-cocoa-400 hover:text-cocoa-600'
          }`}
        >
          <GraduationCap className="w-4 h-4" strokeWidth={2} /> 导师题库
        </button>
        <button
          onClick={() => setTab('newbie')}
          className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold transition-colors -mb-px ${
            tab === 'newbie'
              ? 'text-petal-800 border-b-2 border-petal-600 bg-paper'
              : 'text-cocoa-400 hover:text-cocoa-600'
          }`}
        >
          <Sprout className="w-4 h-4" strokeWidth={2} /> 新人题库
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
