import { useCallback, useEffect, useState } from 'react';
import {
  Transaction,
  Category,
  Budget,
  DashboardStats,
  TransactionFilters,
} from '@/lib/types';
import * as dbOps from '@/lib/db-operations';
import { initDB } from '@/lib/db';

interface UseDBState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function useDB() {
  const [dbReady, setDbReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    initDB()
      .then(() => setDbReady(true))
      .catch((err) => setError(err));
  }, []);

  // Transaction hooks
  const addTransaction = useCallback(
    async (transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
      if (!dbReady) throw new Error('Database not ready');
      return dbOps.addTransaction(transaction);
    },
    [dbReady]
  );

  const updateTransaction = useCallback(
    async (id: string, updates: Partial<Omit<Transaction, 'id' | 'createdAt'>>) => {
      if (!dbReady) throw new Error('Database not ready');
      return dbOps.updateTransaction(id, updates);
    },
    [dbReady]
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      if (!dbReady) throw new Error('Database not ready');
      return dbOps.deleteTransaction(id);
    },
    [dbReady]
  );

  const getTransactions = useCallback(
    async (filters?: TransactionFilters) => {
      if (!dbReady) throw new Error('Database not ready');
      return dbOps.getTransactions(filters);
    },
    [dbReady]
  );

  const getTransactionsByMonth = useCallback(
    async (month: number, year: number) => {
      if (!dbReady) throw new Error('Database not ready');
      return dbOps.getTransactionsByMonth(month, year);
    },
    [dbReady]
  );

  // Category hooks
  const addCategory = useCallback(
    async (category: Omit<Category, 'id'>) => {
      if (!dbReady) throw new Error('Database not ready');
      return dbOps.addCategory(category);
    },
    [dbReady]
  );

  const updateCategory = useCallback(
    async (id: string, updates: Partial<Omit<Category, 'id'>>) => {
      if (!dbReady) throw new Error('Database not ready');
      return dbOps.updateCategory(id, updates);
    },
    [dbReady]
  );

  const deleteCategory = useCallback(
    async (id: string) => {
      if (!dbReady) throw new Error('Database not ready');
      return dbOps.deleteCategory(id);
    },
    [dbReady]
  );

  const getAllCategories = useCallback(async () => {
    if (!dbReady) throw new Error('Database not ready');
    return dbOps.getAllCategories();
  }, [dbReady]);

  // Budget hooks
  const addBudget = useCallback(
    async (budget: Omit<Budget, 'id' | 'createdAt'>) => {
      if (!dbReady) throw new Error('Database not ready');
      return dbOps.addBudget(budget);
    },
    [dbReady]
  );

  const updateBudget = useCallback(
    async (id: string, updates: Partial<Omit<Budget, 'id' | 'createdAt'>>) => {
      if (!dbReady) throw new Error('Database not ready');
      return dbOps.updateBudget(id, updates);
    },
    [dbReady]
  );

  const deleteBudget = useCallback(
    async (id: string) => {
      if (!dbReady) throw new Error('Database not ready');
      return dbOps.deleteBudget(id);
    },
    [dbReady]
  );

  const getBudgetForMonth = useCallback(
    async (month: number, year: number) => {
      if (!dbReady) throw new Error('Database not ready');
      return dbOps.getBudgetForMonth(month, year);
    },
    [dbReady]
  );

  const getAllBudgets = useCallback(async () => {
    if (!dbReady) throw new Error('Database not ready');
    return dbOps.getAllBudgets();
  }, [dbReady]);

  // Analytics hooks
  const getDashboardStats = useCallback(async () => {
    if (!dbReady) throw new Error('Database not ready');
    return dbOps.getDashboardStats();
  }, [dbReady]);

  const getMonthlyStats = useCallback(
    async (month: number, year: number) => {
      if (!dbReady) throw new Error('Database not ready');
      return dbOps.getMonthlyStats(month, year);
    },
    [dbReady]
  );

  const getExpensesByCategory = useCallback(
    async (month?: number, year?: number) => {
      if (!dbReady) throw new Error('Database not ready');
      return dbOps.getExpensesByCategory(month, year);
    },
    [dbReady]
  );

  const getMonthlyIncomeExpenses = useCallback(
    async (monthsBack?: number) => {
      if (!dbReady) throw new Error('Database not ready');
      return dbOps.getMonthlyIncomeExpenses(monthsBack);
    },
    [dbReady]
  );

  return {
    dbReady,
    error,
    // Transactions
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactions,
    getTransactionsByMonth,
    // Categories
    addCategory,
    updateCategory,
    deleteCategory,
    getAllCategories,
    // Budgets
    addBudget,
    updateBudget,
    deleteBudget,
    getBudgetForMonth,
    getAllBudgets,
    // Analytics
    getDashboardStats,
    getMonthlyStats,
    getExpensesByCategory,
    getMonthlyIncomeExpenses,
  };
}

// Hook for fetching data with loading and error states
export function useDBQuery<T>(
  queryFn: () => Promise<T>,
  deps: unknown[] = []
): UseDBState<T> {
  const [state, setState] = useState<UseDBState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        const result = await queryFn();
        if (isMounted) {
          setState({ data: result, loading: false, error: null });
        }
      } catch (err) {
        if (isMounted) {
          setState({
            data: null,
            loading: false,
            error: err instanceof Error ? err : new Error(String(err)),
          });
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, deps);

  return state;
}
