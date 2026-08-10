import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { BackupButton } from './backup-button'
import { GraduationCap, Sprout } from 'lucide-react'

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
        <h1 className="font-display text-2xl text-cocoa-900">数据看板</h1>
        <p className="text-sm text-cocoa-500 mt-1">TEG秘书成长平台运营概览</p>
      </div>

      {/* 备份按钮 */}
      <div className="flex justify-end">
        <BackupButton />
      </div>

      {/* 双专区详情 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 导师专区 */}
        <section className="bg-paper rounded-2xl border border-line overflow-hidden shadow-card animate-fade-up">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-line/70"
            style={{ background: 'linear-gradient(135deg, #fdf4ec, #fbe6d6)' }}>
            <GraduationCap className="w-5 h-5 text-cocoa-800" strokeWidth={2} />
            <h2 className="font-semibold text-cocoa-900">导师专区</h2>
          </div>
          <div className="p-5 grid grid-cols-2 gap-3">
            <MiniStatCard
              label="完成资质自检人数"
              value={mentorSelfCheckCount}
              href="/admin/users"
            />
            <MiniStatCard
              label="导师认证颁发数"
              value={mentorCertCount}
              href="/admin/certificates"
            />
          </div>
        </section>

        {/* 新人专区 */}
        <section className="bg-paper rounded-2xl border border-line overflow-hidden shadow-card animate-fade-up">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-line/70"
            style={{ background: 'linear-gradient(135deg, #fdf4ec, #f5d9c4)' }}>
            <Sprout className="w-5 h-5 text-cocoa-800" strokeWidth={2} />
            <h2 className="font-semibold text-cocoa-900">新人专区</h2>
          </div>
          <div className="p-5 grid grid-cols-2 gap-3">
            <MiniStatCard
              label="完成必修课程人数"
              value={newbieCompletedCount}
              href="/admin/users"
            />
            <MiniStatCard
              label="结业证书颁发数"
              value={newbieBadgeCount}
              href="/admin/certificates"
            />
          </div>
        </section>
      </div>
    </div>
  )
}

function MiniStatCard({ label, value, href }: {
  label: string; value: number; href: string
}) {
  return (
    <Link href={href} className="rounded-xl p-3 bg-cocoa-50 text-cocoa-800 hover:bg-cocoa-100 transition-all hover:-translate-y-0.5">
      <div className="text-2xl font-black text-cocoa-900">{value}</div>
      <div className="text-xs mt-0.5 text-cocoa-600">{label}</div>
    </Link>
  )
}
