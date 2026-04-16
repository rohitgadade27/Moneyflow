'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { SummaryCard } from '@/components/summary-card'
import { TransactionQuickAdd } from '@/components/transaction-quick-add'
import { TrendingUp, TrendingDown, Wallet, Percent, ArrowRight } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useDB } from '@/hooks/useDB'
import { DashboardStats, Transaction } from '@/lib/types'

export default function DashboardPage() {
  const db = useDB()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!db.dbReady) return

    const fetchStats = async () => {
      try {
        setLoading(true)
        const dashboardStats = await db.getDashboardStats()
        setStats(dashboardStats)

        // Fetch recent transactions (last 5)
        const transactions = await db.getTransactions()
        setRecentTransactions(transactions.slice(0, 5))
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [db.dbReady])

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
        <p className="text-slate-600">Loading dashboard...</p>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-slate-600">No data available</p>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-2">Welcome back! Here&apos;s your financial overview.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          title="Total Balance"
          value={formatCurrency(stats.totalBalance)}
          icon={<Wallet className="w-8 h-8" />}
          variant={stats.totalBalance >= 0 ? 'success' : 'danger'}
        />
        <SummaryCard
          title="Total Income"
          value={formatCurrency(stats.totalIncome)}
          icon={<TrendingUp className="w-8 h-8 text-emerald-500" />}
          variant="success"
        />
        <SummaryCard
          title="Total Expenses"
          value={formatCurrency(stats.totalExpenses)}
          icon={<TrendingDown className="w-8 h-8 text-red-500" />}
          variant="danger"
        />
        <SummaryCard
          title="Savings Rate"
          value={`${stats.savingsRate}%`}
          icon={<Percent className="w-8 h-8" />}
          variant="default"
        />
      </div>

      {/* Recent Transactions Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-900">Recent Transactions</h2>
          <Link href="/transactions" className="text-teal-500 hover:text-teal-600 font-medium flex items-center gap-2">
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500">No transactions yet. Start by adding your first transaction!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-lg transition">
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{transaction.title}</p>
                  <p className="text-sm text-slate-500">{formatDate(transaction.date)}</p>
                </div>
                <div className={`font-semibold ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Add FAB */}
      <TransactionQuickAdd />
    </div>
  )
}
