import { prisma } from '@/lib/prisma'
import { MaterialsManager } from './materials-manager'

export default async function AdminMaterialsPage() {
  const materials = await prisma.learningMaterial.findMany({
    orderBy: [{ orderIndex: 'asc' }],
    include: { _count: { select: { progress: true } } },
  })

  const mentorCount  = materials.filter(m => m.zone === 'mentor' || m.zone === 'both').length
  const newbieCount  = materials.filter(m => m.zone === 'newbie' || m.zone === 'both').length
  const publishedCount = materials.filter(m => m.isPublished).length

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">学习文档管理</h1>
        <p className="text-sm text-gray-400 mt-1">管理导师和新人专区的学习资料，支持 Markdown 格式正文</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: '全部资料', value: materials.length,   color: 'bg-indigo-50 text-indigo-700' },
          { label: '已发布',   value: publishedCount,     color: 'bg-green-50 text-green-700'  },
          { label: '导师专区', value: mentorCount,        color: 'bg-amber-50 text-amber-700'  },
          { label: '新人专区', value: newbieCount,        color: 'bg-blue-50 text-blue-700'    },
        ].map(s => (
          <div key={s.label} className={`rounded-xl px-4 py-3 ${s.color}`}>
            <div className="text-2xl font-black">{s.value}</div>
            <div className="text-xs mt-0.5 opacity-80">{s.label}</div>
          </div>
        ))}
      </div>

      {/* 管理器（客户端交互） */}
      <MaterialsManager initialMaterials={materials.map(m => ({
        id: m.id,
        title: m.title,
        subject: m.subject,
        zone: m.zone,
        contentType: m.contentType,
        contentText: m.contentText,
        contentUrl: m.contentUrl,
        minReadSeconds: m.minReadSeconds,
        orderIndex: m.orderIndex,
        isPublished: m.isPublished,
        _count: { progress: m._count.progress },
      }))} />
    </div>
  )
}
