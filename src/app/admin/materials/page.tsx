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
        <h1 className="font-display text-2xl text-cocoa-900">学习文档管理</h1>
        <p className="text-sm text-cocoa-500 mt-1">管理导师和新人专区的学习资料，支持 Markdown 格式正文</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: '全部资料', value: materials.length,   color: 'bg-cocoa-50 text-cocoa-700 border-cocoa-100'   },
          { label: '已发布',   value: publishedCount,     color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
          { label: '导师专区', value: mentorCount,        color: 'bg-cocoa-100 text-cocoa-800 border-cocoa-200'  },
          { label: '新人专区', value: newbieCount,        color: 'bg-petal-100 text-petal-800 border-petal-200'  },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl px-4 py-3 border ${s.color}`}>
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
