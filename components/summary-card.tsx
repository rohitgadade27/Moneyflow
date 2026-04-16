import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface SummaryCardProps {
  title: string
  value: string
  icon: ReactNode
  variant?: 'default' | 'success' | 'danger'
  className?: string
  subtitle?: string
}

export function SummaryCard({
  title,
  value,
  icon,
  variant = 'default',
  className,
  subtitle,
}: SummaryCardProps) {
  const variantStyles = {
    default: 'bg-gradient-to-br from-white to-slate-50 border border-slate-200',
    success: 'bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200',
    danger: 'bg-gradient-to-br from-red-50 to-red-100 border border-red-200',
  }

  const iconColorStyles = {
    default: 'text-slate-400',
    success: 'text-emerald-500',
    danger: 'text-red-500',
  }

  return (
    <div
      className={cn(
        'rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300',
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{title}</p>
          <p className="text-3xl sm:text-2xl md:text-3xl font-bold text-slate-900">{value}</p>
          {subtitle && <p className="text-xs text-slate-600 mt-2">{subtitle}</p>}
        </div>
        <div className={cn('flex-shrink-0 ml-4 p-3 rounded-lg', variant === 'default' ? 'bg-slate-100' : variant === 'success' ? 'bg-emerald-100' : 'bg-red-100')}>
          <div className={iconColorStyles[variant]}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  )
}
