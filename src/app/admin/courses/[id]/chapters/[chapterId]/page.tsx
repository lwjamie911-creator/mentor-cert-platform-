import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ChapterForm from '../../chapter-form'
import { QuestionBank } from '../../question-bank'
import { ArrowLeft, BookOpen, HelpCircle, type LucideIcon } from 'lucide-react'

export default async function AdminChapterDetailPage({
  params,
}: {
  params: { id: string; chapterId: string }
}) {
  const chapter = await prisma.chapter.findUnique({
    where: { id: params.chapterId },
    include: { questions: { select: { id: true, type: true, content: true, difficulty: true } } },
  })
  if (!chapter || chapter.courseId !== params.id) notFound()

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
        <div className="flex items-center gap-3">
          <h1 className="font-display text-2xl text-cocoa-900">编辑章节</h1>
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
            chapter.isRequired ? 'bg-cocoa-100 text-cocoa-700' : 'bg-cocoa-100 text-cocoa-500'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${chapter.isRequired ? 'bg-cocoa-700' : 'bg-cocoa-400'}`} />
            {chapter.isRequired ? '必学' : '选学'}
          </span>
        </div>
        <p className="text-sm text-cocoa-500 mt-1">{chapter.title}</p>
      </div>

      {/* 章节基本信息 */}
      <SectionCard icon={BookOpen} title="章节基本信息">
        <ChapterForm
          courseId={params.id}
          initialData={{
            id: chapter.id,
            title: chapter.title,
            description: chapter.description ?? '',
            contentType: chapter.contentType,
            contentText: chapter.contentText ?? '',
            contentUrl: chapter.contentUrl ?? '',
            minReadSeconds: chapter.minReadSeconds,
            orderIndex: chapter.orderIndex,
            isRequired: chapter.isRequired,
          }}
        />
      </SectionCard>

      {/* 章节随堂题 */}
      <SectionCard
        icon={HelpCircle}
        title="随堂测验题"
        badge={`${chapter.questions.length} 道题`}
      >
        <QuestionBank
          courseId={params.id}
          chapterId={chapter.id}
          questions={chapter.questions}
          scope="chapter"
        />
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
