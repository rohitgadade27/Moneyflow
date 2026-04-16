'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Category } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import { Edit2, Trash2 } from 'lucide-react'

interface BudgetCardProps {
  categoryId: string
  limit: number
  spent: number
  category?: Category
  onEdit: (categoryId: string, limit: number) => void
  onDelete: (categoryId: string) => void
  isLoading?: boolean
}

export function BudgetCard({
  categoryId,
  limit,
  spent,
  category,
  onEdit,
  onDelete,
  isLoading = false,
}: BudgetCardProps) {
  const percentage = Math.min((spent / limit) * 100, 100)
  const remaining = Math.max(limit - spent, 0)
  const isOver = spent > limit

  // Determine color based on percentage
  let progressColor = '#10b981' // green
  let statusColor = 'text-emerald-600'

  if (percentage >= 100) {
    progressColor = '#ef4444' // red
    statusColor = 'text-red-600'
  } else if (percentage >= 80) {
    progressColor = '#f59e0b' // amber
    statusColor = 'text-amber-600'
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {category && (
              <>
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <div>
                  <h3 className="font-semibold text-slate-900">{category.name}</h3>
                  <p className="text-sm text-slate-500">
                    {formatCurrency(spent)} of {formatCurrency(limit)}
                  </p>
                </div>
              </>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(categoryId, limit)}
              disabled={isLoading}
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (confirm('Are you sure you want to remove this budget?')) {
                  onDelete(categoryId)
                }
              }}
              disabled={isLoading}
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
            <div
              className="h-full transition-all duration-300"
              style={{
                backgroundColor: progressColor,
                width: `${percentage}%`,
              }}
            />
          </div>

          {/* Stats */}
          <div className="flex justify-between items-center">
            <span className={`text-sm font-medium ${statusColor}`}>
              {percentage.toFixed(0)}% spent
            </span>
            <span className="text-sm text-slate-600">
              {isOver
                ? `${formatCurrency(spent - limit)} over`
                : `${formatCurrency(remaining)} remaining`}
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}
