import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()
async function main() {
  const old = await p.learningMaterial.findMany({ where: { zone: 'newbie' } })
  console.log(`找到 newbie 材料 ${old.length} 条`)
  if (old.length > 0) {
    const ids = old.map(m => m.id)
    const del = await p.learningProgress.deleteMany({ where: { materialId: { in: ids } } })
    console.log(`删除进度记录 ${del.count} 条`)
    await p.learningMaterial.deleteMany({ where: { id: { in: ids } } })
    console.log(`删除 newbie 材料 ${old.length} 条`)
  }
  const remaining = await p.learningMaterial.findMany({ orderBy: { orderIndex: 'asc' } })
  console.log(`\n剩余材料 ${remaining.length} 条：`)
  remaining.forEach(m => console.log(`  [${m.zone}] ${m.orderIndex}. ${m.title}`))
}
main().catch(console.error).finally(() => p.$disconnect())
