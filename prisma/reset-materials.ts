/**
 * 清空旧的学习资料，写入正确的4门导师必学课程，并为 testuser2 标记全部完成
 * 运行方式：POSTGRES_PRISMA_URL="..." POSTGRES_URL_NON_POOLING="..." npx tsx prisma/reset-materials.ts
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const MENTOR_MATERIALS = [
  {
    title: '腾讯部门秘书职责',
    subject: '岗位认知',
    zone: 'mentor',
    contentType: 'pdf',
    contentUrl: '/materials/dept-secretary-duties.pdf',
    contentText: null,
    minReadSeconds: 600,
    orderIndex: 1,
    isPublished: true,
  },
  {
    title: 'TEG秘书中心白皮书',
    subject: '岗位必知',
    zone: 'mentor',
    contentType: 'external_link',
    contentUrl: 'https://doc.weixin.qq.com/doc/w3_AesARwZHAPUGXOKpxfUQ0KcOitiNr?scode=AJEAIQdfAAo0WyHS1yAIUAqgZGACg',
    contentText: null,
    minReadSeconds: 600,
    orderIndex: 2,
    isPublished: true,
  },
  {
    title: '腾讯新员工导师手册',
    subject: '导师必读',
    zone: 'mentor',
    contentType: 'external_link',
    contentUrl: 'https://portal.learn.woa.com/training/mooc/taskDetail?mooc_course_id=458&task_id=18614&from=mooc',
    contentText: null,
    minReadSeconds: 600,
    orderIndex: 3,
    isPublished: true,
  },
  {
    title: '锁定未来之星——实习生考察与保温指南',
    subject: '导师技能',
    zone: 'mentor',
    contentType: 'external_link',
    contentUrl: 'https://portal.learn.woa.com/training/mooc/taskDetail?mooc_course_id=458&task_id=131726&from=mooc',
    contentText: null,
    minReadSeconds: 600,
    orderIndex: 4,
    isPublished: true,
  },
]

async function main() {
  // 找到 testuser2
  const user = await prisma.user.findUnique({ where: { email: 'testuser2@example.com' } })
  if (!user) throw new Error('找不到 testuser2@example.com')
  console.log(`✅ 找到用户：${user.name}（${user.id}）`)

  // 删除所有 mentor/both zone 的旧材料（先删进度记录）
  console.log('\n── 清理旧 mentor 材料 ──')
  const oldMaterials = await prisma.learningMaterial.findMany({
    where: { zone: { in: ['mentor', 'both'] } },
  })
  console.log(`  找到 ${oldMaterials.length} 条旧材料`)
  if (oldMaterials.length > 0) {
    const oldIds = oldMaterials.map(m => m.id)
    const deleted = await prisma.learningProgress.deleteMany({
      where: { materialId: { in: oldIds } },
    })
    console.log(`  删除进度记录 ${deleted.count} 条`)
    await prisma.learningMaterial.deleteMany({
      where: { id: { in: oldIds } },
    })
    console.log(`  删除材料 ${oldMaterials.length} 条`)
  }

  // 写入正确的4门课程
  console.log('\n── 写入正确的4门导师必学课程 ──')
  const created: { id: string; title: string }[] = []
  for (const def of MENTOR_MATERIALS) {
    const m = await prisma.learningMaterial.create({ data: def as any })
    console.log(`  ✅ 创建：${m.title}（${m.contentType}）`)
    created.push({ id: m.id, title: m.title })
  }

  // 为 testuser2 标记全部已读
  console.log('\n── 为 testuser2 标记阅读进度 ──')
  for (const mat of created) {
    await prisma.learningProgress.create({
      data: {
        userId: user.id,
        materialId: mat.id,
        completedAt: new Date('2025-12-14T10:00:00Z'),
      },
    })
    console.log(`  ✅ 已完成：${mat.title}`)
  }

  console.log('\n🎉 完成！导师必学课程已重置为正确内容，testuser2 全部标记为已读。')
}

main()
  .catch(e => { console.error('❌ 出错：', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
