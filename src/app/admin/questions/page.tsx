export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { QuestionBankClient } from './client'

export default async function QuestionBankPage() {
  const [mentorQuestions, newbieQuestions] = await Promise.all([
    prisma.question.findMany({
      where: { zone: 'mentor' },
      orderBy: [{ type: 'asc' }],
    }),
    prisma.question.findMany({
      where: { zone: 'newbie' },
      orderBy: [{ type: 'asc' }],
    }),
  ])

  function buildCounts(qs: typeof mentorQuestions) {
    return {
      matching:  qs.filter(q => q.type === 'matching').length,
      multiple:  qs.filter(q => q.type === 'multiple').length,
      single:    qs.filter(q => q.type === 'single').length,
      truefalse: qs.filter(q => q.type === 'truefalse').length,
      total:     qs.length,
    }
  }

  function buildPreview(qs: typeof mentorQuestions) {
    return qs.map(q => ({
      id: q.id,
      type: q.type,
      content: q.content,
      optCount: (JSON.parse(q.options) as string[]).length,
    }))
  }

  return (
    <QuestionBankClient
      mentorCounts={buildCounts(mentorQuestions)}
      mentorPreview={buildPreview(mentorQuestions)}
      newbieCounts={buildCounts(newbieQuestions)}
      newbiePreview={buildPreview(newbieQuestions)}
    />
  )
}
