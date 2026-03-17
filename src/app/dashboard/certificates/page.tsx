import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import dayjs from 'dayjs'
import Link from 'next/link'

export default async function CertificatesPage() {
  const session = await getServerSession(authOptions)

  const certs = await prisma.certificate.findMany({
    where: { userId: session!.user.id },
    include: { course: { select: { title: true } } },
    orderBy: { issuedAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      {/* 页头 */}
      <div>
        <Link href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-indigo-600 transition-colors mb-3">
          ← 返回课程列表
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">我的证书</h1>
        <p className="text-sm text-gray-400 mt-1">
          共 <span className="text-gray-700 font-medium">{certs.length}</span> 张课程认证证书
        </p>
      </div>

      {certs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-20">
          <div className="text-5xl mb-4">🏆</div>
          <p className="text-gray-400 text-sm mb-1">暂无证书</p>
          <p className="text-xs text-gray-300">完成课程学习和期末考试后可获取</p>
        </div>
      ) : (
        <div className="space-y-3">
          {certs.map((cert) => {
            const expired = dayjs(cert.expiresAt).isBefore(dayjs())
            const wxId    = session!.user.email?.split('@')[0] ?? ''
            return (
              <div key={cert.id}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all hover:shadow-md ${
                  expired ? 'border-gray-100' : 'border-indigo-100'
                }`}>
                {/* 渐变头 */}
                <div className="px-5 py-4 flex items-center justify-between gap-4"
                  style={{ background: expired
                    ? 'linear-gradient(135deg, #f9fafb, #f3f4f6)'
                    : 'linear-gradient(135deg, #fffbeb, #fef3c7)' }}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{expired ? '📜' : '🏆'}</span>
                    <div>
                      <div className="font-bold text-gray-900">{cert.course.title}</div>
                      <div className="text-xs text-gray-500 mt-0.5 font-mono">{cert.certificateNo}</div>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                    expired ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-700'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${expired ? 'bg-gray-400' : 'bg-green-500'}`} />
                    {expired ? '已过期' : '有效'}
                  </span>
                </div>

                {/* 详情 */}
                <div className="px-5 py-4 flex items-center justify-between gap-4">
                  <div className="space-y-1 text-xs text-gray-500">
                    <div>企业微信：<span className="font-mono text-gray-700">{wxId}</span></div>
                    <div>颁发日期：{dayjs(cert.issuedAt).format('YYYY年MM月DD日')}</div>
                    <div className={expired ? 'text-red-400' : ''}>
                      有效期至：{dayjs(cert.expiresAt).format('YYYY年MM月DD日')}
                    </div>
                  </div>

                  <Link
                    href={`/dashboard/certificates/${cert.id}`}
                    className="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold border transition-colors"
                    style={expired ? undefined : {
                      borderColor: '#f59e0b',
                      color: '#b45309',
                    }}
                    onMouseEnter={e => { if (!expired) (e.currentTarget as HTMLElement).style.background = '#fffbeb' }}
                    onMouseLeave={e => { if (!expired) (e.currentTarget as HTMLElement).style.background = '' }}
                  >
                    {expired ? '查看证书' : '🎖 查看 / 下载'}
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
