import { prisma } from '@/lib/prisma'
import dayjs from 'dayjs'

export default async function AdminCertificatesPage() {
  const mentorCerts = await prisma.mentorCertificate.findMany({
    orderBy: { issuedAt: 'desc' },
    include: { user: { select: { name: true, email: true } } },
  })

  const mentorValidCount = mentorCerts.filter(c => !dayjs(c.expiresAt).isBefore(dayjs())).length

  return (
    <div className="space-y-6">
      {/* 页头 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">证书管理</h1>
        <p className="text-sm text-gray-400 mt-1">管理各专区颁发的认证证书</p>
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

      {/* 导师认证证书 */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg, #fffbeb, #fef3c7)' }}>
          <div className="flex items-center gap-2">
            <span>🏆</span>
            <h2 className="font-bold text-amber-800 text-sm">导师认证证书</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">
              {mentorValidCount} 张有效
            </span>
            <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-medium">
              共 {mentorCerts.length} 张
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[680px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">导师</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">用户ID</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">证书编号</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">考试得分</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">颁发日期</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">有效期至</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {mentorCerts.map((cert) => {
                const expired = dayjs(cert.expiresAt).isBefore(dayjs())
                const wxId = cert.user.email.split('@')[0]
                return (
                  <tr key={cert.id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-xs flex-shrink-0">
                          {cert.user.name?.[0] ?? '?'}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{cert.user.name}</div>
                          <div className="text-xs text-amber-400 font-mono">{cert.user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">{wxId}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">{cert.certificateNo}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-lg font-black text-amber-500">{cert.score}</span>
                      <span className="text-xs text-gray-400 ml-1">分</span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">{dayjs(cert.issuedAt).format('YYYY-MM-DD')}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">{dayjs(cert.expiresAt).format('YYYY-MM-DD')}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                        expired ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${expired ? 'bg-red-400' : 'bg-green-500'}`} />
                        {expired ? '已过期' : '有效'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {mentorCerts.length === 0 && (
            <div className="text-center py-14 text-gray-400">
              <div className="text-4xl mb-3">🏆</div>
              <p className="text-sm">暂无导师认证证书</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
