'use client'

import { Card } from '@/components/ui/card'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface ChartData {
  category: string
  amount: number
  categoryId: string
  color?: string
}

interface ExpenseBreakdownChartProps {
  data: ChartData[]
  categoryColors: Map<string, string>
}

export function ExpenseBreakdownChart({
  data,
  categoryColors,
}: ExpenseBreakdownChartProps) {
  // Map data to include colors
  const chartData = data.map((item) => ({
    ...item,
    value: item.amount,
    color: categoryColors.get(item.categoryId) || '#94a3b8',
  }))

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold text-slate-900 mb-6">
        Expense Breakdown
      </h2>

      {data.length === 0 ? (
        <div className="h-64 flex items-center justify-center">
          <p className="text-slate-600">No expense data available</p>
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ category, percent }) =>
                  `${category} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>

          {/* Detailed breakdown */}
          <div className="mt-6 space-y-2 border-t border-slate-200 pt-4">
            {chartData
              .sort((a, b) => b.amount - a.amount)
              .map((item) => (
                <div key={item.categoryId} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-slate-700">{item.category}</span>
                  </div>
                  <span className="text-sm font-medium text-slate-900">
                    {formatCurrency(item.amount)}
                  </span>
                </div>
              ))}
          </div>
        </>
      )}
    </Card>
  )
}
