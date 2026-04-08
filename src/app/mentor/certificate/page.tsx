import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import dayjs from 'dayjs'
import { MentorCertPrintView } from './mentor-cert-print-view'

export default async function MentorCertificatePage() {
  const session = await getServerSession(authOptions)

  const cert = await prisma.mentorCertificate.findUnique({
    where: { userId: session!.user.id },
    include: { user: { select: { name: true, email: true } } },
  })
  if (!cert) notFound()

  return (
    <MentorCertPrintView
      name={cert.user.name}
      certificateNo={cert.certificateNo}
      score={cert.score}
      issuedDate={dayjs(cert.issuedAt).format('YYYY年MM月DD日')}
      expiresDate={dayjs(cert.expiresAt).format('YYYY年MM月DD日')}
    />
  )
}
