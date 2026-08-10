export const dynamic = 'force-dynamic'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NewbieTabs } from './newbie-tabs'

export default async function NewbiePage() {
  const session = await getServerSession(authOptions)!

  const [exam, badge, materials, learningProgress, mentorPair, goalReview, review, classMeeting] = await Promise.all([
    prisma.newbieExam.findUnique({ where: { userId: session!.user.id } }),
    prisma.newbieBadge.findUnique({ where: { userId: session!.user.id } }),
    prisma.learningMaterial.findMany({
      where: { isPublished: true, zone: { in: ['newbie', 'both'] } },
      orderBy: [{ orderIndex: 'asc' }],
    }),
    prisma.learningProgress.findMany({ where: { userId: session!.user.id } }),
    prisma.mentorNewbiePair.findUnique({
      where: { newbieId: session!.user.id },
      include: { mentor: { select: { id: true, name: true } } },
    }),
    prisma.newbieGoalReview.findUnique({ where: { userId: session!.user.id } }),
    prisma.newbieReview.findUnique({ where: { userId: session!.user.id } }),
    prisma.classMeeting.findUnique({ where: { id: 'singleton' } }),
  ])

  const completedIds = new Set(learningProgress.map(p => p.materialId))
  const materialsWithProgress = materials.map(m => ({ ...m, completed: completedIds.has(m.id) }))
  const allMaterialsDone = materials.length === 0 || materialsWithProgress.every(m => m.completed)

  // 解析感言照片 JSON
  let reviewPhotos: string[] = []
  if (review?.photosJson) {
    try { reviewPhotos = JSON.parse(review.photosJson) } catch { reviewPhotos = [] }
  }

  // 导师的班会感言（若已配对导师）
  let mentorReview: { text: string; photos: string[] } | null = null
  if (mentorPair?.mentor.id) {
    const mr = await prisma.newbieReview.findUnique({ where: { userId: mentorPair.mentor.id } })
    if (mr) {
      let photos: string[] = []
      try { photos = mr.photosJson ? JSON.parse(mr.photosJson) : [] } catch { photos = [] }
      mentorReview = { text: mr.text ?? '', photos }
    }
  }

  return (
    <NewbieTabs
      userId={session!.user.id}
      userName={session!.user.name ?? ''}
      materials={materialsWithProgress}
      allMaterialsDone={allMaterialsDone}
      exam={exam ? {
        score: exam.score,
        correctCount: exam.correctCount,
        totalQuestions: exam.totalQuestions,
        passed: exam.passed,
      } : null}
      hasBadge={!!badge}
      mentor={mentorPair ? {
        isConfirmed: mentorPair.isConfirmed,
        mentorId: mentorPair.mentor.id,
        mentorName: mentorPair.mentor.name,
        mentorMessage: mentorPair.mentorMessage,
      } : null}
      goalReview={{
        workGoalUrl: goalReview?.workGoalUrl ?? null,
        month1Url: goalReview?.month1Url ?? null,
        month2Url: goalReview?.month2Url ?? null,
        month3Url: goalReview?.month3Url ?? null,
        workGoalFeedback: goalReview?.workGoalFeedback ?? null,
        month1Feedback: goalReview?.month1Feedback ?? null,
        month2Feedback: goalReview?.month2Feedback ?? null,
        month3Feedback: goalReview?.month3Feedback ?? null,
      }}
      review={{
        text: review?.text ?? '',
        photos: reviewPhotos,
      }}
      classMeeting={classMeeting && classMeeting.isPublished ? {
        title: classMeeting.title,
        timeText: classMeeting.timeText,
        location: classMeeting.location,
        description: classMeeting.description,
        posterBase64: classMeeting.posterBase64,
      } : null}
      mentorReview={mentorReview}
    />
  )
}
