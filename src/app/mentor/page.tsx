export const dynamic = 'force-dynamic'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { MentorTabs } from './mentor-tabs'
import type { ReviewData } from '../newbie/meeting-shared'

function parsePhotos(json: string | null): string[] {
  if (!json) return []
  try { return JSON.parse(json) } catch { return [] }
}

export default async function MentorPage() {
  const session = await getServerSession(authOptions)!

  const [selfCheck, mentorCert, pairs, allMaterials, learningProgress, mentorProfile, classMeeting, ownReviewRow] = await Promise.all([
    prisma.mentorSelfCheck.findUnique({ where: { userId: session!.user.id } }),
    prisma.mentorCertificate.findUnique({ where: { userId: session!.user.id } }),
    prisma.mentorNewbiePair.findMany({
      where: { mentorId: session!.user.id, isConfirmed: true },
      include: {
        newbie: {
          select: {
            id: true, name: true, email: true,
            newbieExam: true,
            newbieBadge: true,
          },
        },
      },
    }),
    prisma.learningMaterial.findMany({
      where: { isPublished: true, zone: { in: ['mentor', 'newbie', 'both'] } },
      orderBy: [{ orderIndex: 'asc' }],
    }),
    prisma.learningProgress.findMany({ where: { userId: session!.user.id } }),
    prisma.mentorProfile.findUnique({ where: { userId: session!.user.id } }),
    prisma.classMeeting.findUnique({ where: { id: 'singleton' } }),
    prisma.newbieReview.findUnique({ where: { userId: session!.user.id } }),
  ])

  // 导师必学：mentor + both
  const materials = allMaterials.filter(m => m.zone === 'mentor' || m.zone === 'both')
  // 新人必修（用于计算名下新人学习进度）：newbie + both
  const newbieMaterials = allMaterials.filter(m => m.zone === 'newbie' || m.zone === 'both')

  const selfCheckDone = !!(selfCheck?.check1 && selfCheck?.check2 && selfCheck?.check3 && selfCheck?.check4)
  const completedIds  = new Set(learningProgress.map(p => p.materialId))
  const materialsWithProgress = materials.map(m => ({ ...m, completed: completedIds.has(m.id) }))
  const allMaterialsDone = materials.length === 0 || materialsWithProgress.every(m => m.completed)

  const newbiesDone = pairs
    .filter(p => p.newbie.newbieBadge && p.newbie.newbieExam?.passed)
    .map(p => ({ pairId: p.id, name: p.newbie.name }))

  // 名下新人的：学习进度 + 工作目标/月报 + 感言
  const newbieIds = pairs.map(p => p.newbie.id)
  const newbieMaterialIds = new Set(newbieMaterials.map(m => m.id))
  const [allNewbieProgress, newbieGoalReviews, newbieReviews] = newbieIds.length > 0
    ? await Promise.all([
        prisma.learningProgress.findMany({
          where: { userId: { in: newbieIds }, materialId: { in: Array.from(newbieMaterialIds) } },
          select: { userId: true, materialId: true },
        }),
        prisma.newbieGoalReview.findMany({ where: { userId: { in: newbieIds } } }),
        prisma.newbieReview.findMany({ where: { userId: { in: newbieIds } } }),
      ])
    : [[], [], []]

  const newbieProgressMap = new Map<string, Set<string>>()
  for (const p of allNewbieProgress) {
    if (!newbieProgressMap.has(p.userId)) newbieProgressMap.set(p.userId, new Set())
    newbieProgressMap.get(p.userId)!.add(p.materialId)
  }
  const goalReviewMap = new Map(newbieGoalReviews.map(g => [g.userId, g]))
  const reviewMap = new Map(newbieReviews.map(r => [r.userId, r]))

  const pairsData = pairs.map(p => {
    const gr = goalReviewMap.get(p.newbie.id)
    const rv = reviewMap.get(p.newbie.id)
    const review: ReviewData | null = rv ? { text: rv.text ?? '', photos: parsePhotos(rv.photosJson) } : null
    return {
      id: p.id,
      newbieId: p.newbie.id,
      newbieName: p.newbie.name,
      newbieEmail: p.newbie.email,
      exam: p.newbie.newbieExam ? {
        score: p.newbie.newbieExam.score,
        correctCount: p.newbie.newbieExam.correctCount,
        totalQuestions: p.newbie.newbieExam.totalQuestions,
        passed: p.newbie.newbieExam.passed,
      } : null,
      badge: p.newbie.newbieBadge,
      learningProgress: {
        completed: newbieProgressMap.get(p.newbie.id)?.size ?? 0,
        total: newbieMaterialIds.size,
      },
      goalReview: {
        workGoalUrl: gr?.workGoalUrl ?? null,
        month1Url: gr?.month1Url ?? null,
        month2Url: gr?.month2Url ?? null,
        month3Url: gr?.month3Url ?? null,
        workGoalFeedback: gr?.workGoalFeedback ?? null,
        month1Feedback: gr?.month1Feedback ?? null,
        month2Feedback: gr?.month2Feedback ?? null,
        month3Feedback: gr?.month3Feedback ?? null,
      },
      review,
    }
  })

  const ownReview: ReviewData = ownReviewRow
    ? { text: ownReviewRow.text ?? '', photos: parsePhotos(ownReviewRow.photosJson) }
    : { text: '', photos: [] }

  return (
    <MentorTabs
      userId={session!.user.id}
      userName={session!.user.name ?? ''}
      selfCheck={selfCheck ? {
        check1: selfCheck.check1,
        check2: selfCheck.check2,
        check3: selfCheck.check3,
        check4: selfCheck.check4,
      } : null}
      selfCheckDone={selfCheckDone}
      materials={materialsWithProgress}
      allMaterialsDone={allMaterialsDone}
      mentorCert={mentorCert ? {
        score: mentorCert.score,
        expiresAt: mentorCert.expiresAt.toISOString(),
      } : null}
      mentorProfile={mentorProfile ? {
        yearsOfExperience: mentorProfile.yearsOfExperience,
        projectExperience: mentorProfile.projectExperience,
        highlights: mentorProfile.highlights,
        photoBase64: mentorProfile.photoBase64,
      } : null}
      pairs={pairsData}
      newbiesDone={newbiesDone}
      classMeeting={classMeeting && classMeeting.isPublished ? {
        title: classMeeting.title,
        timeText: classMeeting.timeText,
        location: classMeeting.location,
        description: classMeeting.description,
        posterBase64: classMeeting.posterBase64,
      } : null}
      ownReview={ownReview}
    />
  )
}
