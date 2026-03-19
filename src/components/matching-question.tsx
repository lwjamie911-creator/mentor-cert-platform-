'use client'

import { useState, useMemo } from 'react'

interface MatchingQuestionProps {
  questionId: string
  leftItems: string[]   // 原始左侧项（题目项）
  rightItems: string[]  // 原始右侧答案（顺序与左侧对应，展示时打乱）
  value: Record<number, number> | undefined // { leftIndex: rightIndex }
  onChange: (val: Record<number, number>) => void
}

export function MatchingQuestion({ questionId, leftItems, rightItems, value = {}, onChange }: MatchingQuestionProps) {
  // 右侧展示顺序（打乱后固定，不随重渲染变化）
  const shuffledRight = useMemo(() => {
    const indexed = rightItems.map((item, i) => ({ item, origIndex: i }))
    // 用 questionId 做确定性伪随机打乱
    const seed = questionId.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
    return indexed.sort((a, b) => {
      const ha = (a.origIndex * 2654435761 + seed) % rightItems.length
      const hb = (b.origIndex * 2654435761 + seed * 2) % rightItems.length
      return ha - hb
    })
  }, [questionId, rightItems])

  const [activeLeft, setActiveLeft] = useState<number | null>(null)

  // 反查：右侧某个显示位置的 origIndex 是否已被连线
  const rightConnected = new Set(Object.values(value))

  function handleLeftClick(li: number) {
    if (activeLeft === li) {
      setActiveLeft(null) // 取消选中
    } else {
      setActiveLeft(li)
    }
  }

  function handleRightClick(origIndex: number) {
    if (activeLeft === null) return
    const newVal = { ...value }

    // 如果这个右侧已被连到别的左侧，先断开
    const existingLeft = Object.entries(newVal).find(([, ri]) => ri === origIndex)
    if (existingLeft) delete newVal[Number(existingLeft[0])]

    // 如果当前左侧已有连线，覆盖
    newVal[activeLeft] = origIndex
    onChange(newVal)
    setActiveLeft(null)
  }

  function disconnect(li: number) {
    const newVal = { ...value }
    delete newVal[li]
    onChange(newVal)
  }

  return (
    <div className="flex gap-4 sm:gap-8 mt-3">
      {/* 左侧 */}
      <div className="flex-1 space-y-2">
        {leftItems.map((item, li) => {
          const isActive    = activeLeft === li
          const isConnected = value[li] !== undefined
          return (
            <div
              key={li}
              onClick={() => handleLeftClick(li)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all select-none ${
                isActive
                  ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                  : isConnected
                    ? 'border-green-400 bg-green-50'
                    : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/40'
              }`}
            >
              <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 ${
                isActive    ? 'bg-indigo-500 text-white' :
                isConnected ? 'bg-green-400 text-white' :
                'bg-gray-100 text-gray-500'
              }`}>
                {String.fromCharCode(65 + li)}
              </span>
              <span className="text-sm text-gray-700 leading-snug">{item}</span>
              {isConnected && (
                <button
                  onClick={e => { e.stopPropagation(); disconnect(li) }}
                  className="ml-auto text-gray-300 hover:text-red-400 transition-colors text-xs"
                  title="断开连线"
                >✕</button>
              )}
            </div>
          )
        })}
      </div>

      {/* 连线指示 */}
      <div className="flex flex-col justify-center gap-2 flex-shrink-0">
        {leftItems.map((_, li) => (
          <div key={li} className="h-[52px] flex items-center">
            {value[li] !== undefined ? (
              <div className="flex items-center gap-1">
                <div className="w-3 h-0.5 bg-green-400" />
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <div className="w-3 h-0.5 bg-green-400" />
              </div>
            ) : (
              <div className="w-8 h-0.5 border-t-2 border-dashed border-gray-200" />
            )}
          </div>
        ))}
      </div>

      {/* 右侧（打乱顺序） */}
      <div className="flex-1 space-y-2">
        {shuffledRight.map(({ item, origIndex }) => {
          const isConnected = rightConnected.has(origIndex)
          const isTarget    = activeLeft !== null && !isConnected
          return (
            <div
              key={origIndex}
              onClick={() => handleRightClick(origIndex)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all select-none ${
                isConnected
                  ? 'border-green-400 bg-green-50 cursor-default'
                  : isTarget
                    ? 'border-indigo-300 bg-indigo-50/60 cursor-pointer hover:border-indigo-500 hover:bg-indigo-50'
                    : 'border-gray-200 bg-white cursor-pointer hover:border-gray-300'
              }`}
            >
              <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 ${
                isConnected ? 'bg-green-400 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {origIndex + 1}
              </span>
              <span className="text-sm text-gray-700 leading-snug">{item}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── 评分工具函数（供 API 使用，也导出供前端结果页使用）──
export function scoreMatching(
  userAnswer: Record<number, number>,
  correctAnswer: string[] // 右侧正确顺序，index 对应左侧
): { correct: boolean; detail: Record<number, boolean> } {
  const detail: Record<number, boolean> = {}
  let allCorrect = true
  correctAnswer.forEach((_, li) => {
    const isCorrect = userAnswer[li] === li
    detail[li] = isCorrect
    if (!isCorrect) allCorrect = false
  })
  return { correct: allCorrect, detail }
}
