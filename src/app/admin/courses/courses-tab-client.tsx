'use client'

import { useState } from 'react'
import { MentorCoursesManager } from './mentor-courses-manager'
import { NewbieCoursesManager } from './newbie-courses-manager'

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
      <div className="flex gap-2 border-b border-gray-200 pb-0">
        <button
          onClick={() => setTab('mentor')}
          className={`px-4 py-2 text-sm font-semibold transition-colors -mb-px ${
            tab === 'mentor'
              ? 'text-amber-700 border-b-2 border-amber-500 bg-white'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          🎓 导师专区
        </button>
        <button
          onClick={() => setTab('newbie')}
          className={`px-4 py-2 text-sm font-semibold transition-colors -mb-px ${
            tab === 'newbie'
              ? 'text-blue-700 border-b-2 border-blue-500 bg-white'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          🌱 新人专区
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
