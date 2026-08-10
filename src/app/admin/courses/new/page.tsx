import CourseForm from '@/components/course-form'
import Link from 'next/link'
import { ArrowLeft, FileText } from 'lucide-react'

export default function NewCoursePage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/courses"
          className="inline-flex items-center gap-1 text-sm text-cocoa-500 hover:text-cocoa-800 transition-colors mb-3">
          <ArrowLeft className="w-4 h-4" strokeWidth={2} /> 返回课程列表
        </Link>
        <h1 className="font-display text-2xl text-cocoa-900">新建课程</h1>
        <p className="text-sm text-cocoa-500 mt-1">填写基本信息后保存，再添加章节和题目</p>
      </div>

      <section className="bg-paper rounded-2xl border border-line shadow-card overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-line/70"
          style={{ background: 'linear-gradient(135deg, #fdf4ec, #fbe6d6)' }}>
          <FileText className="w-4 h-4 text-cocoa-800" strokeWidth={2} />
          <h2 className="font-semibold text-cocoa-900 text-sm">课程基本信息</h2>
        </div>
        <div className="p-5">
          <CourseForm />
        </div>
      </section>
    </div>
  )
}
