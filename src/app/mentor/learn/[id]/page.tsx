import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MaterialReader } from '@/components/material-reader'

export default async function MentorLearnPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  const material = await prisma.learningMaterial.findUnique({ where: { id: params.id } })
  if (!material || !['mentor', 'both'].includes(material.zone)) notFound()

  const progress = await prisma.learningProgress.findUnique({
    where: { userId_materialId: { userId: session!.user.id, materialId: params.id } },
  })

  return (
    <div className="space-y-4">
      <div>
        <Link href="/mentor"
          className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-amber-600 transition-colors mb-3">
          ← 返回导师专区
        </Link>
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-xl font-bold text-gray-900">{material.title}</h1>
          <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full">{material.subject}</span>
          {progress && <span className="text-xs px-2 py-0.5 bg-green-50 text-green-600 rounded-full font-medium">✓ 已读完</span>}
        </div>
      </div>

      <MaterialReader
        materialId={material.id}
        contentText={material.contentText ?? ''}
        minReadSeconds={material.minReadSeconds}
        isCompleted={!!progress}
        backHref="/mentor"
        accentColor="amber"
      />
    </div>
  )
}
