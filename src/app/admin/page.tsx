import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function AdminDashboard() {
  const [
    totalUsers,
    mentorCertCount,
    newbieBindCount,
    newbieBadgeCount,
    newbieExamPassCount,
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'learner' } }),
    prisma.mentorCertificate.count(),
    prisma.newbieChecklist.count(),
    prisma.newbieBadge.count(),
    prisma.newbieExam.count({ where: { passed: true } }),
  ])

  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">数据看板</h1>
        <p className="text-sm text-gray-400 mt-1">TEG秘书成长平台整体运营概览</p>
      </div>

      {/* 整体概况 — 大卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <BigStatCard
          label="整体用户数"
          value={totalUsers}
          href="/admin/users"
          icon="👥"
          gradient="from-indigo-500 to-purple-600"
          note="平台注册学员总数"
        />
        <BigStatCard
          label="导师认证通过数"
          value={mentorCertCount}
          href="/admin/certificates"
          icon="🏆"
          gradient="from-amber-400 to-orange-500"
          note="已获得导师认证证书"
        />
        <BigStatCard
          label="新人勋章颁发数"
          value={newbieBadgeCount}
          href="/admin/newbies"
          icon="🏅"
          gradient="from-blue-500 to-indigo-600"
          note="已达标的新人数量"
        />
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
            <MiniStatCard label="认证证书颁发" value={mentorCertCount} href="/admin/certificates" color="amber" />
            <MiniStatCard label="知识测试通过" value={mentorCertCount} href="/admin/certificates" color="amber" />
          </div>
        </section>

        {/* 新人专区 */}
        <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-50"
            style={{ background: 'linear-gradient(135deg, #eff6ff, #dbeafe)' }}>
            <span className="text-lg">🌱</span>
            <h2 className="font-bold text-blue-800">新人专区</h2>
          </div>
          <div className="p-5 grid grid-cols-3 gap-3">
            <MiniStatCard label="已绑定导师" value={newbieBindCount} href="/admin/newbies" color="blue" />
            <MiniStatCard label="测试通过" value={newbieExamPassCount} href="/admin/newbies" color="blue" />
            <MiniStatCard label="勋章颁发" value={newbieBadgeCount} href="/admin/newbies" color="blue" />
          </div>
        </section>
      </div>
    </div>
  )
}

function BigStatCard({ label, value, href, icon, gradient, note }: {
  label: string; value: number; href: string; icon: string; gradient: string; note: string
}) {
  return (
    <Link href={href}
      className={`relative overflow-hidden rounded-2xl p-6 text-white bg-gradient-to-br ${gradient} hover:opacity-95 hover:scale-[1.01] transition-all shadow-sm`}>
      <div className="absolute top-[-16px] right-[-16px] text-7xl opacity-10">{icon}</div>
      <div className="text-4xl font-black mb-1">{value}</div>
      <div className="font-semibold text-sm mb-0.5">{label}</div>
      <div className="text-xs opacity-70">{note}</div>
    </Link>
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
