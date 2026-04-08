import { prisma } from '@/lib/prisma'
import { MentorCoursesManager } from './mentor-courses-manager'

export default async function AdminCoursesPage() {
  const materials = await prisma.learningMaterial.findMany({
    where: { zone: { in: ['mentor', 'both'] } },
    orderBy: { orderIndex: 'asc' },
    include: { _count: { select: { progress: true } } },
  })

  return (
    <div className="space-y-6">
      {/* 页头 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">课程管理</h1>
        <p className="text-sm text-gray-400 mt-1">管理各专区的学习课程</p>
      </div>

      {/* 标签页切换 */}
      <div className="flex gap-2 border-b border-gray-200 pb-0">
        <div className="px-4 py-2 text-sm font-semibold text-amber-700 border-b-2 border-amber-500 -mb-px bg-white">
          🎓 导师专区
        </div>
        <div className="px-4 py-2 text-sm font-medium text-gray-300 cursor-not-allowed flex items-center gap-1.5">
          🌱 新人专区
          <span className="text-xs bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full">建设中</span>
        </div>
      </div>

      {/* 导师专区内容 */}
      <MentorCoursesManager initialMaterials={materials.map(m => ({
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
      }))} />
    </div>
  )
}
