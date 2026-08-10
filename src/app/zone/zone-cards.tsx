'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Sprout, GraduationCap, Sparkles, ArrowRight, Loader2 } from 'lucide-react'

type Zone = 'newbie' | 'mentor'

export function ZoneCards() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [target, setTarget] = useState<Zone | null>(null)

  function go(zone: Zone) {
    if (isPending) return
    setTarget(zone)
    startTransition(() => {
      router.push(`/${zone}`)
    })
  }

  const navigating = isPending && target !== null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">

      {/* 新人专区 —— 粉 petal 调 */}
      <button
        type="button"
        onClick={() => go('newbie')}
        disabled={navigating}
        aria-busy={target === 'newbie'}
        className={`group text-left focus:outline-none focus-visible:ring-4 focus-visible:ring-petal-300 rounded-2xl transition-opacity duration-200 ${navigating && target !== 'newbie' ? 'opacity-40' : ''}`}
      >
        <div className={`relative overflow-hidden rounded-2xl p-10 h-full transition-all duration-300 shadow-card ${target === 'newbie' ? 'scale-[0.98] shadow-subtle' : 'hover:-translate-y-1.5 hover:shadow-float active:scale-[0.98]'} ${navigating ? '' : 'cursor-pointer'}`}
          style={{ background: 'linear-gradient(135deg, #fef6f7 0%, #fdeef0 50%, #fce4e6 100%)', border: '1.5px solid #f8d3d7' }}>
          {/* 漂移光晕 */}
          <div className="absolute top-0 right-0 w-56 h-56 rounded-full opacity-50 blur-3xl animate-drift-1"
            style={{ background: 'radial-gradient(circle, #f8d3d7, transparent 70%)', transform: 'translate(30%,-30%)' }} />
          <div className="absolute bottom-0 left-0 w-36 h-36 rounded-full opacity-40 blur-3xl animate-drift-2"
            style={{ background: 'radial-gradient(circle, #f0b8bf, transparent 70%)', transform: 'translate(-20%,20%)' }} />
          {/* 右下角小圆点装饰 */}
          <div className="absolute bottom-6 right-8 w-3 h-3 rounded-full bg-petal-300 opacity-60" />
          <div className="absolute bottom-10 right-14 w-1.5 h-1.5 rounded-full bg-petal-400 opacity-50" />

          <div className="relative z-10 mb-6 w-16 h-16 rounded-2xl bg-paper/80 flex items-center justify-center shadow-card">
            <Sprout className="w-8 h-8 text-petal-600" strokeWidth={2} />
          </div>
          <h2 className="font-display text-3xl text-petal-900 mb-4 relative z-10 tracking-tight">新人专区</h2>

          <div className="flex flex-col gap-3 mb-8 relative z-10">
            {['成长秘籍，新程启航', '学测并进，基础夯实', '目标复盘，步步算数'].map((t) => (
              <div key={t} className="flex items-center gap-2.5 text-sm text-petal-800/90">
                <span className="w-5 h-5 rounded-full bg-paper/80 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-3 h-3 text-petal-500" strokeWidth={2} />
                </span>
                <span>{t}</span>
              </div>
            ))}
          </div>

          <div className="inline-flex items-center gap-1.5 text-sm text-petal-700 font-semibold group-hover:gap-2.5 transition-all relative z-10">
            进入新人专区 <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" strokeWidth={2} />
          </div>

          {/* 加载蒙层 */}
          {target === 'newbie' && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-paper/60 backdrop-blur-[1px] rounded-2xl">
              <div className="flex items-center gap-2 text-petal-700 font-semibold text-sm">
                <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
                正在进入…
              </div>
            </div>
          )}
        </div>
      </button>

      {/* 导师专区 —— 深棕 cocoa 调 */}
      <button
        type="button"
        onClick={() => go('mentor')}
        disabled={navigating}
        aria-busy={target === 'mentor'}
        className={`group text-left focus:outline-none focus-visible:ring-4 focus-visible:ring-cocoa-300 rounded-2xl transition-opacity duration-200 ${navigating && target !== 'mentor' ? 'opacity-40' : ''}`}
      >
        <div className={`relative overflow-hidden rounded-2xl p-10 h-full transition-all duration-300 shadow-card ${target === 'mentor' ? 'scale-[0.98] shadow-subtle' : 'hover:-translate-y-1.5 hover:shadow-float active:scale-[0.98]'} ${navigating ? '' : 'cursor-pointer'}`}
          style={{ background: 'linear-gradient(135deg, #5d2a1a 0%, #7a4230 55%, #9a5c44 100%)', border: '1.5px solid #7a4230' }}>
          {/* 漂移光晕 */}
          <div className="absolute top-0 right-0 w-56 h-56 rounded-full opacity-40 blur-3xl animate-drift-2"
            style={{ background: 'radial-gradient(circle, #cf9c84, transparent 70%)', transform: 'translate(30%,-30%)' }} />
          <div className="absolute bottom-0 left-0 w-36 h-36 rounded-full opacity-30 blur-3xl animate-drift-3"
            style={{ background: 'radial-gradient(circle, #fbe1d1, transparent 70%)', transform: 'translate(-20%,20%)' }} />
          {/* 右下角小圆点装饰 */}
          <div className="absolute bottom-6 right-8 w-3 h-3 rounded-full bg-blush opacity-50" />
          <div className="absolute bottom-10 right-14 w-1.5 h-1.5 rounded-full bg-cocoa-300 opacity-40" />

          <div className="relative z-10 mb-6 w-16 h-16 rounded-2xl bg-paper/15 flex items-center justify-center backdrop-blur-sm">
            <GraduationCap className="w-8 h-8 text-blush" strokeWidth={2} />
          </div>
          <h2 className="font-display text-3xl text-paper mb-4 relative z-10 tracking-tight">导师专区</h2>

          <div className="flex flex-col gap-3 mb-8 relative z-10">
            {['资质认证，加入导师池', '学测并进，自信上岗', '跟踪验收，月报任务'].map((t) => (
              <div key={t} className="flex items-center gap-2.5 text-sm text-blush/90">
                <span className="w-5 h-5 rounded-full bg-paper/15 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-3 h-3 text-blush" strokeWidth={2} />
                </span>
                <span>{t}</span>
              </div>
            ))}
          </div>

          <div className="inline-flex items-center gap-1.5 text-sm text-blush font-semibold group-hover:gap-2.5 transition-all relative z-10">
            进入导师专区 <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" strokeWidth={2} />
          </div>

          {/* 加载蒙层 */}
          {target === 'mentor' && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-cocoa-900/50 backdrop-blur-[1px] rounded-2xl">
              <div className="flex items-center gap-2 text-blush font-semibold text-sm">
                <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
                正在进入…
              </div>
            </div>
          )}
        </div>
      </button>
    </div>
  )
}
