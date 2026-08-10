import { Loader2 } from 'lucide-react'

export default function MentorLoading() {
  return (
    <div className="space-y-5 animate-pulse">
      {/* 顶部提示 */}
      <div className="flex items-center justify-center gap-2 text-cocoa-600 text-sm py-2">
        <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
        正在加载导师专区…
      </div>

      {/* 头部横幅骨架 */}
      <div className="rounded-2xl h-28 bg-gradient-to-br from-cocoa-100 to-cocoa-200" />

      {/* 卡片骨架 */}
      {[0, 1, 2].map(i => (
        <div key={i} className="rounded-2xl bg-paper border border-line p-5 space-y-3 shadow-card">
          <div className="h-4 w-1/3 bg-cocoa-100 rounded" />
          <div className="h-3 w-2/3 bg-cocoa-50 rounded" />
          <div className="h-3 w-1/2 bg-cocoa-50 rounded" />
        </div>
      ))}
    </div>
  )
}
