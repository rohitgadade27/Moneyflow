'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Category } from '@/lib/types'
import { X } from 'lucide-react'

const budgetSchema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  limit: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: 'Budget limit must be a positive number',
  }),
})

type FormData = z.infer<typeof budgetSchema>

interface BudgetFormProps {
  categories: Category[]
  onSubmit: (data: FormData) => Promise<void>
  onClose: () => void
  initialCategory?: string
  initialLimit?: number
  isLoading?: boolean
}

export function BudgetForm({
  categories,
  onSubmit,
  onClose,
  initialCategory,
  initialLimit,
  isLoading = false,
}: BudgetFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      categoryId: initialCategory || '',
      limit: initialLimit?.toString() || '',
    },
  })

  const handleSubmit = async (data: FormData) => {
    try {
      await onSubmit(data)
      form.reset()
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-slate-900">
          {initialCategory ? 'Edit Budget' : 'Set Budget Limit'}
        </h2>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Category
          </label>
          <select
            {...form.register('categoryId')}
            disabled={isLoading || !!initialCategory}
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 bg-white disabled:bg-slate-100"
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {form.formState.errors.categoryId && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.categoryId.message}
            </p>
          )}
        </div>

        {/* Limit */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Monthly Budget Limit
          </label>
          <Input
            type="number"
            placeholder="0.00"
            step="0.01"
            {...form.register('limit')}
            disabled={isLoading}
          />
          {form.formState.errors.limit && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.limit.message}
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isLoading ? 'Saving...' : 'Set Budget'}
          </Button>
          <Button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            variant="outline"
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  )
}
