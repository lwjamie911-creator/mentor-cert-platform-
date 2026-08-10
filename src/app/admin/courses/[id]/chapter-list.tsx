'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, Plus } from 'lucide-react'

interface Chapter {
  id: string
  title: string
  contentType: string
  orderIndex: number
  isRequired: boolean
  questions: { id: string }[]
}

const contentTypeLabel: Record<string, { label: string; color: string }> = {
  text:    { label: '图文', color: 'bg-cocoa-100 text-cocoa-700' },
  pdf:     { label: 'PDF', color: 'bg-cocoa-100 text-cocoa-700' },
  link:    { label: '外链', color: 'bg-cocoa-100 text-cocoa-700' },
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
          const ct = contentTypeLabel[ch.contentType] ?? { label: ch.contentType, color: 'bg-cocoa-100 text-cocoa-600' }
          return (
            <div key={ch.id}
              className="flex items-center gap-3 bg-cocoa-50/60 hover:bg-cocoa-100/60 border border-line hover:border-cocoa-300 rounded-xl px-4 py-3 transition-all group">
              {/* 序号 */}
              <div className="w-7 h-7 rounded-lg bg-paper border border-cocoa-200 flex items-center justify-center text-xs font-bold text-cocoa-500 flex-shrink-0">
                {idx + 1}
              </div>

              {/* 标题 + 标签 */}
              <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-cocoa-800 truncate">{ch.title}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${ct.color}`}>
                  {ct.label}
                </span>
                {!ch.isRequired && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-cocoa-100 text-cocoa-500 flex-shrink-0">选学</span>
                )}
                {ch.questions.length > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blush/60 text-sienna flex-shrink-0">
                    {ch.questions.length} 道题
                  </span>
                )}
              </div>

              {/* 操作 */}
              <div className="flex items-center gap-2 flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                <Link
                  href={`/admin/courses/${courseId}/chapters/${ch.id}`}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-cocoa-700 border border-cocoa-300 hover:bg-cocoa-100 transition-colors"
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
          <div className="text-center py-10 text-cocoa-400">
            <BookOpen className="w-8 h-8 mx-auto mb-2 text-cocoa-300" strokeWidth={1.5} />
            <p className="text-sm">暂无章节，点击下方添加</p>
          </div>
        )}
      </div>

      <Link
        href={`/admin/courses/${courseId}/chapters/new`}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-cocoa-700 border border-cocoa-300 hover:bg-cocoa-100 transition-all hover:-translate-y-0.5"
      >
        <Plus className="w-4 h-4" strokeWidth={2} /> 添加章节
      </Link>
    </div>
  )
}
