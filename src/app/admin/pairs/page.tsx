export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { PairsClient } from './pairs-client'

export default async function AdminPairsPage() {
  const pairs = await prisma.mentorNewbiePair.findMany({
    where: { isAdminPaired: true },
    include: {
      mentor: { select: { id: true, name: true, email: true } },
      newbie:  { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-1 h-6 rounded-full bg-indigo-400" />
        <h1 className="text-lg font-bold text-gray-900">导师新人匹配</h1>
        <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
          共 {pairs.length} 对
        </span>
      </div>
      <PairsClient initialPairs={pairs} />
    </div>
  )
}
