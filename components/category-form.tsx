'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Category } from '@/lib/types'
import { X } from 'lucide-react'

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(50, 'Category name is too long'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Please provide a valid hex color'),
})

type FormData = z.infer<typeof categorySchema>

interface CategoryFormProps {
  onSubmit: (data: FormData) => Promise<void>
  onClose: () => void
  initialData?: Category
  isLoading?: boolean
}

// Predefined color palette
const colorPalette = [
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#8b5cf6', // Violet
  '#f97316', // Orange
  '#f59e0b', // Amber
  '#6366f1', // Indigo
  '#ec4899', // Pink
  '#ef4444', // Red
  '#14b8a6', // Teal
  '#64748b', // Slate
  '#d946ef', // Fuchsia
  '#78716c', // Stone
]

export function CategoryForm({
  onSubmit,
  onClose,
  initialData,
  isLoading = false,
}: CategoryFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: initialData?.name || '',
      color: initialData?.color || '#10b981',
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
          {initialData ? 'Edit Category' : 'Add New Category'}
        </h2>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Category Name
          </label>
          <Input
            placeholder="e.g., Groceries"
            {...form.register('name')}
            disabled={isLoading}
          />
          {form.formState.errors.name && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>

        {/* Color Palette */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Color
          </label>
          <div className="grid grid-cols-6 gap-3 mb-4">
            {colorPalette.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => form.setValue('color', color)}
                className={`w-10 h-10 rounded-lg border-2 transition-all ${
                  form.watch('color') === color
                    ? 'border-slate-900'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>

          {/* Custom color input */}
          <Input
            type="text"
            placeholder="#000000"
            {...form.register('color')}
            disabled={isLoading}
            className="font-mono text-sm"
          />
          {form.formState.errors.color && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.color.message}
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
            {isLoading ? 'Saving...' : 'Save Category'}
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
