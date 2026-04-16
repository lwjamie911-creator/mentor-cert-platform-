import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import * as XLSX from 'xlsx'

async function checkAdmin() {
  const session = await getServerSession(authOptions)
  return session?.user.role === 'admin' ? session : null
}

const typeMap: Record<string, string> = {
  '连线题': 'matching',
  '多选题': 'multiple',
  '单选题': 'single',
  '判断题': 'truefalse',
}

export async function POST(req: Request) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: '未上传文件' }, { status: 400 })

    // 读取 zone 参数，默认 mentor（向后兼容）
    const zoneParam = formData.get('zone')
    const zone = zoneParam === 'newbie' ? 'newbie' : 'mentor'

    const arrayBuffer = await file.arrayBuffer()
    const wb = XLSX.read(arrayBuffer, { type: 'array' })
    const ws = wb.Sheets[wb.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1 }) as string[][]

    // 跳过表头行（第一行）
    const dataRows = rows.slice(1).filter(r => r[0] && r[1] && r[2])

    const questions: { type: string; content: string; options: string; answer: string; zone: string }[] = []
    const errors: string[] = []

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i]
      const rowNum = i + 2 // 实际Excel行号
      const typeCN = String(row[1] ?? '').trim()
      const type = typeMap[typeCN]
      if (!type) {
        errors.push(`第${rowNum}行：题型"${typeCN}"无效，应为连线题/多选题/单选题/判断题`)
        continue
      }

      const content = String(row[2] ?? '').trim()
      const optRaw = String(row[3] ?? '').trim()
      const ansRaw = String(row[4] ?? '').trim()

      if (!content || !optRaw || !ansRaw) {
        errors.push(`第${rowNum}行：题目、选项或答案为空`)
        continue
      }

      if (type === 'matching') {
        // 连线题：选项和答案都是换行分隔
        const opts = optRaw.split('\n').map(s => s.trim()).filter(Boolean)
        const ans = ansRaw.split('\n').map(s => s.trim()).filter(Boolean)
        if (opts.length !== ans.length) {
          errors.push(`第${rowNum}行（连线题）：左侧选项${opts.length}项与右侧答案${ans.length}项数量不一致`)
          continue
        }
        questions.push({ type, content, options: JSON.stringify(opts), answer: JSON.stringify(ans), zone })
      } else {
        // 选择/判断题：选项是 "A. xxx\nB. xxx" 格式，去掉前缀
        const opts = optRaw.split('\n').map(s => s.trim()).filter(Boolean)
          .map(s => s.replace(/^[A-D][.．、。]\s*/, ''))
        // 答案：A、B、C 或 A 格式
        const ans = ansRaw.split(/[、，,]/).map(s => s.trim().toUpperCase()).filter(Boolean)
        if (opts.length === 0) {
          errors.push(`第${rowNum}行：选项为空`)
          continue
        }
        questions.push({ type, content, options: JSON.stringify(opts), answer: JSON.stringify(ans), zone })
      }
    }

    if (errors.length > 0) {
      return NextResponse.json({ error: '文件格式有误', details: errors }, { status: 400 })
    }

    if (questions.length === 0) {
      return NextResponse.json({ error: '未解析到任何题目，请检查文件格式' }, { status: 400 })
    }

    // 检查必须有连线题和多选题
    const hasMatching = questions.some(q => q.type === 'matching')
    const hasMultiple = questions.some(q => q.type === 'multiple')
    if (!hasMatching) return NextResponse.json({ error: '题库中必须包含至少1道连线题' }, { status: 400 })
    if (!hasMultiple) return NextResponse.json({ error: '题库中必须包含至少1道多选题' }, { status: 400 })

    // 替换对应专区的全部题目
    await prisma.question.deleteMany({ where: { zone } })
    await prisma.question.createMany({ data: questions })

    const counts = questions.reduce((acc, q) => {
      acc[q.type] = (acc[q.type] ?? 0) + 1
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      success: true,
      total: questions.length,
      counts,
      message: `成功导入 ${questions.length} 道题目（${zone === 'newbie' ? '新人专区' : '导师专区'}）`,
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: '文件解析失败，请检查格式是否正确' }, { status: 500 })
  }
}
