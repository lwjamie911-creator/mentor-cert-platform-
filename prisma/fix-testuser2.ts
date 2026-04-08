/**
 * 把 testuser2 的所有学习/认证状态设置为已完成（培训课程 + 导师专区 + 新人专区）
 * 运行方式：POSTGRES_PRISMA_URL="..." POSTGRES_URL_NON_POOLING="..." npx tsx prisma/fix-testuser2.ts
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // ── 1. 找到 testuser2 ──────────────────────────────────────────────
  const user = await prisma.user.findUnique({
    where: { email: 'testuser2@example.com' },
  })
  if (!user) throw new Error('找不到 testuser2@example.com')
  console.log(`✅ 找到用户：${user.name}（${user.id}）`)

  // ── 2. 找到 testuser1（作为导师绑定）────────────────────────────
  const mentor = await prisma.user.findUnique({
    where: { email: 'testuser1@example.com' },
  })
  console.log(mentor
    ? `✅ 找到导师 testuser1：${mentor.name}（${mentor.email}）`
    : '⚠️  未找到 testuser1，将使用固定 wxId'
  )
  const mentorWxId = mentor ? mentor.email.split('@')[0] : 'testuser1'

  const completedAt = new Date('2025-12-15T10:00:00Z')
  const issuedAt    = new Date('2025-12-15T10:30:00Z')
  const expiresAt   = new Date('2026-12-15T10:30:00Z')

  // ════════════════════════════════════════════════════════════════════
  //  培训课程区
  // ════════════════════════════════════════════════════════════════════
  console.log('\n━━━ 培训课程区 ━━━')

  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    include: { chapters: true },
  })
  console.log(`✅ 找到 ${courses.length} 门已发布课程`)

  for (const course of courses) {
    console.log(`\n📚 处理课程：${course.title}`)

    // Enrollment（报名状态 → completed）
    await prisma.enrollment.upsert({
      where: { userId_courseId: { userId: user.id, courseId: course.id } },
      create: {
        userId: user.id,
        courseId: course.id,
        deadline: new Date('2026-12-31'),
        status: 'completed',
        enrolledAt: new Date('2025-11-01'),
        completedAt,
      },
      update: {
        status: 'completed',
        completedAt,
        deadline: new Date('2026-12-31'),
      },
    })
    console.log('  ✅ Enrollment → completed')

    // Progress（每个章节 → completed）
    for (const chapter of course.chapters) {
      await prisma.progress.upsert({
        where: { userId_chapterId: { userId: user.id, chapterId: chapter.id } },
        create: {
          userId: user.id,
          chapterId: chapter.id,
          status: 'completed',
          timeSpentSeconds: chapter.minReadSeconds + 30,
          startedAt: new Date('2025-12-10T09:00:00Z'),
          completedAt,
        },
        update: {
          status: 'completed',
          timeSpentSeconds: chapter.minReadSeconds + 30,
          startedAt: new Date('2025-12-10T09:00:00Z'),
          completedAt,
        },
      })
    }
    console.log(`  ✅ Progress → completed（${course.chapters.length} 个章节）`)

    // ExamAttempt（期末考试 → passed, 90分）
    const existingExam = await prisma.examAttempt.findFirst({
      where: { userId: user.id, courseId: course.id, examType: 'final' },
    })
    if (existingExam) {
      await prisma.examAttempt.update({
        where: { id: existingExam.id },
        data: { passed: true, score: 90, correctCount: 9, totalQuestions: 10, submittedAt: completedAt },
      })
    } else {
      await prisma.examAttempt.create({
        data: {
          userId: user.id,
          courseId: course.id,
          examType: 'final',
          score: 90,
          totalQuestions: 10,
          correctCount: 9,
          passThreshold: 60,
          passed: true,
          startedAt: new Date('2025-12-15T09:50:00Z'),
          submittedAt: completedAt,
        },
      })
    }
    console.log('  ✅ ExamAttempt → passed（90分）')

    // Certificate（证书）
    const certNo = `CERT-${user.id.slice(-6).toUpperCase()}-${course.id.slice(-4).toUpperCase()}`
    await prisma.certificate.upsert({
      where: { userId_courseId: { userId: user.id, courseId: course.id } },
      create: { userId: user.id, courseId: course.id, certificateNo: certNo, issuedAt, expiresAt },
      update: { issuedAt, expiresAt },
    })
    console.log(`  ✅ Certificate → 已颁发（${certNo}）`)
  }

  // ════════════════════════════════════════════════════════════════════
  //  导师专区
  // ════════════════════════════════════════════════════════════════════
  console.log('\n━━━ 导师专区 ━━━')

  // MentorSelfCheck（四项全勾选）
  await prisma.mentorSelfCheck.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      check1: true,
      check2: true,
      check3: true,
      check4: true,
      allDoneAt: new Date('2025-12-10T10:00:00Z'),
    },
    update: {
      check1: true,
      check2: true,
      check3: true,
      check4: true,
      allDoneAt: new Date('2025-12-10T10:00:00Z'),
    },
  })
  console.log('✅ MentorSelfCheck → check1~4 全部完成')

  // MentorCertificate（导师认证证书）
  const mentorCertNo = `MTOR-${user.id.slice(-8).toUpperCase()}`
  await prisma.mentorCertificate.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      certificateNo: mentorCertNo,
      score: 90,
      issuedAt,
      expiresAt,
    },
    update: {
      score: 90,
      issuedAt,
      expiresAt,
    },
  })
  console.log(`✅ MentorCertificate → 已颁发（${mentorCertNo}，90分）`)

  // ════════════════════════════════════════════════════════════════════
  //  新人专区
  // ════════════════════════════════════════════════════════════════════
  console.log('\n━━━ 新人专区 ━━━')

  const checkTime = new Date('2025-12-05T10:00:00Z')

  // NewbieChecklist（ABC 三项，自查 + 导师确认 全部完成）
  await prisma.newbieChecklist.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      mentorWxId,
      checkA_self: true, checkA_selfAt: checkTime,
      checkA_mentor: true, checkA_mentorAt: checkTime,
      checkB_self: true, checkB_selfAt: checkTime,
      checkB_mentor: true, checkB_mentorAt: checkTime,
      checkC_self: true, checkC_selfAt: checkTime,
      checkC_mentor: true, checkC_mentorAt: checkTime,
      allDoneAt: checkTime,
    },
    update: {
      mentorWxId,
      checkA_self: true, checkA_selfAt: checkTime,
      checkA_mentor: true, checkA_mentorAt: checkTime,
      checkB_self: true, checkB_selfAt: checkTime,
      checkB_mentor: true, checkB_mentorAt: checkTime,
      checkC_self: true, checkC_selfAt: checkTime,
      checkC_mentor: true, checkC_mentorAt: checkTime,
      allDoneAt: checkTime,
    },
  })
  console.log(`✅ NewbieChecklist → ABC 三项全部完成（导师：${mentorWxId}）`)

  // NewbieExam（知识测试 → passed, 90分）
  await prisma.newbieExam.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      score: 90,
      totalQuestions: 10,
      correctCount: 9,
      passed: true,
      submittedAt: new Date('2025-12-12T14:00:00Z'),
    },
    update: {
      score: 90,
      totalQuestions: 10,
      correctCount: 9,
      passed: true,
      submittedAt: new Date('2025-12-12T14:00:00Z'),
    },
  })
  console.log('✅ NewbieExam → passed（90分）')

  // NewbieBadge（成长勋章）
  const badgeNo = `BADGE-${user.id.slice(-8).toUpperCase()}`
  await prisma.newbieBadge.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      badgeNo,
      issuedAt,
    },
    update: {
      issuedAt,
    },
  })
  console.log(`✅ NewbieBadge → 已颁发（${badgeNo}）`)

  console.log('\n🎉 全部完成！testuser2 三个专区均已设为完成状态。')
}

main()
  .catch((e) => { console.error('❌ 出错：', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
