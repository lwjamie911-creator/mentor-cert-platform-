import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import * as XLSX from 'xlsx'

async function checkAdmin() {
  const session = await getServerSession(authOptions)
  return session?.user.role === 'admin' ? session : null
}

export async function GET(req: Request) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const zone = searchParams.get('zone') === 'newbie' ? 'newbie' : 'mentor'
  const sheetLabel = zone === 'newbie' ? '新人专区题库' : '导师认证题库'
  const fileLabel  = zone === 'newbie' ? '%E6%96%B0%E4%BA%BA%E4%B8%93%E5%8C%BA%E9%A2%98%E5%BA%93' : '%E5%AF%BC%E5%B8%88%E8%AE%A4%E8%AF%81%E9%A2%98%E5%BA%93'

  const questions = await prisma.question.findMany({
    where: { zone },
    orderBy: [{ type: 'asc' }],
  })

  const typeOrder = { matching: 0, multiple: 1, single: 2, truefalse: 3 }
  const typeLabel: Record<string, string> = {
    matching: '连线题',
    multiple: '多选题',
    single: '单选题',
    truefalse: '判断题',
  }

  const rows: (string | number)[][] = [
    ['序号', '题型', '题目', '选项（每行一个，连线题填左侧项）', '正确答案（连线题填右侧项，顺序与左侧对应；其他填A/B/C/D）'],
  ]

  let idx = 1
  for (const q of questions.sort((a, b) =>
    (typeOrder[a.type as keyof typeof typeOrder] ?? 9) - (typeOrder[b.type as keyof typeof typeOrder] ?? 9)
  )) {
    const opts: string[] = JSON.parse(q.options)
    const ans: string[] = JSON.parse(q.answer)

    if (q.type === 'matching') {
      rows.push([idx++, typeLabel[q.type] ?? q.type, q.content, opts.join('\n'), ans.join('\n')])
    } else {
      const optLetters = ['A', 'B', 'C', 'D']
      const optsFormatted = opts.map((o, i) => `${optLetters[i]}. ${o}`).join('\n')
      rows.push([idx++, typeLabel[q.type] ?? q.type, q.content, optsFormatted, ans.join('、')])
    }
  }

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet(rows)

  // 列宽
  ws['!cols'] = [{ wch: 6 }, { wch: 10 }, { wch: 50 }, { wch: 55 }, { wch: 55 }]
  // 自动换行
  ws['!rows'] = rows.map(() => ({ hpt: 60 }))

  XLSX.utils.book_append_sheet(wb, ws, sheetLabel)

  // 说明sheet
  const infoRows = [
    ['说明', ''],
    ['导出时间', new Date().toLocaleString('zh-CN')],
    ['专区', zone === 'newbie' ? '新人专区' : '导师专区'],
    ['题目总数', questions.length],
    ['', ''],
    ['题型', '数量'],
    ['连线题', questions.filter(q => q.type === 'matching').length],
    ['多选题', questions.filter(q => q.type === 'multiple').length],
    ['单选题', questions.filter(q => q.type === 'single').length],
    ['判断题', questions.filter(q => q.type === 'truefalse').length],
    ['', ''],
    ['考试规则', '每次随机抽取10题（必含1道连线题 + 1道多选题 + 8道单选/判断题）'],
    ['通过标准', '答对率≥80%（10题需答对8题及以上）'],
    ['', ''],
    ['上传格式说明', ''],
    ['列顺序', '序号 / 题型 / 题目 / 选项 / 正确答案'],
    ['题型填写', '连线题 / 多选题 / 单选题 / 判断题'],
    ['选项格式（连线/多选/单选/判断）', '每个选项用换行分隔，连线题左侧项对应右侧答案项（顺序一致）'],
    ['答案格式（非连线题）', '填字母，多选题用顿号分隔，如：A、B、C'],
    ['答案格式（连线题）', '右侧匹配项，每行一个，顺序与左侧选项对应'],
  ]
  const wsInfo = XLSX.utils.aoa_to_sheet(infoRows)
  wsInfo['!cols'] = [{ wch: 30 }, { wch: 60 }]
  XLSX.utils.book_append_sheet(wb, wsInfo, '说明')

  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename*=UTF-8''${fileLabel}-${new Date().toISOString().slice(0, 10)}.xlsx`,
    },
  })
}
