import Link from 'next/link'
import ChapterForm from '../../chapter-form'
import { ArrowLeft, BookOpen } from 'lucide-react'

export default function NewChapterPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      {/* 返回 + 页头 */}
      <div>
        <Link
          href={`/admin/courses/${params.id}`}
          className="inline-flex items-center gap-1 text-sm text-cocoa-500 hover:text-cocoa-800 transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={2} /> 返回课程
        </Link>
        <h1 className="font-display text-2xl text-cocoa-900">新建章节</h1>
        <p className="text-sm text-cocoa-500 mt-1">填写章节信息后保存，再添加随堂测验题</p>
      </div>

      {/* 表单卡片 */}
      <section className="bg-paper rounded-2xl border border-line shadow-card overflow-hidden">
        <div
          className="flex items-center gap-2 px-5 py-4 border-b border-line/70"
          style={{ background: 'linear-gradient(135deg, #fdf4ec, #fbe6d6)' }}
        >
          <BookOpen className="w-4 h-4 text-cocoa-800" strokeWidth={2} />
          <h2 className="font-semibold text-cocoa-900 text-sm">章节基本信息</h2>
        </div>
        <div className="p-5">
          <ChapterForm courseId={params.id} />
        </div>
      </section>
    </div>
  )
}
