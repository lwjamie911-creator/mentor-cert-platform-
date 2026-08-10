'use client'

import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

type Variant = 'primary' | 'ghost' | 'accent' | 'subtle'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium ' +
  'transition-all duration-200 ease-out ' +
  'active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-cocoa-600/30 focus-visible:ring-offset-2'

const variants: Record<Variant, string> = {
  // 深棕填充 —— 主要 CTA。hover 微微上浮 + 阴影（温暖而非纯黑）
  primary: 'bg-cocoa-800 text-paper hover:bg-cocoa-900 hover:-translate-y-0.5 hover:shadow-subtle',
  // 描边幽灵 —— 次要动作
  ghost:   'border border-cocoa-600/30 text-cocoa-800 hover:border-cocoa-700 hover:bg-cocoa-800/[0.04]',
  // 蜜桃强调
  accent:  'bg-blush text-sienna hover:-translate-y-0.5 hover:shadow-subtle',
  // 浅棕次级
  subtle:  'bg-cocoa-100 text-cocoa-800 hover:bg-cocoa-200',
}

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-[13px]',
  md: 'h-10 px-5 text-sm',
  lg: 'h-12 px-6 text-[15px]',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, ...props }, ref) => {
    return (
      <button ref={ref} className={cn(base, variants[variant], sizes[size], className)} {...props} />
    )
  }
)
Button.displayName = 'Button'
