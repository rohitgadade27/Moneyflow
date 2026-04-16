import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Category, Budget, Transaction, User } from './types';

interface MoneyManagerDB extends DBSchema {
  users: {
    key: string;
    value: User & { passwordHash: string };
    indexes: {
      'by-email': string;
    };
  };
  transactions: {
    key: string;
    value: Transaction;
    indexes: {
      'by-date': string;
      'by-category': string;
      'by-type': string;
    };
  };
  categories: {
    key: string;
    value: Category;
  };
  budgets: {
    key: string;
    value: Budget;
    indexes: {
      'by-month-year': [number, number];
    };
  };
}

let dbInstance: IDBPDatabase<MoneyManagerDB> | null = null;

export async function initDB(): Promise<IDBPDatabase<MoneyManagerDB>> {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await openDB<MoneyManagerDB>('MoneyManager', 1, {
    upgrade(db) {
      // Create users store
      if (!db.objectStoreNames.contains('users')) {
        const userStore = db.createObjectStore('users', { keyPath: 'id' });
        userStore.createIndex('by-email', 'email');
      }

      // Create transactions store
      if (!db.objectStoreNames.contains('transactions')) {
        const txStore = db.createObjectStore('transactions', { keyPath: 'id' });
        txStore.createIndex('by-date', 'date');
        txStore.createIndex('by-category', 'category');
        txStore.createIndex('by-type', 'type');
      }

      // Create categories store
      if (!db.objectStoreNames.contains('categories')) {
        db.createObjectStore('categories', { keyPath: 'id' });
      }

      // Create budgets store
      if (!db.objectStoreNames.contains('budgets')) {
        const budgetStore = db.createObjectStore('budgets', { keyPath: 'id' });
        budgetStore.createIndex('by-month-year', ['month', 'year']);
      }
    },
  });

  // Initialize default categories if empty
  const categoryCount = await dbInstance.count('categories');
  if (categoryCount === 0) {
    await initializeDefaultCategories();
  }

  return dbInstance;
}

export async function getDB(): Promise<IDBPDatabase<MoneyManagerDB>> {
  if (!dbInstance) {
    return initDB();
  }
  return dbInstance;
}

async function initializeDefaultCategories(): Promise<void> {
  const db = await getDB();
  const defaultCategories: Category[] = [
    { id: 'salary', name: 'Salary', color: '#10b981' },
    { id: 'freelance', name: 'Freelance', color: '#06b6d4' },
    { id: 'investment', name: 'Investment', color: '#8b5cf6' },
    { id: 'food', name: 'Food', color: '#f97316' },
    { id: 'transport', name: 'Transport', color: '#f59e0b' },
    { id: 'utilities', name: 'Utilities', color: '#6366f1' },
    { id: 'entertainment', name: 'Entertainment', color: '#ec4899' },
    { id: 'health', name: 'Health', color: '#ef4444' },
    { id: 'shopping', name: 'Shopping', color: '#d946ef' },
    { id: 'rent', name: 'Rent', color: '#14b8a6' },
    { id: 'insurance', name: 'Insurance', color: '#64748b' },
    { id: 'other', name: 'Other', color: '#78716c' },
  ];

  for (const category of defaultCategories) {
    await db.put('categories', category);
  }
}
