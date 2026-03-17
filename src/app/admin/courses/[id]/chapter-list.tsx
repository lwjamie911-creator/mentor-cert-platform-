'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Chapter {
  id: string
  title: string
  contentType: string
  orderIndex: number
  isRequired: boolean
  questions: { id: string }[]
}

const contentTypeLabel: Record<string, { label: string; color: string }> = {
  text:    { label: '图文', color: 'bg-blue-50 text-blue-600' },
  pdf:     { label: 'PDF', color: 'bg-red-50 text-red-500' },
  link:    { label: '外链', color: 'bg-green-50 text-green-600' },
}

export function ChapterList({ courseId, chapters }: { courseId: string; chapters: Chapter[] }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState<string | null>(null)

  async function deleteChapter(id: string) {
    if (!confirm('确定删除该章节？')) return
    setDeleting(id)
    await fetch(`/api/admin/chapters/${id}`, { method: 'DELETE' })
    setDeleting(null)
    router.refresh()
  }

  return (
    <div>
      <div className="space-y-2 mb-4">
        {chapters.map((ch, idx) => {
          const ct = contentTypeLabel[ch.contentType] ?? { label: ch.contentType, color: 'bg-gray-100 text-gray-500' }
          return (
            <div key={ch.id}
              className="flex items-center gap-3 bg-gray-50 hover:bg-blue-50/40 border border-gray-100 hover:border-blue-200 rounded-xl px-4 py-3 transition-all group">
              {/* 序号 */}
              <div className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-400 flex-shrink-0">
                {idx + 1}
              </div>

              {/* 标题 + 标签 */}
              <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-gray-800 truncate">{ch.title}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${ct.color}`}>
                  {ct.label}
                </span>
                {!ch.isRequired && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-400 flex-shrink-0">选学</span>
                )}
                {ch.questions.length > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-500 flex-shrink-0">
                    {ch.questions.length} 道题
                  </span>
                )}
              </div>

              {/* 操作 */}
              <div className="flex items-center gap-2 flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                <Link
                  href={`/admin/courses/${courseId}/chapters/${ch.id}`}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-blue-600 border border-blue-200 hover:bg-blue-50 transition-colors"
                >
                  编辑
                </Link>
                <button
                  onClick={() => deleteChapter(ch.id)}
                  disabled={deleting === ch.id}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 border border-red-100 hover:bg-red-50 transition-colors disabled:opacity-40"
                >
                  {deleting === ch.id ? '删除中…' : '删除'}
                </button>
              </div>
            </div>
          )
        })}

        {chapters.length === 0 && (
          <div className="text-center py-10 text-gray-300">
            <div className="text-3xl mb-2">📖</div>
            <p className="text-sm">暂无章节，点击下方添加</p>
          </div>
        )}
      </div>

      <Link
        href={`/admin/courses/${courseId}/chapters/new`}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-blue-600 border border-blue-200 hover:bg-blue-50 transition-colors"
      >
        + 添加章节
      </Link>
    </div>
  )
}
