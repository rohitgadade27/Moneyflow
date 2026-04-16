import { getDB } from './db';
import { User, AuthCredentials, AuthResponse } from './types';

// Simple hash function for demo purposes (NOT for production)
// In production, use proper password hashing library
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

export async function register(credentials: AuthCredentials, name: string): Promise<AuthResponse> {
  try {
    const db = await getDB();

    // Validate input
    if (!credentials.email || !credentials.password || !name) {
      return { success: false, message: 'All fields are required' };
    }

    if (credentials.password.length < 5) {
      return { success: false, message: 'Password must be at least 5 characters' };
    }

    // Check if user already exists
    const existingUser = await db.getFromIndex('users', 'by-email', credentials.email);
    if (existingUser) {
      return { success: false, message: 'Email already registered' };
    }

    // Hash password
    const passwordHash = await hashPassword(credentials.password);

    // Create user
    const userId = `user_${Date.now()}`;
    const newUser: User & { passwordHash: string } = {
      id: userId,
      email: credentials.email,
      name,
      passwordHash,
      createdAt: Date.now(),
    };

    await db.put('users', newUser);

    // Set session
    localStorage.setItem('currentUserId', userId);

    return {
      success: true,
      message: 'Registration successful',
      user: {
        id: userId,
        email: credentials.email,
        name,
        createdAt: Date.now(),
      },
    };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, message: 'Registration failed' };
  }
}

export async function login(credentials: AuthCredentials): Promise<AuthResponse> {
  try {
    const db = await getDB();

    // Find user by email
    const user = await db.getFromIndex('users', 'by-email', credentials.email);
    if (!user) {
      return { success: false, message: 'Invalid email or password' };
    }

    // Verify password
    const passwordValid = await verifyPassword(credentials.password, user.passwordHash);
    if (!passwordValid) {
      return { success: false, message: 'Invalid email or password' };
    }

    // Set session
    localStorage.setItem('currentUserId', user.id);

    return {
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
    };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'Login failed' };
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const userId = localStorage.getItem('currentUserId');
    if (!userId) {
      return null;
    }

    const db = await getDB();
    const user = await db.get('users', userId);
    
    if (!user) {
      localStorage.removeItem('currentUserId');
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    };
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

export function logout(): void {
  localStorage.removeItem('currentUserId');
}

export function isUserLoggedIn(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('currentUserId');
}

export async function seedDemoAccount(): Promise<void> {
  try {
    const db = await getDB();
    
    // Check if demo account already exists
    const demoUser = await db.getFromIndex('users', 'by-email', '1234');
    if (demoUser) {
      return; // Demo account already exists
    }

    // Create demo account with credentials: 1234 / 1234@
    const passwordHash = await hashPassword('1234@');
    const demoAccountId = 'user_demo';
    
    await db.put('users', {
      id: demoAccountId,
      email: '1234',
      name: 'Demo User',
      passwordHash,
      createdAt: Date.now(),
    });

    // Add default categories
    const defaultCategories = [
      { id: 'food', name: 'Food & Groceries', color: '#FF6B6B', icon: '🍔' },
      { id: 'utilities', name: 'Utilities', color: '#4ECDC4', icon: '💡' },
      { id: 'salary', name: 'Salary', color: '#95E1D3', icon: '💰' },
      { id: 'freelance', name: 'Freelance', color: '#FFE66D', icon: '💻' },
      { id: 'entertainment', name: 'Entertainment', color: '#FF6B9D', icon: '🎬' },
      { id: 'transport', name: 'Transport', color: '#A8E6CF', icon: '🚗' },
      { id: 'healthcare', name: 'Healthcare', color: '#FFD3B6', icon: '🏥' },
      { id: 'shopping', name: 'Shopping', color: '#FFAAA5', icon: '🛍️' },
      { id: 'other', name: 'Other', color: '#CCCCCC', icon: '📦' },
    ];

    for (const cat of defaultCategories) {
      const existing = await db.get('categories', cat.id);
      if (!existing) {
        await db.put('categories', cat);
      }
    }

    // Add demo transactions
    const demoTransactions = [
      {
        id: 'tx_1',
        title: 'Monthly Salary',
        amount: 50000,
        type: 'income' as const,
        category: 'salary',
        date: new Date().toISOString().split('T')[0],
        createdAt: Date.now(),
      },
      {
        id: 'tx_2',
        title: 'Grocery Shopping',
        amount: 2500,
        type: 'expense' as const,
        category: 'food',
        date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        createdAt: Date.now() - 86400000,
      },
      {
        id: 'tx_3',
        title: 'Electric Bill',
        amount: 1200,
        type: 'expense' as const,
        category: 'utilities',
        date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
        createdAt: Date.now() - 172800000,
      },
      {
        id: 'tx_4',
        title: 'Freelance Project',
        amount: 15000,
        type: 'income' as const,
        category: 'freelance',
        date: new Date(Date.now() - 259200000).toISOString().split('T')[0],
        createdAt: Date.now() - 259200000,
      },
      {
        id: 'tx_5',
        title: 'Movie Tickets',
        amount: 600,
        type: 'expense' as const,
        category: 'entertainment',
        date: new Date(Date.now() - 345600000).toISOString().split('T')[0],
        createdAt: Date.now() - 345600000,
      },
    ];

    for (const tx of demoTransactions) {
      await db.put('transactions', tx);
    }
  } catch (error) {
    console.error('Failed to seed demo account:', error);
  }
}
