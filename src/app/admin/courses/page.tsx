import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function AdminCoursesPage() {
  const courses = await prisma.course.findMany({
    orderBy: { orderIndex: 'asc' },
    include: {
      chapters: { select: { id: true } },
      enrollments: { select: { id: true, status: true } },
    },
  })

  const publishedCount = courses.filter(c => c.isPublished).length

  return (
    <div className="space-y-6">
      {/* 页头 */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">课程管理</h1>
          <p className="text-sm text-gray-400 mt-1">
            共 <span className="text-gray-700 font-medium">{courses.length}</span> 门课程 ·{' '}
            <span className="text-green-600 font-medium">{publishedCount}</span> 门已上线
          </p>
        </div>
        <Link
          href="/admin/courses/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(90deg, #4f46e5, #7c3aed)' }}
        >
          + 新建课程
        </Link>
      </div>

      {/* 课程卡片列表 */}
      {courses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-20">
          <div className="text-5xl mb-4">📚</div>
          <p className="text-gray-400 text-sm mb-4">暂无课程，点击右上角新建第一门课程</p>
          <Link href="/admin/courses/new"
            className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:underline font-medium">
            + 新建课程
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {courses.map((course) => {
            const completedCount = course.enrollments.filter(e => e.status === 'completed').length
            return (
              <div key={course.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-5 hover:border-indigo-200 hover:shadow-md transition-all">
                {/* 序号 */}
                <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-400 font-bold text-sm flex-shrink-0">
                  {course.orderIndex + 1}
                </div>

                {/* 主信息 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900 truncate">{course.title}</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                      course.isPublished ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${course.isPublished ? 'bg-green-500' : 'bg-gray-400'}`} />
                      {course.isPublished ? '已上线' : '草稿'}
                    </span>
                  </div>
                  {course.description && (
                    <p className="text-xs text-gray-400 truncate">{course.description}</p>
                  )}
                </div>

                {/* 统计信息 */}
                <div className="hidden sm:flex items-center gap-5 flex-shrink-0">
                  <StatPill icon="📖" label="章节" value={course.chapters.length} />
                  <StatPill icon="👥" label="报名" value={course.enrollments.length} />
                  <StatPill icon="✅" label="完成" value={completedCount} highlight />
                  <StatPill icon="⏰" label="截止" value={`${course.deadlineDays}天`} />
                </div>

                {/* 编辑按钮 */}
                <Link
                  href={`/admin/courses/${course.id}`}
                  className="flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold text-indigo-600 border border-indigo-200 hover:bg-indigo-50 transition-colors"
                >
                  编辑
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function StatPill({ icon, label, value, highlight }: {
  icon: string; label: string; value: number | string; highlight?: boolean
}) {
  return (
    <div className="text-center">
      <div className={`text-sm font-bold ${highlight ? 'text-green-600' : 'text-gray-700'}`}>{value}</div>
      <div className="text-xs text-gray-400">{label}</div>
    </div>
  )
}
