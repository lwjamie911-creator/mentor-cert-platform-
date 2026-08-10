/**
 * 把 jamielv@tencent.com 的所有学习/认证状态设置为已完成
 * 运行方式：
 *   POSTGRES_PRISMA_URL="..." POSTGRES_URL_NON_POOLING="..." npx tsx prisma/setup-jamielv.ts
 * 或直接：
 *   npx dotenv -e .env.vercel.local -- npx tsx prisma/setup-jamielv.ts
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // ── 1. 找到 jamielv ──────────────────────────────────────────────
  const user = await prisma.user.findUnique({
    where: { email: 'jamielv@tencent.com' },
  })
  if (!user) throw new Error('找不到 jamielv@tencent.com')
  console.log(`✅ 找到用户：${user.name}（${user.id}）`)

  const completedAt = new Date('2025-12-15T10:00:00Z')
  const issuedAt    = new Date('2025-12-15T10:30:00Z')
  const expiresAt   = new Date('2026-12-15T10:30:00Z')

  // ════════════════════════════════════════════════════════════════════
  //  导师专区：学习材料阅读进度
  // ════════════════════════════════════════════════════════════════════
  console.log('\n━━━ 导师专区学习材料 ━━━')

  const mentorMaterials = await prisma.learningMaterial.findMany({
    where: { zone: 'mentor', isPublished: true },
  })
  console.log(`✅ 找到 ${mentorMaterials.length} 篇导师学习材料`)

  for (const mat of mentorMaterials) {
    await prisma.learningProgress.upsert({
      where: { userId_materialId: { userId: user.id, materialId: mat.id } },
      create: {
        userId: user.id,
        materialId: mat.id,
        completedAt,
      },
      update: {
        completedAt,
      },
    })
    console.log(`  ✅ 学习材料已读：${mat.title}`)
  }

  // ════════════════════════════════════════════════════════════════════
  //  导师专区：自检 + 认证证书
  // ════════════════════════════════════════════════════════════════════
  console.log('\n━━━ 导师专区自检 & 证书 ━━━')

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

  console.log('\n🎉 全部完成！jamielv@tencent.com 导师专区已设为全部完成状态。')
  console.log(`   证书编号：${mentorCertNo}`)
  console.log(`   颁发日期：2025年12月15日`)
  console.log(`   有效期至：2026年12月15日`)
  console.log(`\n   访问 https://mentor-cert-platform.vercel.app/mentor/certificate 查看证书`)
}

main()
  .catch((e) => { console.error('❌ 出错：', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
