import Link from 'next/link'
import ChapterForm from '../../chapter-form'

export default function NewChapterPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      {/* 返回 + 页头 */}
      <div>
        <Link
          href={`/admin/courses/${params.id}`}
          className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-blue-600 transition-colors mb-3"
        >
          ← 返回课程
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">新建章节</h1>
        <p className="text-sm text-gray-400 mt-1">填写章节信息后保存，再添加随堂测验题</p>
      </div>

      {/* 表单卡片 */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div
          className="flex items-center gap-2 px-5 py-4 border-b border-gray-50"
          style={{ background: 'linear-gradient(135deg, #eff6ff, #dbeafe)' }}
        >
          <span>📖</span>
          <h2 className="font-bold text-blue-800 text-sm">章节基本信息</h2>
        </div>
        <div className="p-5">
          <ChapterForm courseId={params.id} />
        </div>
      </section>
    </div>
  )
}
