'use client'

import { useEffect, useState } from 'react'
import { IncomeExpenseChart } from '@/components/income-expense-chart'
import { ExpenseBreakdownChart } from '@/components/expense-breakdown-chart'
import { useDB } from '@/hooks/useDB'
import { Category } from '@/lib/types'
import { Card } from '@/components/ui/card'

interface ChartData {
  month: string
  income: number
  expenses: number
  year: number
}

interface ExpenseData {
  category: string
  amount: number
  categoryId: string
}

export default function AnalyticsPage() {
  const db = useDB()
  const [monthlyData, setMonthlyData] = useState<ChartData[]>([])
  const [expenseData, setExpenseData] = useState<ExpenseData[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!db.dbReady) return

    const fetchData = async () => {
      try {
        setLoading(true)

        // Get monthly data for the last 12 months
        const monthly = await db.getMonthlyIncomeExpenses(12)
        setMonthlyData(monthly)

        // Get expense breakdown for current month
        const now = new Date()
        const expenses = await db.getExpensesByCategory(
          now.getMonth(),
          now.getFullYear()
        )
        setExpenseData(
          expenses.map((e) => ({
            category: e.category,
            amount: e.amount,
            categoryId: e.categoryId,
          }))
        )

        // Get categories
        const cats = await db.getAllCategories()
        setCategories(cats)
      } catch (error) {
        console.error('Failed to fetch analytics data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [db.dbReady])

  const categoryColorMap = new Map(
    categories.map((cat) => [cat.id, cat.color])
  )

  if (!db.dbReady) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-slate-600">Initializing database...</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-slate-600">Loading analytics...</p>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900">Analytics</h1>
        <p className="text-slate-600 mt-2">Analyze your financial patterns and trends</p>
      </div>

      {/* Charts */}
      <div className="space-y-6">
        {/* Income vs Expenses */}
        {monthlyData.length > 0 ? (
          <IncomeExpenseChart data={monthlyData} />
        ) : (
          <Card className="p-8 text-center">
            <p className="text-slate-600">
              Add some transactions to see your income vs expenses chart
            </p>
          </Card>
        )}

        {/* Expense Breakdown */}
        {expenseData.length > 0 ? (
          <ExpenseBreakdownChart data={expenseData} categoryColors={categoryColorMap} />
        ) : (
          <Card className="p-8 text-center">
            <p className="text-slate-600">
              Add some expenses to see the breakdown by category
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}
