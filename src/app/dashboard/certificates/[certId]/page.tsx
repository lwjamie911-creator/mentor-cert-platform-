import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import dayjs from 'dayjs'
import { CertificatePrintView } from './certificate-print-view'

export default async function CertificatePage({ params }: { params: { certId: string } }) {
  const session = await getServerSession(authOptions)

  const cert = await prisma.certificate.findUnique({
    where: { id: params.certId },
    include: {
      user: { select: { name: true, email: true } },
      course: { select: { title: true } },
    },
  })

  if (!cert || cert.userId !== session!.user.id) notFound()

  const wxId = cert.user.email.split('@')[0]
  const issuedDate = dayjs(cert.issuedAt).format('YYYY年MM月DD日')
  const expiresDate = dayjs(cert.expiresAt).format('YYYY年MM月DD日')
  const expired = dayjs(cert.expiresAt).isBefore(dayjs())

  return (
    <CertificatePrintView
      name={cert.user.name}
      wxId={wxId}
      courseTitle={cert.course.title}
      certificateNo={cert.certificateNo}
      issuedDate={issuedDate}
      expiresDate={expiresDate}
      expired={expired}
    />
  )
}
