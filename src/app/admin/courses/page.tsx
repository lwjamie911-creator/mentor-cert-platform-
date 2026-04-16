import { prisma } from '@/lib/prisma'
import { CoursesTabClient } from './courses-tab-client'

export default async function AdminCoursesPage() {
  const [mentorMaterials, newbieMaterials] = await Promise.all([
    prisma.learningMaterial.findMany({
      where: { zone: { in: ['mentor', 'both'] } },
      orderBy: { orderIndex: 'asc' },
      include: { _count: { select: { progress: true } } },
    }),
    prisma.learningMaterial.findMany({
      where: { zone: { in: ['newbie', 'both'] } },
      orderBy: { orderIndex: 'asc' },
      include: { _count: { select: { progress: true } } },
    }),
  ])

  function toVM(m: typeof mentorMaterials[number]) {
    return {
      id: m.id,
      title: m.title,
      subject: m.subject,
      zone: m.zone,
      contentType: m.contentType,
      contentUrl: m.contentUrl,
      contentText: m.contentText,
      minReadSeconds: m.minReadSeconds,
      orderIndex: m.orderIndex,
      isPublished: m.isPublished,
      _count: { progress: m._count.progress },
    }
  }

  return (
    <div className="space-y-6">
      {/* 页头 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">课程管理</h1>
        <p className="text-sm text-gray-400 mt-1">管理各专区的学习课程</p>
      </div>

      <CoursesTabClient
        mentorMaterials={mentorMaterials.map(toVM)}
        newbieMaterials={newbieMaterials.map(toVM)}
      />
    </div>
  )
}
