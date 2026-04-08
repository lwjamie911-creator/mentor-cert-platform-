/**
 * 写入示例学习资料，并将 testuser2 的阅读进度标记为已完成
 * 运行方式：POSTGRES_PRISMA_URL="..." POSTGRES_URL_NON_POOLING="..." npx tsx prisma/seed-materials.ts
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // ── 找到 testuser2 ────────────────────────────────────────
  const user = await prisma.user.findUnique({ where: { email: 'testuser2@example.com' } })
  if (!user) throw new Error('找不到 testuser2@example.com')
  console.log(`✅ 找到用户：${user.name}（${user.id}）`)

  // ── 写入导师专区必学资料（zone: mentor）──────────────────
  const mentorMaterials = [
    {
      title: 'TEG 秘书中心导师职责与规范',
      subject: '导师专项',
      zone: 'mentor',
      contentType: 'external_link',
      contentUrl: 'https://docs.qq.com/doc/placeholder1',
      minReadSeconds: 600,
      orderIndex: 1,
    },
    {
      title: '新人带教方法论与实战技巧',
      subject: '导师专项',
      zone: 'mentor',
      contentType: 'external_link',
      contentUrl: 'https://docs.qq.com/doc/placeholder2',
      minReadSeconds: 600,
      orderIndex: 2,
    },
    {
      title: '导师常见问题 Q&A 手册',
      subject: '通用基础',
      zone: 'mentor',
      contentType: 'external_link',
      contentUrl: 'https://docs.qq.com/doc/placeholder3',
      minReadSeconds: 300,
      orderIndex: 3,
    },
  ]

  // ── 写入新人专区必学资料（zone: newbie）──────────────────
  const newbieMaterials = [
    {
      title: 'TEG 秘书中心新人入职手册',
      subject: '新人入职',
      zone: 'newbie',
      contentType: 'external_link',
      contentUrl: 'https://docs.qq.com/doc/placeholder4',
      minReadSeconds: 600,
      orderIndex: 1,
    },
    {
      title: '办公室日常工作规范与流程',
      subject: '通用基础',
      zone: 'newbie',
      contentType: 'external_link',
      contentUrl: 'https://docs.qq.com/doc/placeholder5',
      minReadSeconds: 600,
      orderIndex: 2,
    },
    {
      title: '会议与接待礼仪标准',
      subject: '通用基础',
      zone: 'newbie',
      contentType: 'external_link',
      contentUrl: 'https://docs.qq.com/doc/placeholder6',
      minReadSeconds: 300,
      orderIndex: 3,
    },
  ]

  const allMaterialDefs = [...mentorMaterials, ...newbieMaterials]

  console.log('\n── 写入学习资料 ──')
  const createdMaterials: { id: string; title: string }[] = []

  for (const def of allMaterialDefs) {
    // 按 title + zone 查重，避免重复写入
    const existing = await prisma.learningMaterial.findFirst({
      where: { title: def.title, zone: def.zone },
    })
    if (existing) {
      console.log(`  ⏩ 已存在，跳过：${def.title}`)
      createdMaterials.push({ id: existing.id, title: existing.title })
    } else {
      const m = await prisma.learningMaterial.create({ data: def })
      console.log(`  ✅ 创建：${m.title}（${m.zone}，${m.id}）`)
      createdMaterials.push({ id: m.id, title: m.title })
    }
  }

  // ── 为 testuser2 标记全部已读 ─────────────────────────────
  console.log('\n── 为 testuser2 标记阅读进度 ──')
  for (const mat of createdMaterials) {
    await prisma.learningProgress.upsert({
      where: { userId_materialId: { userId: user.id, materialId: mat.id } },
      create: {
        userId: user.id,
        materialId: mat.id,
        completedAt: new Date('2025-12-14T10:00:00Z'),
      },
      update: {
        completedAt: new Date('2025-12-14T10:00:00Z'),
      },
    })
    console.log(`  ✅ LearningProgress → 已完成：${mat.title}`)
  }

  console.log('\n🎉 完成！学习资料已写入，testuser2 全部标记为已读。')
}

main()
  .catch((e) => { console.error('❌ 出错：', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
