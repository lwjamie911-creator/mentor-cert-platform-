import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import CourseForm from '@/components/course-form'
import { ChapterList } from './chapter-list'
import { QuestionBank } from './question-bank'
import { ArrowLeft, FileText, BookOpen, HelpCircle, type LucideIcon } from 'lucide-react'

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
          className="inline-flex items-center gap-1 text-sm text-cocoa-500 hover:text-cocoa-800 transition-colors mb-3">
          <ArrowLeft className="w-4 h-4" strokeWidth={2} /> 返回课程列表
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="font-display text-2xl text-cocoa-900">编辑课程</h1>
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
            course.isPublished ? 'bg-green-50 text-green-700' : 'bg-cocoa-100 text-cocoa-500'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${course.isPublished ? 'bg-green-500' : 'bg-cocoa-400'}`} />
            {course.isPublished ? '已上线' : '草稿'}
          </span>
        </div>
        <p className="text-sm text-cocoa-500 mt-1">{course.title}</p>
      </div>

      {/* 基本信息 */}
      <SectionCard icon={FileText} title="基本信息">
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
        icon={BookOpen}
        title="章节管理"
        badge={`${course.chapters.length} 个章节`}
      >
        <ChapterList courseId={course.id} chapters={course.chapters} />
      </SectionCard>

      {/* 期末考题 */}
      <SectionCard
        icon={HelpCircle}
        title="期末考题"
        badge={`${finalQuestions.length} 道题`}
      >
        <QuestionBank courseId={course.id} questions={finalQuestions} scope="course" />
      </SectionCard>
    </div>
  )
}

function SectionCard({ icon: Icon, title, badge, children }: {
  icon: LucideIcon
  title: string
  badge?: string
  children: React.ReactNode
}) {
  return (
    <section className="bg-paper rounded-2xl border border-line shadow-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-line/70"
        style={{ background: 'linear-gradient(135deg, #fdf4ec, #fbe6d6)' }}>
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-cocoa-800" strokeWidth={2} />
          <h2 className="font-semibold text-sm text-cocoa-900">{title}</h2>
        </div>
        {badge && (
          <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-cocoa-100 text-cocoa-700">{badge}</span>
        )}
      </div>
      <div className="p-5">{children}</div>
    </section>
  )
}
