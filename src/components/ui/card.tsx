import { cn } from '@/lib/utils'

// 中性卡片 —— 全站内容容器。圆角 12px，发丝边框，极轻阴影
export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('bg-paper rounded-2xl border border-line shadow-card', className)}
      {...props}
    >
      {children}
    </div>
  )
}

// 卡片头部（图标 + 标题 + 副标题 + 右侧插槽）
export function CardHeader({
  icon, title, subtitle, right,
}: {
  icon?: React.ReactNode
  title: string
  subtitle?: string
  right?: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-3 px-5 sm:px-6 py-4 border-b border-line/70">
      {icon && <span className="text-ink/70 flex-shrink-0">{icon}</span>}
      <div className="min-w-0 flex-1">
        <h2 className="font-semibold text-ink text-[15px] leading-tight">{title}</h2>
        {subtitle && <p className="text-xs text-slate mt-0.5">{subtitle}</p>}
      </div>
      {right}
    </div>
  )
}

export function CardBody({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('px-5 sm:px-6 py-5', className)}>{children}</div>
}

// 幽灵标签 —— 无背景的分类标记
export function Tag({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn('text-xs text-ash font-medium', className)}>{children}</span>
}
