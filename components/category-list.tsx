'use client'

import { Category } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Edit2, Trash2 } from 'lucide-react'

interface CategoryListProps {
  categories: Category[]
  onEdit: (category: Category) => void
  onDelete: (id: string) => void
  isLoading?: boolean
}

export function CategoryList({
  categories,
  onEdit,
  onDelete,
  isLoading = false,
}: CategoryListProps) {
  if (categories.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-slate-600">No categories yet. Add your first category to get started!</p>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {categories.map((category) => (
        <Card key={category.id} className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3 flex-1">
              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: category.color }}
              />
              <h3 className="font-semibold text-slate-900">{category.name}</h3>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(category)}
                disabled={isLoading}
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (confirm('Are you sure you want to delete this category?')) {
                    onDelete(category.id)
                  }
                }}
                disabled={isLoading}
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </Button>
            </div>
          </div>
          <p className="text-xs text-slate-500 font-mono">{category.color}</p>
        </Card>
      ))}
    </div>
  )
}
