import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import * as XLSX from 'xlsx'

async function checkAdmin() {
  const session = await getServerSession(authOptions)
  return session?.user.role === 'admin' ? session : null
}

// 从企业微信ID中提取姓名
// 例：jamielv(吕雯) → { wxId: 'jamielv', name: '吕雯' }
// 例：jamielv → { wxId: 'jamielv', name: 'jamielv' }
function parseWxId(raw: string): { wxId: string; name: string } {
  const match = raw.match(/^([^\(（]+)[(\（](.+)[)\）]$/)
  if (match) {
    return { wxId: match[1].trim(), name: match[2].trim() }
  }
  return { wxId: raw.trim(), name: raw.trim() }
}

export async function POST(req: Request) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: '请上传文件' }, { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())
  const workbook = XLSX.read(buffer, { type: 'buffer' })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' })

  const results: { email: string; name: string; status: 'created' | 'skipped' | 'error'; reason?: string }[] = []

  for (const row of rows) {
    const wxIdRaw = (row['完整企业微信ID'] || row['企业微信ID'] || row['wxId'] || '').toString().trim()
    const email = (row['公司邮箱'] || row['邮箱'] || row['email'] || '').toString().trim().toLowerCase()

    if (!wxIdRaw || !email) {
      results.push({ email: email || '(空)', name: wxIdRaw || '(空)', status: 'error', reason: '企业微信ID或邮箱为空' })
      continue
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      results.push({ email, name: wxIdRaw, status: 'error', reason: '邮箱格式不正确' })
      continue
    }

    const { wxId, name } = parseWxId(wxIdRaw)

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      results.push({ email, name, status: 'skipped', reason: '邮箱已存在' })
      continue
    }

    // 初始密码 = 123456
    const hashed = await bcrypt.hash('123456', 10)

    await prisma.user.create({
      data: { name, email, password: hashed, status: 'active' },
    })
    results.push({ email, name, status: 'created' })
  }

  const created = results.filter((r) => r.status === 'created').length
  const skipped = results.filter((r) => r.status === 'skipped').length
  const errors = results.filter((r) => r.status === 'error').length

  return NextResponse.json({ created, skipped, errors, results })
}
