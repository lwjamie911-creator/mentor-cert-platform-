import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import CourseForm from '@/components/course-form'
import { ChapterList } from './chapter-list'
import { QuestionBank } from './question-bank'

export default async function AdminCourseDetailPage({ params }: { params: { id: string } }) {
  const course = await prisma.course.findUnique({
    where: { id: params.id },
    include: {
      chapters: { orderBy: { orderIndex: 'asc' }, include: { questions: { select: { id: true } } } },
    },
  })
  if (!course) notFound()

  const finalQuestions = await prisma.question.findMany({
    where: { courseId: params.id },
    select: { id: true, type: true, content: true, difficulty: true },
  })

  return (
    <div className="space-y-6">
      {/* 返回 + 页头 */}
      <div>
        <Link href="/admin/courses"
          className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-indigo-600 transition-colors mb-3">
          ← 返回课程列表
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">编辑课程</h1>
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
            course.isPublished ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${course.isPublished ? 'bg-green-500' : 'bg-gray-400'}`} />
            {course.isPublished ? '已上线' : '草稿'}
          </span>
        </div>
        <p className="text-sm text-gray-400 mt-1">{course.title}</p>
      </div>

      {/* 基本信息 */}
      <SectionCard icon="📝" title="基本信息" accentColor="indigo">
        <CourseForm
          initialData={{
            id: course.id,
            title: course.title,
            description: course.description ?? '',
            deadlineDays: course.deadlineDays,
            orderIndex: course.orderIndex,
            isPublished: course.isPublished,
          }}
        />
      </SectionCard>

      {/* 章节管理 */}
      <SectionCard
        icon="📖"
        title="章节管理"
        accentColor="blue"
        badge={`${course.chapters.length} 个章节`}
      >
        <ChapterList courseId={course.id} chapters={course.chapters} />
      </SectionCard>

      {/* 期末考题 */}
      <SectionCard
        icon="❓"
        title="期末考题"
        accentColor="purple"
        badge={`${finalQuestions.length} 道题`}
      >
        <QuestionBank courseId={course.id} questions={finalQuestions} scope="course" />
      </SectionCard>
    </div>
  )
}

function SectionCard({ icon, title, accentColor, badge, children }: {
  icon: string
  title: string
  accentColor: 'indigo' | 'blue' | 'purple'
  badge?: string
  children: React.ReactNode
}) {
  const gradients = {
    indigo:  'from-indigo-50 to-purple-50',
    blue:    'from-blue-50 to-indigo-50',
    purple:  'from-purple-50 to-pink-50',
  }
  const textColors = {
    indigo: 'text-indigo-800',
    blue:   'text-blue-800',
    purple: 'text-purple-800',
  }
  const badgeColors = {
    indigo: 'bg-indigo-100 text-indigo-600',
    blue:   'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
  }
  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className={`flex items-center justify-between px-5 py-4 border-b border-gray-50 bg-gradient-to-r ${gradients[accentColor]}`}>
        <div className="flex items-center gap-2">
          <span>{icon}</span>
          <h2 className={`font-bold text-sm ${textColors[accentColor]}`}>{title}</h2>
        </div>
        {badge && (
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${badgeColors[accentColor]}`}>{badge}</span>
        )}
      </div>
      <div className="p-5">{children}</div>
    </section>
  )
}
