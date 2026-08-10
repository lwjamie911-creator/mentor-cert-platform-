'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import Link from 'next/link'
import { FileText, Link2, Check, ArrowRight, ClipboardList } from 'lucide-react'

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
      <div className="bg-paper rounded-2xl border border-line shadow-card p-6">
        {chapter.contentType === 'text' && chapter.contentText && (
          <div className="prose prose-sm max-w-none prose-headings:text-cocoa-900 prose-p:text-cocoa-700 prose-p:leading-relaxed prose-a:text-cocoa-800 prose-strong:text-cocoa-800">
            <ReactMarkdown>{chapter.contentText}</ReactMarkdown>
          </div>
        )}

        {chapter.contentType === 'pdf' && chapter.contentUrl && (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-cocoa-100 mb-4">
              <FileText className="w-7 h-7 text-cocoa-700" strokeWidth={2} />
            </div>
            <p className="text-sm text-cocoa-600 mb-4">点击下方按钮打开 PDF 文件阅读</p>
            <a
              href={chapter.contentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all active:scale-[0.97] hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(90deg, #5d2a1a, #7a4230)' }}
            >
              <FileText className="w-4 h-4" strokeWidth={2} /> 打开 PDF 文件
            </a>
            {minSeconds > 0 && (
              <p className="text-xs text-cocoa-500 mt-4">
                请至少阅读 {Math.ceil(minSeconds / 60)} 分钟后标记完成
              </p>
            )}
          </div>
        )}

        {chapter.contentType === 'external_link' && chapter.contentUrl && (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-cocoa-100 mb-4">
              <Link2 className="w-7 h-7 text-cocoa-700" strokeWidth={2} />
            </div>
            <p className="text-sm text-cocoa-600 mb-4">点击下方按钮跳转到学习资料</p>
            <a
              href={chapter.contentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all active:scale-[0.97] hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(90deg, #5d2a1a, #7a4230)' }}
            >
              <Link2 className="w-4 h-4" strokeWidth={2} /> 打开外部链接
            </a>
            {minSeconds > 0 && (
              <p className="text-xs text-cocoa-500 mt-4">
                请至少停留 {Math.ceil(minSeconds / 60)} 分钟后标记完成
              </p>
            )}
          </div>
        )}
      </div>

      {/* 底部操作栏 */}
      <div className="bg-paper rounded-2xl border border-line shadow-card px-5 py-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* 计时区 */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {!done && minSeconds > 0 && (
              <>
                <div className="flex-1 max-w-[180px]">
                  <div className="flex justify-between text-xs text-cocoa-500 mb-1">
                    <span>阅读进度</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="w-full bg-cocoa-100 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #9a5c44, #5d2a1a)' }}
                    />
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-xs text-cocoa-500 flex-shrink-0">
                  {canComplete ? <><Check className="w-3.5 h-3.5 text-emerald-600" strokeWidth={2.5} /> 可以完成了</> : `还需 ${remaining} 秒`}
                </span>
              </>
            )}
            {done && (
              <span className="inline-flex items-center gap-1 text-sm text-emerald-600 font-medium">
                <Check className="w-4 h-4" strokeWidth={2.5} /> 本章节已完成
              </span>
            )}
          </div>

          {/* 按钮区 */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {done && hasQuestions && (
              <Link
                href={`/dashboard/courses/${courseId}/chapters/${chapter.id}/quiz`}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-semibold text-cocoa-800 border border-cocoa-300 hover:bg-cocoa-50 transition-all active:scale-[0.97] hover:-translate-y-0.5"
              >
                <ClipboardList className="w-3.5 h-3.5" strokeWidth={2} /> 章节测验
              </Link>
            )}

            {!done ? (
              <button
                onClick={markComplete}
                disabled={!canComplete || marking}
                className="inline-flex items-center gap-1 px-5 py-2 rounded-lg text-sm font-semibold text-white shadow-card transition-all active:scale-[0.97] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                style={{ background: canComplete ? 'linear-gradient(90deg, #16a34a, #15803d)' : undefined,
                         backgroundColor: !canComplete ? '#cf9c84' : undefined }}
              >
                {marking ? '保存中…' : canComplete ? <><Check className="w-4 h-4" strokeWidth={2.5} /> 标记完成</> : `还需 ${remaining} 秒`}
              </button>
            ) : (
              <Link
                href={`/dashboard/courses/${courseId}`}
                className="inline-flex items-center gap-1 px-5 py-2 rounded-lg text-sm font-semibold text-cocoa-800 border border-cocoa-300 hover:bg-cocoa-50 transition-all active:scale-[0.97] hover:-translate-y-0.5"
              >
                返回课程 <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
