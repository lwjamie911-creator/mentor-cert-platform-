import { prisma } from '@/lib/prisma'
import dayjs from 'dayjs'
import { CertTabClient } from './cert-tab-client'

export default async function AdminCertificatesPage() {
  const [mentorCerts, newbieBadges] = await Promise.all([
    prisma.mentorCertificate.findMany({
      orderBy: { issuedAt: 'desc' },
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.newbieBadge.findMany({
      orderBy: { issuedAt: 'desc' },
      include: { user: { select: { name: true, email: true } } },
    }),
  ])

  // 获取对应的 newbieExam 数据（score + subjectiveAnswer）
  const newbieUserIds = newbieBadges.map(b => b.userId)
  const newbieExams = newbieUserIds.length > 0
    ? await prisma.newbieExam.findMany({
        where: { userId: { in: newbieUserIds } },
        select: { userId: true, score: true, subjectiveAnswer: true },
      })
    : []
  const examMap = new Map(newbieExams.map(e => [e.userId, e]))

  const mentorValidCount = mentorCerts.filter(c => !dayjs(c.expiresAt).isBefore(dayjs())).length

  const mentorData = mentorCerts.map(c => ({
    id: c.id,
    name: c.user.name ?? '',
    email: c.user.email,
    certificateNo: c.certificateNo,
    score: c.score,
    issuedAt: dayjs(c.issuedAt).format('YYYY-MM-DD'),
    expiresAt: dayjs(c.expiresAt).format('YYYY-MM-DD'),
    expired: dayjs(c.expiresAt).isBefore(dayjs()),
  }))

  const newbieData = newbieBadges.map(b => {
    const exam = examMap.get(b.userId)
    return {
      id: b.id,
      name: b.user.name ?? '',
      email: b.user.email,
      badgeNo: b.badgeNo,
      score: exam?.score ?? null,
      issuedAt: dayjs(b.issuedAt).format('YYYY-MM-DD'),
      subjectiveAnswer: exam?.subjectiveAnswer ?? null,
    }
  })

  return (
    <div className="space-y-6">
      {/* 页头 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">证书管理</h1>
        <p className="text-sm text-gray-400 mt-1">管理各专区颁发的认证证书</p>
      </div>

      <CertTabClient
        mentorData={mentorData}
        mentorValidCount={mentorValidCount}
        newbieData={newbieData}
      />
    </div>
  )
}
