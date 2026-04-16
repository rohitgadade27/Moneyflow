'use client'

import { useEffect, useState } from 'react'
import { BudgetForm } from '@/components/budget-form'
import { BudgetCard } from '@/components/budget-card'
import { useDB } from '@/hooks/useDB'
import { Budget, Category, BudgetEntry } from '@/lib/types'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function BudgetsPage() {
  const db = useDB()
  const [budget, setBudget] = useState<Budget | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [spent, setSpent] = useState<Map<string, number>>(new Map())
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch data
  useEffect(() => {
    if (!db.dbReady) return

    const fetchData = async () => {
      try {
        setLoading(true)

        // Get current month and year
        const now = new Date()
        const month = now.getMonth()
        const year = now.getFullYear()

        // Get budget for current month
        const currentBudget = await db.getBudgetForMonth(month, year)
        if (!currentBudget) {
          // Create new budget if doesn't exist
          const newBudget = await db.addBudget({
            month,
            year,
            entries: [],
          })
          setBudget(newBudget)
        } else {
          setBudget(currentBudget)
        }

        // Get all categories
        const cats = await db.getAllCategories()
        setCategories(cats)

        // Calculate spending for current month
        const transactions = await db.getTransactionsByMonth(month, year)
        const spentMap = new Map<string, number>()

        for (const tx of transactions) {
          if (tx.type === 'expense') {
            const current = spentMap.get(tx.category) || 0
            spentMap.set(tx.category, current + tx.amount)
          }
        }

        setSpent(spentMap)
      } catch (error) {
        console.error('Failed to fetch budget data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [db.dbReady])

  const handleAddBudget = async (formData: any) => {
    setIsSubmitting(true)
    try {
      if (!budget) return

      const existingEntry = budget.entries.find(
        (e) => e.categoryId === formData.categoryId
      )

      if (existingEntry) {
        // Update existing entry
        const updatedEntries = budget.entries.map((e) =>
          e.categoryId === formData.categoryId
            ? { ...e, limit: parseFloat(formData.limit) }
            : e
        )
        await db.updateBudget(budget.id, { entries: updatedEntries })
      } else {
        // Add new entry
        const newEntries = [
          ...budget.entries,
          {
            categoryId: formData.categoryId,
            limit: parseFloat(formData.limit),
          },
        ]
        await db.updateBudget(budget.id, { entries: newEntries })
      }

      // Refresh data
      const now = new Date()
      const updatedBudget = await db.getBudgetForMonth(now.getMonth(), now.getFullYear())
      if (updatedBudget) {
        setBudget(updatedBudget)
      }

      setShowForm(false)
      setEditingCategory(null)
    } catch (error) {
      console.error('Error adding budget:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteBudget = async (categoryId: string) => {
    try {
      if (!budget) return

      const updatedEntries = budget.entries.filter(
        (e) => e.categoryId !== categoryId
      )
      await db.updateBudget(budget.id, { entries: updatedEntries })

      const now = new Date()
      const updatedBudget = await db.getBudgetForMonth(now.getMonth(), now.getFullYear())
      if (updatedBudget) {
        setBudget(updatedBudget)
      }
    } catch (error) {
      console.error('Error deleting budget:', error)
    }
  }

  const handleEditBudget = (categoryId: string, limit: number) => {
    setEditingCategory(categoryId)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingCategory(null)
  }

  const categoryMap = new Map(categories.map((cat) => [cat.id, cat]))

  if (!db.dbReady) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-slate-600">Initializing database...</p>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Monthly Budgets</h1>
          <p className="text-slate-600 mt-2">
            Set spending limits for your categories and track your progress
          </p>
        </div>
        {!showForm && (
          <Button
            onClick={() => {
              setEditingCategory(null)
              setShowForm(true)
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Budget
          </Button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <BudgetForm
          categories={categories}
          onSubmit={handleAddBudget}
          onClose={handleCloseForm}
          initialCategory={editingCategory || undefined}
          initialLimit={
            editingCategory
              ? budget?.entries.find((e) => e.categoryId === editingCategory)
                  ?.limit
              : undefined
          }
          isLoading={isSubmitting}
        />
      )}

      {/* Budget Cards */}
      {!loading && budget && budget.entries.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-slate-600">
            No budgets set yet. Start by adding a budget for a category.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {budget?.entries.map((entry) => (
            <BudgetCard
              key={entry.categoryId}
              categoryId={entry.categoryId}
              limit={entry.limit}
              spent={spent.get(entry.categoryId) || 0}
              category={categoryMap.get(entry.categoryId)}
              onEdit={handleEditBudget}
              onDelete={handleDeleteBudget}
              isLoading={isSubmitting}
            />
          ))}
        </div>
      )}
    </div>
  )
}
