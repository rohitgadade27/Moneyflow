import { getDB } from './db';
import {
  Transaction,
  TransactionType,
  Category,
  Budget,
  DashboardStats,
  TransactionFilters,
} from './types';

// Transaction Operations
export async function addTransaction(
  transaction: Omit<Transaction, 'id' | 'createdAt'>
): Promise<Transaction> {
  const db = await getDB();
  const newTransaction: Transaction = {
    ...transaction,
    id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: Date.now(),
  };
  await db.put('transactions', newTransaction);
  return newTransaction;
}

export async function updateTransaction(
  id: string,
  updates: Partial<Omit<Transaction, 'id' | 'createdAt'>>
): Promise<void> {
  const db = await getDB();
  const transaction = await db.get('transactions', id);
  if (!transaction) {
    throw new Error(`Transaction ${id} not found`);
  }
  await db.put('transactions', { ...transaction, ...updates });
}

export async function deleteTransaction(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('transactions', id);
}

export async function getTransaction(id: string): Promise<Transaction | undefined> {
  const db = await getDB();
  return db.get('transactions', id);
}

export async function getTransactions(
  filters?: TransactionFilters
): Promise<Transaction[]> {
  const db = await getDB();
  let transactions = await db.getAll('transactions');

  if (filters) {
    transactions = transactions.filter((tx) => {
      if (filters.startDate && tx.date < filters.startDate) return false;
      if (filters.endDate && tx.date > filters.endDate) return false;
      if (filters.category && tx.category !== filters.category) return false;
      if (filters.type && tx.type !== filters.type) return false;
      return true;
    });
  }

  // Sort by date descending (newest first)
  return transactions.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export async function getTransactionsByMonth(
  month: number,
  year: number
): Promise<Transaction[]> {
  const db = await getDB();
  const allTransactions = await db.getAll('transactions');

  return allTransactions.filter((tx) => {
    const txDate = new Date(tx.date);
    return txDate.getMonth() === month && txDate.getFullYear() === year;
  });
}

// Category Operations
export async function addCategory(
  category: Omit<Category, 'id'>
): Promise<Category> {
  const db = await getDB();
  const newCategory: Category = {
    ...category,
    id: `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  };
  await db.put('categories', newCategory);
  return newCategory;
}

export async function updateCategory(
  id: string,
  updates: Partial<Omit<Category, 'id'>>
): Promise<void> {
  const db = await getDB();
  const category = await db.get('categories', id);
  if (!category) {
    throw new Error(`Category ${id} not found`);
  }
  await db.put('categories', { ...category, ...updates });
}

export async function deleteCategory(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('categories', id);
}

export async function getCategory(id: string): Promise<Category | undefined> {
  const db = await getDB();
  return db.get('categories', id);
}

export async function getAllCategories(): Promise<Category[]> {
  const db = await getDB();
  return db.getAll('categories');
}

// Budget Operations
export async function addBudget(
  budget: Omit<Budget, 'id' | 'createdAt'>
): Promise<Budget> {
  const db = await getDB();
  const newBudget: Budget = {
    ...budget,
    id: `budget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: Date.now(),
  };
  await db.put('budgets', newBudget);
  return newBudget;
}

export async function updateBudget(
  id: string,
  updates: Partial<Omit<Budget, 'id' | 'createdAt'>>
): Promise<void> {
  const db = await getDB();
  const budget = await db.get('budgets', id);
  if (!budget) {
    throw new Error(`Budget ${id} not found`);
  }
  await db.put('budgets', { ...budget, ...updates });
}

export async function deleteBudget(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('budgets', id);
}

export async function getBudget(id: string): Promise<Budget | undefined> {
  const db = await getDB();
  return db.get('budgets', id);
}

export async function getBudgetForMonth(
  month: number,
  year: number
): Promise<Budget | undefined> {
  const db = await getDB();
  const budgets = await db.getAllFromIndex(
    'budgets',
    'by-month-year',
    [month, year]
  );
  return budgets[0];
}

export async function getAllBudgets(): Promise<Budget[]> {
  const db = await getDB();
  return db.getAll('budgets');
}

// Analytics and Statistics
export async function getDashboardStats(): Promise<DashboardStats> {
  const transactions = await getTransactions();

  const totalIncome = transactions
    .filter((tx) => tx.type === TransactionType.INCOME)
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpenses = transactions
    .filter((tx) => tx.type === TransactionType.EXPENSE)
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalBalance = totalIncome - totalExpenses;
  const savingsRate =
    totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

  return {
    totalBalance,
    totalIncome,
    totalExpenses,
    savingsRate: Math.round(savingsRate * 100) / 100,
  };
}

export async function getMonthlyStats(
  month: number,
  year: number
): Promise<DashboardStats> {
  const transactions = await getTransactionsByMonth(month, year);

  const totalIncome = transactions
    .filter((tx) => tx.type === TransactionType.INCOME)
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpenses = transactions
    .filter((tx) => tx.type === TransactionType.EXPENSE)
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalBalance = totalIncome - totalExpenses;
  const savingsRate =
    totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

  return {
    totalBalance,
    totalIncome,
    totalExpenses,
    savingsRate: Math.round(savingsRate * 100) / 100,
  };
}

export async function getExpensesByCategory(
  month?: number,
  year?: number
): Promise<{ category: string; amount: number; categoryId: string }[]> {
  let transactions: Transaction[];

  if (month !== undefined && year !== undefined) {
    transactions = await getTransactionsByMonth(month, year);
  } else {
    transactions = await getTransactions();
  }

  const expenseTransactions = transactions.filter(
    (tx) => tx.type === TransactionType.EXPENSE
  );

  const categoryMap = new Map<
    string,
    { amount: number; categoryId: string }
  >();

  for (const tx of expenseTransactions) {
    const existing = categoryMap.get(tx.category) || {
      amount: 0,
      categoryId: tx.category,
    };
    categoryMap.set(tx.category, {
      amount: existing.amount + tx.amount,
      categoryId: tx.category,
    });
  }

  return Array.from(categoryMap.entries()).map(([category, data]) => ({
    category,
    ...data,
  }));
}

export async function getMonthlyIncomeExpenses(
  monthsBack: number = 12
): Promise<
  { month: string; income: number; expenses: number; year: number }[]
> {
  const now = new Date();
  const data = [];

  for (let i = monthsBack - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = date.getMonth();
    const year = date.getFullYear();

    const stats = await getMonthlyStats(month, year);

    data.push({
      month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      income: stats.totalIncome,
      expenses: stats.totalExpenses,
      year,
    });
  }

  return data;
}
