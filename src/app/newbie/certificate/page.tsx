import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { NewbieCertPrintView } from './newbie-cert-print-view'
import dayjs from 'dayjs'

export default async function NewbieCertificatePage() {
  const session = await getServerSession(authOptions)

  const [badge, exam, user] = await Promise.all([
    prisma.newbieBadge.findUnique({ where: { userId: session!.user.id } }),
    prisma.newbieExam.findUnique({ where: { userId: session!.user.id } }),
    prisma.user.findUnique({ where: { id: session!.user.id }, select: { name: true } }),
  ])

  // 未通过考试则跳回
  if (!badge || !exam?.passed) {
    redirect('/newbie')
  }

  return (
    <NewbieCertPrintView
      name={user?.name ?? session!.user.name ?? ''}
      certificateNo={badge.badgeNo}
      score={exam.score}
      issuedDate={dayjs(badge.issuedAt).format('YYYY年MM月DD日')}
    />
  )
}
