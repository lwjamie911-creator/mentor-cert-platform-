import CourseForm from '@/components/course-form'
import Link from 'next/link'

export default function NewCoursePage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/courses"
          className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-indigo-600 transition-colors mb-3">
          ← 返回课程列表
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">新建课程</h1>
        <p className="text-sm text-gray-400 mt-1">填写基本信息后保存，再添加章节和题目</p>
      </div>

      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-50"
          style={{ background: 'linear-gradient(135deg, #f8f7ff, #ede9fe)' }}>
          <span>📝</span>
          <h2 className="font-bold text-indigo-800 text-sm">课程基本信息</h2>
        </div>
        <div className="p-5">
          <CourseForm />
        </div>
      </section>
    </div>
  )
}
