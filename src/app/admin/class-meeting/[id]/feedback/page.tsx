import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Megaphone, Clock, MapPin, GraduationCap, Sprout, MessageSquare } from 'lucide-react'

export const dynamic = 'force-dynamic'

function parsePhotos(json: string | null): string[] {
  if (!json) return []
  try { return JSON.parse(json) } catch { return [] }
}

export default async function MeetingFeedbackPage({ params }: { params: { id: string } }) {
  const meeting = await prisma.classMeeting.findUnique({ where: { id: params.id } })
  if (!meeting) notFound()

  const reviews = await prisma.newbieReview.findMany({
    where: { meetingId: params.id },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { updatedAt: 'desc' },
  })

  // 用配对关系判断作者身份：作为导师出现在任意配对 = 导师
  const authorIds = reviews.map(r => r.user.id)
  const mentorPairs = authorIds.length
    ? await prisma.mentorNewbiePair.findMany({
        where: { mentorId: { in: authorIds } },
        select: { mentorId: true },
      })
    : []
  const mentorIdSet = new Set(mentorPairs.map(p => p.mentorId))

  const items = reviews.map(r => ({
    id: r.id,
    name: r.user.name,
    email: r.user.email,
    isMentor: mentorIdSet.has(r.user.id),
    text: r.text ?? '',
    photos: parsePhotos(r.photosJson),
    updatedAt: r.updatedAt,
  }))

  const mentorReviews = items.filter(i => i.isMentor)
  const newbieReviews = items.filter(i => !i.isMentor)

  return (
    <div className="space-y-6">
      {/* 返回 */}
      <Link href="/admin/class-meeting" className="inline-flex items-center gap-1 text-sm text-cocoa-500 hover:text-cocoa-900 transition-colors">
        <ArrowLeft className="w-4 h-4" strokeWidth={2} /> 返回班会管理
      </Link>

      {/* 班会信息头 */}
      <div className="bg-paper rounded-2xl border border-line shadow-card p-5 flex items-start gap-4">
        {meeting.posterBase64 ? (
          <img src={meeting.posterBase64} alt="海报" className="w-16 h-22 object-cover rounded-lg border border-line flex-shrink-0" />
        ) : (
          <div className="w-16 h-22 rounded-lg bg-cocoa-50 border border-line flex items-center justify-center text-cocoa-300 flex-shrink-0">
            <Megaphone className="w-5 h-5" strokeWidth={1.5} />
          </div>
        )}
        <div className="min-w-0">
          <h1 className="font-display text-lg text-cocoa-900">{meeting.title}</h1>
          <div className="mt-1.5 space-y-1 text-xs text-cocoa-500">
            <p className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" strokeWidth={2} />{meeting.timeText}</p>
            <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" strokeWidth={2} />{meeting.location}</p>
          </div>
          <p className="mt-2 text-xs text-cocoa-400">共 {items.length} 条反馈 · 导师 {mentorReviews.length} 条 · 新人 {newbieReviews.length} 条</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="bg-paper rounded-2xl border border-line shadow-card p-10 flex flex-col items-center gap-2 text-cocoa-400">
          <MessageSquare className="w-8 h-8" strokeWidth={1.5} />
          <p className="text-sm">这一期还没有人提交班会感言～</p>
        </div>
      ) : (
        <>
          <FeedbackGroup title="导师反馈" icon={<GraduationCap className="w-4 h-4" strokeWidth={2} />} items={mentorReviews} emptyHint="暂无导师反馈" />
          <FeedbackGroup title="新人反馈" icon={<Sprout className="w-4 h-4" strokeWidth={2} />} items={newbieReviews} emptyHint="暂无新人反馈" />
        </>
      )}
    </div>
  )
}

function FeedbackGroup({
  title, icon, items, emptyHint,
}: {
  title: string
  icon: React.ReactNode
  items: { id: string; name: string; email: string; text: string; photos: string[]; updatedAt: Date }[]
  emptyHint: string
}) {
  return (
    <section className="bg-paper rounded-2xl border border-line shadow-card overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-line/70">
        <span className="w-9 h-9 rounded-lg bg-blush/60 flex items-center justify-center text-sienna flex-shrink-0">{icon}</span>
        <h2 className="font-display font-semibold text-cocoa-900 text-[15px]">{title}（{items.length}）</h2>
      </div>
      <div className="px-5 sm:px-6 py-5">
        {items.length === 0 ? (
          <p className="text-sm text-cocoa-400 py-4 text-center">{emptyHint}</p>
        ) : (
          <div className="space-y-5">
            {items.map(it => (
              <div key={it.id} className="border border-line rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-cocoa-100 flex items-center justify-center text-cocoa-700 font-bold text-xs">{it.name?.[0] ?? '?'}</span>
                    <div className="leading-tight">
                      <p className="text-sm font-medium text-cocoa-900">{it.name}</p>
                      <p className="text-[11px] text-cocoa-400">{it.email}</p>
                    </div>
                  </div>
                  <span className="text-[11px] text-cocoa-400">{it.updatedAt.toLocaleString('zh-CN')}</span>
                </div>
                {it.text.trim() && (
                  <p className="text-sm text-cocoa-700 leading-relaxed whitespace-pre-wrap bg-blush/30 rounded-xl px-4 py-3">{it.text}</p>
                )}
                {it.photos.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {it.photos.map((p, i) => (
                      <a key={i} href={p} target="_blank" rel="noopener noreferrer" className="aspect-square">
                        <img src={p} alt={`配图 ${i + 1}`} className="w-full h-full object-cover rounded-lg border border-line hover:opacity-90 transition-opacity" />
                      </a>
                    ))}
                  </div>
                )}
                {!it.text.trim() && it.photos.length === 0 && (
                  <p className="text-xs text-cocoa-400">（空白提交）</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
