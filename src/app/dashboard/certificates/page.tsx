export const dynamic = 'force-dynamic'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import dayjs from 'dayjs'
import Link from 'next/link'
import { ArrowLeft, Trophy, ScrollText, Medal } from 'lucide-react'

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
      <div className="animate-fade-up">
        <Link href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-cocoa-500 hover:text-cocoa-800 transition-colors mb-3">
          <ArrowLeft className="w-4 h-4" strokeWidth={2} /> 返回课程列表
        </Link>
        <h1 className="font-display text-2xl text-cocoa-900 tracking-tight">我的证书</h1>
        <p className="text-sm text-cocoa-500 mt-1">
          共 <span className="text-cocoa-800 font-medium">{certs.length}</span> 张课程认证证书
        </p>
      </div>

      {certs.length === 0 ? (
        <div className="bg-paper rounded-2xl border border-line shadow-card text-center py-20">
          <Trophy className="w-12 h-12 text-cocoa-300 mx-auto mb-4" strokeWidth={1.5} />
          <p className="text-cocoa-500 text-sm mb-1">暂无证书</p>
          <p className="text-xs text-cocoa-400">完成课程学习和期末考试后可获取</p>
        </div>
      ) : (
        <div className="space-y-3">
          {certs.map((cert) => {
            const expired = dayjs(cert.expiresAt).isBefore(dayjs())
            const wxId    = session!.user.email?.split('@')[0] ?? ''
            return (
              <div key={cert.id}
                className={`bg-paper rounded-2xl border shadow-card overflow-hidden transition-all hover:shadow-subtle hover:-translate-y-0.5 animate-fade-up ${
                  expired ? 'border-line' : 'border-cocoa-200'
                }`}>
                {/* 渐变头 */}
                <div className="px-5 py-4 flex items-center justify-between gap-4"
                  style={{ background: expired
                    ? 'linear-gradient(135deg, #fdf4ec, #f5efe9)'
                    : 'linear-gradient(135deg, #fdf4ec, #fbe6d6)' }}>
                  <div className="flex items-center gap-3">
                    {expired
                      ? <ScrollText className="w-6 h-6 text-cocoa-500" strokeWidth={2} />
                      : <Trophy className="w-6 h-6 text-cocoa-700" strokeWidth={2} />}
                    <div>
                      <div className="font-semibold text-cocoa-900">{cert.course.title}</div>
                      <div className="text-xs text-cocoa-500 mt-0.5 font-mono">{cert.certificateNo}</div>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                    expired ? 'bg-cocoa-100 text-cocoa-500' : 'bg-cocoa-100 text-cocoa-800'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${expired ? 'bg-cocoa-400' : 'bg-cocoa-700'}`} />
                    {expired ? '已过期' : '有效'}
                  </span>
                </div>

                {/* 详情 */}
                <div className="px-5 py-4 flex items-center justify-between gap-4">
                  <div className="space-y-1 text-xs text-cocoa-500">
                    <div>企业微信：<span className="font-mono text-cocoa-700">{wxId}</span></div>
                    <div>颁发日期：{dayjs(cert.issuedAt).format('YYYY年MM月DD日')}</div>
                    <div className={expired ? 'text-sienna' : ''}>
                      有效期至：{dayjs(cert.expiresAt).format('YYYY年MM月DD日')}
                    </div>
                  </div>

                  <Link
                    href={`/dashboard/certificates/${cert.id}`}
                    className={`inline-flex items-center gap-1.5 flex-shrink-0 px-4 py-2 rounded-lg text-xs font-semibold border transition-all active:scale-[0.97] ${
                      expired
                        ? 'border-cocoa-300 text-cocoa-600 hover:bg-cocoa-100'
                        : 'border-cocoa-300 text-cocoa-800 hover:bg-cocoa-100'
                    }`}
                  >
                    {expired ? '查看证书' : (<><Medal className="w-3.5 h-3.5" strokeWidth={2} /> 查看 / 下载</>)}
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
