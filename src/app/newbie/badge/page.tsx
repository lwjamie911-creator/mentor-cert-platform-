import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { NewbieBadgePrintView } from './badge-print-view'

export default async function NewbieBadgePage() {
  const session = await getServerSession(authOptions)

  const badge = await prisma.newbieBadge.findUnique({ where: { userId: session!.user.id } })
  if (!badge) redirect('/newbie')

  const user = await prisma.user.findUnique({
    where: { id: session!.user.id },
    select: { name: true, email: true },
  })

  const wxId = user?.email?.split('@')[0] ?? ''

  return (
    <NewbieBadgePrintView
      name={user?.name ?? ''}
      wxId={wxId}
      badgeNo={badge.badgeNo}
      issuedAt={badge.issuedAt.toISOString()}
    />
  )
}
