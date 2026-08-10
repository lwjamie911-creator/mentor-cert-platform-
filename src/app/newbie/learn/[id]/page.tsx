import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Check } from 'lucide-react'
import { MaterialReader } from '@/components/material-reader'

export default async function NewbieLearnPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  const material = await prisma.learningMaterial.findUnique({ where: { id: params.id } })
  if (!material || !['newbie', 'both'].includes(material.zone)) notFound()

  const progress = await prisma.learningProgress.findUnique({
    where: { userId_materialId: { userId: session!.user.id, materialId: params.id } },
  })

  return (
    <div className="space-y-4">
      <div>
        <Link href="/newbie"
          className="inline-flex items-center gap-1.5 text-sm text-cocoa-500 hover:text-petal-700 transition-colors mb-3">
          <ArrowLeft className="w-4 h-4" strokeWidth={2} /> 返回新人专区
        </Link>
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-xl font-display font-bold text-petal-900">{material.title}</h1>
          <span className="text-xs px-2 py-0.5 bg-petal-100 text-petal-700 rounded-full">{material.subject}</span>
          {progress && (
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-emerald-600 text-white rounded-full font-medium">
              <Check className="w-3 h-3" strokeWidth={2.5} /> 已读完
            </span>
          )}
        </div>
      </div>

      <MaterialReader
        materialId={material.id}
        contentText={material.contentText ?? ''}
        minReadSeconds={material.minReadSeconds}
        isCompleted={!!progress}
        backHref="/newbie"
        accentColor="amber"
      />
    </div>
  )
}
