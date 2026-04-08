'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface ImportResult {
  email: string
  name: string
  status: 'created' | 'skipped' | 'error'
  reason?: string
}

interface ImportResponse {
  created: number
  skipped: number
  errors: number
  results: ImportResult[]
}

export function UserImporter() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<ImportResponse | null>(null)
  const [fileName, setFileName] = useState('')

  async function upload(file: File) {
    setFileName(file.name)
    setLoading(true)
    setResponse(null)

    const form = new FormData()
    form.append('file', file)

    const res = await fetch('/api/admin/users/import', { method: 'POST', body: form })
    const data = await res.json()
    setLoading(false)
    setResponse(data)
    router.refresh()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) upload(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) upload(file)
  }

  return (
    <div className="space-y-4">
      {/* 下载模板 */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          上传包含「完整企业微信ID、公司邮箱」两列的 Excel 文件
        </p>
        <a
          href="/api/admin/users/template"
          className="text-sm text-blue-600 hover:underline"
        >
          下载导入模板
        </a>
      </div>

      {/* 拖拽上传区 */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          dragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          className="hidden"
        />
        {loading ? (
          <div className="text-gray-500">
            <div className="text-2xl mb-2">⏳</div>
            <p className="text-sm">正在导入 {fileName}...</p>
          </div>
        ) : (
          <div className="text-gray-400">
            <div className="text-3xl mb-2">📂</div>
            <p className="text-sm font-medium text-gray-600">点击选择文件，或拖拽到此处</p>
            <p className="text-xs mt-1">支持 .xlsx / .xls 格式</p>
          </div>
        )}
      </div>

      {/* 导入结果 */}
      {response && (
        <div className="space-y-3">
          {/* 汇总 */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-700">{response.created}</div>
              <div className="text-xs text-green-600 mt-0.5">成功创建</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-yellow-700">{response.skipped}</div>
              <div className="text-xs text-yellow-600 mt-0.5">跳过（已存在）</div>
            </div>
            <div className="bg-red-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-red-700">{response.errors}</div>
              <div className="text-xs text-red-600 mt-0.5">失败</div>
            </div>
          </div>

          {/* 新建账号提示 */}
          {response.created > 0 && (
            <div className="bg-blue-50 rounded-lg px-4 py-3 text-sm text-blue-700">
              初始密码统一为 123456，请告知学员登录后修改密码。
            </div>
          )}

          {/* 明细（仅显示跳过和失败） */}
          {(response.skipped > 0 || response.errors > 0) && (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-4 py-2 bg-gray-50 border-b text-xs font-medium text-gray-500">
                跳过 / 失败明细
              </div>
              <div className="divide-y divide-gray-100 max-h-48 overflow-y-auto">
                {response.results
                  .filter((r) => r.status !== 'created')
                  .map((r, i) => (
                    <div key={i} className="px-4 py-2 flex items-center justify-between text-sm gap-4">
                      <div>
                        <span className="text-gray-700">{r.name}</span>
                        <span className="text-gray-400 font-mono ml-2 text-xs">{r.email}</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        r.status === 'skipped'
                          ? 'bg-yellow-50 text-yellow-700'
                          : 'bg-red-50 text-red-600'
                      }`}>
                        {r.reason}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
