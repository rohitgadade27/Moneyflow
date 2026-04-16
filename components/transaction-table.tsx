'use client'

import { Transaction, Category } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Trash2, Edit2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface TransactionTableProps {
  transactions: Transaction[]
  categories: Map<string, Category>
  onEdit: (transaction: Transaction) => void
  onDelete: (id: string) => void
  isLoading?: boolean
}

export function TransactionTable({
  transactions,
  categories,
  onEdit,
  onDelete,
  isLoading = false,
}: TransactionTableProps) {
  if (transactions.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-slate-600">No transactions yet. Add your first transaction to get started!</p>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                Title
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                Category
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                Date
              </th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">
                Amount
              </th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => {
              const category = categories.get(transaction.category)
              const isIncome = transaction.type === 'income'

              return (
                <tr
                  key={transaction.id}
                  className="border-b border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-slate-900">
                        {transaction.title}
                      </p>
                      {transaction.notes && (
                        <p className="text-sm text-slate-500 mt-1">
                          {transaction.notes}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {category && (
                        <>
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="text-slate-700">{category.name}</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {formatDate(transaction.date)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span
                      className={`font-semibold ${
                        isIncome ? 'text-emerald-600' : 'text-red-600'
                      }`}
                    >
                      {isIncome ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(transaction)}
                        disabled={isLoading}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(transaction.id)}
                        disabled={isLoading}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
