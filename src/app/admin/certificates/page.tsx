import { prisma } from '@/lib/prisma'
import dayjs from 'dayjs'

export default async function AdminCertificatesPage() {
  const [mentorCerts, courseCerts] = await Promise.all([
    prisma.mentorCertificate.findMany({
      orderBy: { issuedAt: 'desc' },
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.certificate.findMany({
      orderBy: { issuedAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        course: { select: { title: true } },
      },
    }),
  ])

  const mentorValidCount = mentorCerts.filter(c => !dayjs(c.expiresAt).isBefore(dayjs())).length
  const courseValidCount = courseCerts.filter(c => !dayjs(c.expiresAt).isBefore(dayjs())).length

  return (
    <div className="space-y-8">
      {/* 页头 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">导师认证证书</h1>
        <p className="text-sm text-gray-400 mt-1">
          导师认证 <span className="text-amber-600 font-medium">{mentorCerts.length}</span> 张 ·
          课程证书 <span className="text-gray-600 font-medium">{courseCerts.length}</span> 张
        </p>
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
                          <div className="text-xs text-amber-400 font-mono">{wxId}</div>
                        </div>
                      </div>
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

      {/* 课程完成证书 */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg, #f8f7ff, #ede9fe)' }}>
          <div className="flex items-center gap-2">
            <span>📜</span>
            <h2 className="font-bold text-indigo-800 text-sm">课程完成证书</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">
              {courseValidCount} 张有效
            </span>
            <span className="text-xs bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full font-medium">
              共 {courseCerts.length} 张
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">学员</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">证书编号</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">课程</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">颁发日期</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">有效期至</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {courseCerts.map((cert) => {
                const expired = dayjs(cert.expiresAt).isBefore(dayjs())
                const wxId = cert.user.email.split('@')[0]
                return (
                  <tr key={cert.id} className="hover:bg-indigo-50/20 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs flex-shrink-0">
                          {cert.user.name?.[0] ?? '?'}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{cert.user.name}</div>
                          <div className="text-xs text-indigo-400 font-mono">{wxId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">{cert.certificateNo}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-lg">{cert.course.title}</span>
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
          {courseCerts.length === 0 && (
            <div className="text-center py-14 text-gray-400">
              <div className="text-4xl mb-3">📜</div>
              <p className="text-sm">暂无课程证书记录</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
