/**
 * 清空生产库中所有 mentor/both zone 的旧学习材料，重新写入正确的4门课程
 * 运行：POSTGRES_PRISMA_URL="..." POSTGRES_URL_NON_POOLING="..." npx tsx prisma/cleanup-materials.ts
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
  // 1. 列出当前所有 mentor/both 材料
  const all = await prisma.learningMaterial.findMany({
    where: { zone: { in: ['mentor', 'both'] } },
  })
  console.log(`\n当前 mentor/both 材料共 ${all.length} 条：`)
  all.forEach(m => console.log(`  [${m.id.slice(0, 8)}] ${m.title}（zone=${m.zone}）`))

  // 2. 删除进度记录 + 材料
  if (all.length > 0) {
    const ids = all.map(m => m.id)
    const delProgress = await prisma.learningProgress.deleteMany({ where: { materialId: { in: ids } } })
    console.log(`\n删除进度记录 ${delProgress.count} 条`)
    await prisma.learningMaterial.deleteMany({ where: { id: { in: ids } } })
    console.log(`删除材料 ${all.length} 条`)
  }

  // 3. 重新写入正确的4门课程
  console.log('\n── 写入正确的4门导师必学课程 ──')
  for (const def of MENTOR_MATERIALS) {
    const m = await prisma.learningMaterial.create({ data: def as any })
    console.log(`  ✅ ${m.orderIndex}. ${m.title}`)
  }

  console.log('\n🎉 完成！')
}

main()
  .catch(e => { console.error('❌ 出错：', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
