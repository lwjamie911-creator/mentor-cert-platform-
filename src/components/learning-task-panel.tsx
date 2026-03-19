'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Material {
  id: string
  title: string
  subject: string
  minReadSeconds: number
  completed: boolean
}

interface Props {
  zone: 'mentor' | 'newbie'
  initialMaterials: Material[]
}

export function LearningTaskPanel({ zone, initialMaterials }: Props) {
  const [materials, setMaterials] = useState<Material[]>(initialMaterials)

  // 轮询：每次页面聚焦时刷新进度（从阅读页返回后更新）
  useEffect(() => {
    function refresh() {
      fetch(`/api/learning/${zone}`)
        .then(r => r.json())
        .then(data => setMaterials(data))
    }
    window.addEventListener('focus', refresh)
    return () => window.removeEventListener('focus', refresh)
  }, [zone])

  if (materials.length === 0) {
    return (
      <div className="text-center py-8 text-gray-300">
        <div className="text-3xl mb-2">📚</div>
        <p className="text-sm">暂无学习资料，请等待管理员添加</p>
      </div>
    )
  }

  const completedCount = materials.filter(m => m.completed).length
  const allDone = completedCount === materials.length
  const pct = Math.round((completedCount / materials.length) * 100)

  return (
    <div className="space-y-4">
      {/* 进度总览 */}
      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>学习进度</span>
          <span className={`font-semibold ${allDone ? 'text-green-600' : 'text-indigo-600'}`}>
            {completedCount} / {materials.length} 篇 · {pct}%
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div className="h-1.5 rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              background: allDone
                ? 'linear-gradient(90deg,#22c55e,#16a34a)'
                : zone === 'mentor'
                  ? 'linear-gradient(90deg,#f59e0b,#fb923c)'
                  : 'linear-gradient(90deg,#3b82f6,#6366f1)',
            }} />
        </div>
      </div>

      {/* 资料列表 */}
      <div className="space-y-2">
        {materials.map((m, idx) => {
          const readLink = `/${zone}/learn/${m.id}`
          const minMin = m.minReadSeconds > 0 ? Math.ceil(m.minReadSeconds / 60) : null

          return (
            <div key={m.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
              m.completed
                ? 'bg-green-50 border-green-100'
                : 'bg-gray-50 border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30'
            }`}>
              {/* 序号/完成状态 */}
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                m.completed ? 'bg-green-200 text-green-700' : 'bg-white border border-gray-200 text-gray-400'
              }`}>
                {m.completed ? '✓' : idx + 1}
              </div>

              {/* 标题 + 科目 */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${m.completed ? 'text-green-800' : 'text-gray-800'}`}>
                  {m.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">{m.subject}</span>
                  {minMin && (
                    <span className="text-xs text-gray-400">约 {minMin} 分钟</span>
                  )}
                </div>
              </div>

              {/* 操作 */}
              <Link
                href={readLink}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  m.completed
                    ? 'text-gray-500 border border-gray-200 hover:bg-gray-100'
                    : zone === 'mentor'
                      ? 'text-amber-700 border border-amber-200 hover:bg-amber-50'
                      : 'text-indigo-600 border border-indigo-200 hover:bg-indigo-50'
                }`}
              >
                {m.completed ? '复习' : '去阅读 →'}
              </Link>
            </div>
          )
        })}
      </div>

      {allDone && (
        <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-100 rounded-xl">
          <span className="text-green-500">✅</span>
          <p className="text-sm text-green-700 font-medium">所有资料已阅读完毕，可以进入测试了！</p>
        </div>
      )}
    </div>
  )
}
