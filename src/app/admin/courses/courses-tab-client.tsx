'use client'

import { useState } from 'react'
import { MentorCoursesManager } from './mentor-courses-manager'
import { NewbieCoursesManager } from './newbie-courses-manager'
import { GraduationCap, Sprout } from 'lucide-react'

interface Material {
  id: string
  title: string
  subject: string
  zone: string
  contentType: string
  contentUrl: string | null
  contentText: string | null
  minReadSeconds: number
  orderIndex: number
  isPublished: boolean
  _count?: { progress: number }
}

export function CoursesTabClient({
  mentorMaterials,
  newbieMaterials,
}: {
  mentorMaterials: Material[]
  newbieMaterials: Material[]
}) {
  const [tab, setTab] = useState<'mentor' | 'newbie'>('mentor')

  return (
    <>
      {/* 标签页切换 */}
      <div className="flex gap-2 border-b border-line pb-0">
        <button
          onClick={() => setTab('mentor')}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold transition-all -mb-px ${
            tab === 'mentor'
              ? 'text-cocoa-900 border-b-2 border-cocoa-700 bg-paper'
              : 'text-cocoa-400 hover:text-cocoa-600'
          }`}
        >
          <GraduationCap className="w-4 h-4" strokeWidth={2} /> 导师专区
        </button>
        <button
          onClick={() => setTab('newbie')}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold transition-all -mb-px ${
            tab === 'newbie'
              ? 'text-cocoa-900 border-b-2 border-cocoa-700 bg-paper'
              : 'text-cocoa-400 hover:text-cocoa-600'
          }`}
        >
          <Sprout className="w-4 h-4" strokeWidth={2} /> 新人专区
        </button>
      </div>

      {/* 内容区 */}
      {tab === 'mentor' && (
        <MentorCoursesManager initialMaterials={mentorMaterials} />
      )}
      {tab === 'newbie' && (
        <NewbieCoursesManager initialMaterials={newbieMaterials} />
      )}
    </>
  )
}
