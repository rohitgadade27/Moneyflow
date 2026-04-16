'use client'

import { useEffect, useState } from 'react'
import { TransactionForm } from '@/components/transaction-form'
import { TransactionTable } from '@/components/transaction-table'
import { useDB } from '@/hooks/useDB'
import { Transaction, Category } from '@/lib/types'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function TransactionsPage() {
  const db = useDB()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch data
  useEffect(() => {
    if (!db.dbReady) return

    const fetchData = async () => {
      try {
        setLoading(true)
        const [txs, cats] = await Promise.all([
          db.getTransactions(),
          db.getAllCategories(),
        ])
        setTransactions(txs)
        setCategories(cats)
      } catch (error) {
        console.error('Failed to fetch transactions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [db.dbReady])

  const handleAddTransaction = async (formData: any) => {
    setIsSubmitting(true)
    try {
      if (editingTransaction) {
        await db.updateTransaction(editingTransaction.id, {
          ...formData,
          amount: parseFloat(formData.amount),
        })
      } else {
        await db.addTransaction({
          ...formData,
          amount: parseFloat(formData.amount),
        })
      }

      // Refresh data
      const txs = await db.getTransactions()
      setTransactions(txs)

      setShowForm(false)
      setEditingTransaction(null)
    } catch (error) {
      console.error('Error adding transaction:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return

    try {
      await db.deleteTransaction(id)
      const txs = await db.getTransactions()
      setTransactions(txs)
    } catch (error) {
      console.error('Error deleting transaction:', error)
    }
  }

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingTransaction(null)
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
          <h1 className="text-4xl font-bold text-slate-900">Transactions</h1>
          <p className="text-slate-600 mt-2">Manage your income and expenses</p>
        </div>
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Transaction
          </Button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <TransactionForm
          categories={categories}
          onSubmit={handleAddTransaction}
          onClose={handleCloseForm}
          initialData={editingTransaction || undefined}
          isLoading={isSubmitting}
        />
      )}

      {/* Table */}
      <TransactionTable
        transactions={transactions}
        categories={categoryMap}
        onEdit={handleEditTransaction}
        onDelete={handleDeleteTransaction}
        isLoading={loading}
      />
    </div>
  )
}
