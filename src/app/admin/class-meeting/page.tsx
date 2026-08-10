import { prisma } from '@/lib/prisma'
import { ClassMeetingManager } from './class-meeting-manager'

export const dynamic = 'force-dynamic'

export default async function AdminClassMeetingPage() {
  const meeting = await prisma.classMeeting.findUnique({ where: { id: 'singleton' } })

  return (
    <div>
      <h1 className="font-display text-xl text-cocoa-900 mb-1">班会预告管理</h1>
      <p className="text-sm text-cocoa-500 mb-6">编辑新人专区「目标复盘」中展示的班会预告信息与海报</p>
      <ClassMeetingManager
        initial={meeting ? {
          title: meeting.title,
          timeText: meeting.timeText,
          location: meeting.location,
          description: meeting.description,
          posterBase64: meeting.posterBase64,
          isPublished: meeting.isPublished,
        } : null}
      />
    </div>
  )
}
