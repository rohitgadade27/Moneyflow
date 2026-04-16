'use client';

import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDB } from '@/hooks/useDB';
import { TransactionType, Category } from '@/lib/types';

export function TransactionQuickAdd() {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const { addTransaction, getAllCategories, dbReady } = useDB();
  const [category, setCategory] = useState('food');

  useEffect(() => {
    if (!dbReady) return;

    const loadCategories = async () => {
      try {
        const cats = await getAllCategories();
        setCategories(cats);
        if (cats.length > 0) {
          setCategory(cats[0].id);
        }
      } catch (error) {
        console.error('Failed to load categories:', error);
        toast.error('Failed to load categories');
      }
    };

    loadCategories();
  }, [dbReady, getAllCategories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) return;

    setIsLoading(true);
    try {
      await addTransaction({
        title,
        amount: parseFloat(amount),
        type,
        category,
        date: new Date().toISOString().split('T')[0],
      });

      setTitle('');
      setAmount('');
      setType(TransactionType.EXPENSE);
      setIsOpen(false);
    } catch (error) {
      console.error('Error adding transaction:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* FAB Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-6 md:bottom-6 bg-teal-500 hover:bg-teal-600 text-white rounded-full p-4 shadow-lg transition-all duration-300 z-30"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Modal Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:z-50"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Modal */}
      <div
        className={`fixed inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 bg-white rounded-t-2xl md:rounded-2xl p-6 max-w-md w-full md:w-96 z-50 transition-all duration-300 ${
          isOpen ? 'translate-y-0' : 'translate-y-full md:scale-95 md:opacity-0 md:pointer-events-none'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg transition"
        >
          <X className="w-5 h-5 text-slate-500" />
        </button>

        <h2 className="text-2xl font-bold text-slate-900 mb-6">Add Transaction</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Grocery Shopping"
              disabled={isLoading}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Amount (₹)</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              disabled={isLoading}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Type</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType(TransactionType.EXPENSE)}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                  type === TransactionType.EXPENSE
                    ? 'bg-red-500 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => setType(TransactionType.INCOME)}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                  type === TransactionType.INCOME
                    ? 'bg-green-500 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Income
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
            {categories.length === 0 ? (
              <div className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-600 text-sm">
                No categories available
              </div>
            ) : (
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading || !title || !amount}
            className="w-full bg-teal-500 hover:bg-teal-600 text-white py-3 rounded-lg font-semibold"
          >
            {isLoading ? 'Adding...' : 'Add Transaction'}
          </Button>
        </form>
      </div>
    </>
  );
}
