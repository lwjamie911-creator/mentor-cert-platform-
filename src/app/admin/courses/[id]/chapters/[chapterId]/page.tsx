import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ChapterForm from '../../chapter-form'
import { QuestionBank } from '../../question-bank'

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
          className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-blue-600 transition-colors mb-3"
        >
          ← 返回课程
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">编辑章节</h1>
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
            chapter.isRequired ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${chapter.isRequired ? 'bg-blue-500' : 'bg-gray-400'}`} />
            {chapter.isRequired ? '必学' : '选学'}
          </span>
        </div>
        <p className="text-sm text-gray-400 mt-1">{chapter.title}</p>
      </div>

      {/* 章节基本信息 */}
      <SectionCard icon="📖" title="章节基本信息" accentColor="blue">
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
        icon="❓"
        title="随堂测验题"
        accentColor="purple"
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

function SectionCard({ icon, title, accentColor, badge, children }: {
  icon: string
  title: string
  accentColor: 'blue' | 'purple' | 'indigo'
  badge?: string
  children: React.ReactNode
}) {
  const gradients = {
    blue:   'from-blue-50 to-indigo-50',
    purple: 'from-purple-50 to-pink-50',
    indigo: 'from-indigo-50 to-purple-50',
  }
  const textColors = {
    blue:   'text-blue-800',
    purple: 'text-purple-800',
    indigo: 'text-indigo-800',
  }
  const badgeColors = {
    blue:   'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    indigo: 'bg-indigo-100 text-indigo-600',
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
