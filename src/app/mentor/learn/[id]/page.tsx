import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Check } from 'lucide-react'
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
          className="inline-flex items-center gap-1.5 text-sm text-cocoa-500 hover:text-cocoa-800 transition-colors mb-3">
          <ArrowLeft className="w-4 h-4" strokeWidth={2} /> 返回导师专区
        </Link>
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="font-display text-xl text-cocoa-900">{material.title}</h1>
          <span className="text-xs px-2 py-0.5 bg-cocoa-100 text-cocoa-700 rounded-full">{material.subject}</span>
          {progress && <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-cocoa-200 text-cocoa-800 rounded-full font-medium"><Check className="w-3 h-3" strokeWidth={2.5} /> 已读完</span>}
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
