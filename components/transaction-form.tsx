'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Transaction, TransactionType, Category } from '@/lib/types'
import { X } from 'lucide-react'

const transactionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  amount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: 'Amount must be a positive number',
  }),
  type: z.enum([TransactionType.INCOME, TransactionType.EXPENSE]),
  category: z.string().min(1, 'Category is required'),
  date: z.string().min(1, 'Date is required'),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof transactionSchema>

interface TransactionFormProps {
  categories: Category[]
  onSubmit: (data: FormData) => Promise<void>
  onClose: () => void
  initialData?: Transaction
  isLoading?: boolean
}

export function TransactionForm({
  categories,
  onSubmit,
  onClose,
  initialData,
  isLoading = false,
}: TransactionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      title: initialData?.title || '',
      amount: initialData?.amount.toString() || '',
      type: initialData?.type || TransactionType.EXPENSE,
      category: initialData?.category || '',
      date: initialData?.date || new Date().toISOString().split('T')[0],
      notes: initialData?.notes || '',
    },
  })

  const handleSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
      form.reset()
      onClose()
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-slate-900">
          {initialData ? 'Edit Transaction' : 'Add New Transaction'}
        </h2>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Title
          </label>
          <Input
            placeholder="e.g., Grocery Shopping"
            {...form.register('title')}
            disabled={isSubmitting || isLoading}
          />
          {form.formState.errors.title && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.title.message}
            </p>
          )}
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Amount
          </label>
          <Input
            type="number"
            placeholder="0.00"
            step="0.01"
            {...form.register('amount')}
            disabled={isSubmitting || isLoading}
          />
          {form.formState.errors.amount && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.amount.message}
            </p>
          )}
        </div>

        {/* Type and Category Row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Type
            </label>
            <select
              {...form.register('type')}
              disabled={isSubmitting || isLoading}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 bg-white"
            >
              <option value={TransactionType.EXPENSE}>Expense</option>
              <option value={TransactionType.INCOME}>Income</option>
            </select>
            {form.formState.errors.type && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.type.message}
              </p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Category
            </label>
            <select
              {...form.register('category')}
              disabled={isSubmitting || isLoading}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 bg-white"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {form.formState.errors.category && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.category.message}
              </p>
            )}
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Date
          </label>
          <Input
            type="date"
            {...form.register('date')}
            disabled={isSubmitting || isLoading}
          />
          {form.formState.errors.date && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.date.message}
            </p>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Notes (optional)
          </label>
          <textarea
            placeholder="Add any notes about this transaction"
            {...form.register('notes')}
            disabled={isSubmitting || isLoading}
            rows={3}
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 bg-white"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isSubmitting ? 'Saving...' : 'Save Transaction'}
          </Button>
          <Button
            type="button"
            onClick={onClose}
            disabled={isSubmitting || isLoading}
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
