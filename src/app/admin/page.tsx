import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { BackupButton } from './backup-button'

export default async function AdminDashboard() {
  const [mentorCertCount, mentorSelfCheckCount, newbieBadgeCount, allMaterials, allProgress] = await Promise.all([
    prisma.mentorCertificate.count(),
    prisma.mentorSelfCheck.count(),
    prisma.newbieBadge.count(),
    prisma.learningMaterial.findMany({
      where: { isPublished: true, zone: { in: ['newbie', 'both'] } },
      select: { id: true },
    }),
    prisma.learningProgress.findMany({ select: { userId: true, materialId: true } }),
  ])

  // 计算完成全部新人课程的人数
  const materialIds = new Set(allMaterials.map(m => m.id))
  const userProgressMap = new Map<string, Set<string>>()
  for (const p of allProgress) {
    if (!materialIds.has(p.materialId)) continue
    if (!userProgressMap.has(p.userId)) userProgressMap.set(p.userId, new Set())
    userProgressMap.get(p.userId)!.add(p.materialId)
  }
  const newbieCompletedCount = materialIds.size === 0 ? 0 :
    Array.from(userProgressMap.values()).filter(s => s.size >= materialIds.size).length

  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">数据看板</h1>
        <p className="text-sm text-gray-400 mt-1">TEG秘书成长平台运营概览</p>
      </div>

      {/* 备份按钮 */}
      <div className="flex justify-end">
        <BackupButton />
      </div>

      {/* 双专区详情 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 导师专区 */}
        <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-50"
            style={{ background: 'linear-gradient(135deg, #fffbeb, #fef3c7)' }}>
            <span className="text-lg">🎓</span>
            <h2 className="font-bold text-amber-800">导师专区</h2>
          </div>
          <div className="p-5 grid grid-cols-2 gap-3">
            <MiniStatCard
              label="完成资质自检人数"
              value={mentorSelfCheckCount}
              href="/admin/users"
              color="amber"
            />
            <MiniStatCard
              label="导师认证颁发数"
              value={mentorCertCount}
              href="/admin/certificates"
              color="amber"
            />
          </div>
        </section>

        {/* 新人专区 */}
        <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-50"
            style={{ background: 'linear-gradient(135deg, #eff6ff, #dbeafe)' }}>
            <span className="text-lg">🌱</span>
            <h2 className="font-bold text-blue-800">新人专区</h2>
          </div>
          <div className="p-5 grid grid-cols-2 gap-3">
            <MiniStatCard
              label="完成必修课程人数"
              value={newbieCompletedCount}
              href="/admin/users"
              color="blue"
            />
            <MiniStatCard
              label="结业证书颁发数"
              value={newbieBadgeCount}
              href="/admin/certificates"
              color="blue"
            />
          </div>
        </section>
      </div>
    </div>
  )
}

function MiniStatCard({ label, value, href, color }: {
  label: string; value: number; href: string; color: 'amber' | 'blue'
}) {
  const styles = {
    amber: 'bg-amber-50 text-amber-700 hover:bg-amber-100',
    blue:  'bg-blue-50  text-blue-700  hover:bg-blue-100',
  }
  return (
    <Link href={href} className={`rounded-xl p-3 transition-colors ${styles[color]}`}>
      <div className="text-2xl font-black">{value}</div>
      <div className="text-xs mt-0.5 opacity-80">{label}</div>
    </Link>
  )
}
