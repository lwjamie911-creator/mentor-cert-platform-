import { prisma } from '@/lib/prisma'
import { ClassMeetingManager, type MeetingItem } from './class-meeting-manager'

export const dynamic = 'force-dynamic'

export default async function AdminClassMeetingPage() {
  const meetings = await prisma.classMeeting.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { reviews: true } } },
  })

  const items: MeetingItem[] = meetings.map(m => ({
    id: m.id,
    title: m.title,
    timeText: m.timeText,
    location: m.location,
    description: m.description,
    posterBase64: m.posterBase64,
    isPublished: m.isPublished,
    reviewCount: m._count.reviews,
  }))

  return (
    <div>
      <h1 className="font-display text-xl text-cocoa-900 mb-1">班会管理</h1>
      <p className="text-sm text-cocoa-500 mb-6">管理每一期班会预告，选择其中一期上架（同时只上架一期），历史班会全部保留；点「查看反馈」可查看该期所有导师与新人的班会感言</p>
      <ClassMeetingManager meetings={items} />
    </div>
  )
}
