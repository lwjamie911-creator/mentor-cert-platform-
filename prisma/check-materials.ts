import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()
async function main() {
  const all = await p.learningMaterial.findMany({ orderBy: { orderIndex: 'asc' } })
  console.log('LearningMaterial 全部记录：', all.length, '条')
  all.forEach(m => console.log(`  [${m.zone}] ${m.orderIndex}. ${m.title} | contentType=${m.contentType} | published=${m.isPublished}`))
}
main().catch(console.error).finally(() => p.$disconnect())
