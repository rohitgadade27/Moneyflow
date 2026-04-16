export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string; // ISO date string (YYYY-MM-DD)
  notes?: string;
  createdAt: number; // timestamp
}

export interface Category {
  id: string;
  name: string;
  color: string; // hex color code
}

export interface BudgetEntry {
  categoryId: string;
  limit: number;
}

export interface Budget {
  id: string;
  month: number; // 0-11
  year: number;
  entries: BudgetEntry[];
  createdAt: number;
}

export interface DashboardStats {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  savingsRate: number; // percentage
}

export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  category?: string;
  type?: TransactionType;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: number;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
}
