'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import Link from 'next/link'

interface Props {
  chapter: {
    id: string
    contentType: string
    contentText: string | null
    contentUrl: string | null
    minReadSeconds: number
  }
  courseId: string
  isCompleted: boolean
  hasQuestions: boolean
}

export function ChapterContent({ chapter, courseId, isCompleted, hasQuestions }: Props) {
  const router = useRouter()
  const [timeSpent, setTimeSpent] = useState(0)
  const [marking, setMarking]     = useState(false)
  const [done, setDone]           = useState(isCompleted)
  const intervalRef               = useRef<NodeJS.Timeout>()

  const minSeconds  = chapter.minReadSeconds || 0
  const canComplete = minSeconds === 0 || timeSpent >= minSeconds
  const remaining   = Math.max(0, minSeconds - timeSpent)
  const pct         = minSeconds > 0 ? Math.min(100, Math.round((timeSpent / minSeconds) * 100)) : 100

  useEffect(() => {
    if (done) return
    intervalRef.current = setInterval(() => setTimeSpent(t => t + 1), 1000)
    return () => clearInterval(intervalRef.current)
  }, [done])

  async function markComplete() {
    setMarking(true)
    await fetch(`/api/courses/${courseId}/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chapterId: chapter.id, timeSpentSeconds: timeSpent, completed: true }),
    })
    setDone(true)
    setMarking(false)
    router.refresh()
  }

  return (
    <div className="space-y-4">
      {/* 内容区 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {chapter.contentType === 'text' && chapter.contentText && (
          <div className="prose prose-sm max-w-none prose-headings:text-gray-800 prose-p:text-gray-600 prose-p:leading-relaxed">
            <ReactMarkdown>{chapter.contentText}</ReactMarkdown>
          </div>
        )}

        {chapter.contentType === 'pdf' && chapter.contentUrl && (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">📄</div>
            <p className="text-sm text-gray-500 mb-4">点击下方按钮打开 PDF 文件阅读</p>
            <a
              href={chapter.contentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(90deg, #3b82f6, #6366f1)' }}
            >
              📄 打开 PDF 文件
            </a>
            {minSeconds > 0 && (
              <p className="text-xs text-gray-400 mt-4">
                请至少阅读 {Math.ceil(minSeconds / 60)} 分钟后标记完成
              </p>
            )}
          </div>
        )}

        {chapter.contentType === 'external_link' && chapter.contentUrl && (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">🔗</div>
            <p className="text-sm text-gray-500 mb-4">点击下方按钮跳转到学习资料</p>
            <a
              href={chapter.contentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(90deg, #3b82f6, #6366f1)' }}
            >
              🔗 打开外部链接
            </a>
            {minSeconds > 0 && (
              <p className="text-xs text-gray-400 mt-4">
                请至少停留 {Math.ceil(minSeconds / 60)} 分钟后标记完成
              </p>
            )}
          </div>
        )}
      </div>

      {/* 底部操作栏 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* 计时区 */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {!done && minSeconds > 0 && (
              <>
                <div className="flex-1 max-w-[180px]">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>阅读进度</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #3b82f6, #6366f1)' }}
                    />
                  </div>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">
                  {canComplete ? '可以完成了 ✓' : `还需 ${remaining} 秒`}
                </span>
              </>
            )}
            {done && (
              <span className="text-sm text-green-600 font-medium">✓ 本章节已完成</span>
            )}
          </div>

          {/* 按钮区 */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {done && hasQuestions && (
              <Link
                href={`/dashboard/courses/${courseId}/chapters/${chapter.id}/quiz`}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-indigo-600 border border-indigo-200 hover:bg-indigo-50 transition-colors"
              >
                📝 章节测验
              </Link>
            )}

            {!done ? (
              <button
                onClick={markComplete}
                disabled={!canComplete || marking}
                className="px-5 py-2 rounded-xl text-sm font-semibold text-white shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: canComplete ? 'linear-gradient(90deg, #22c55e, #16a34a)' : undefined,
                         backgroundColor: !canComplete ? '#d1d5db' : undefined }}
              >
                {marking ? '保存中…' : canComplete ? '✅ 标记完成' : `还需 ${remaining} 秒`}
              </button>
            ) : (
              <Link
                href={`/dashboard/courses/${courseId}`}
                className="px-5 py-2 rounded-xl text-sm font-semibold text-indigo-600 border border-indigo-200 hover:bg-indigo-50 transition-colors"
              >
                返回课程 →
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
