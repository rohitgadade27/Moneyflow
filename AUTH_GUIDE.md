# MoneyFlow Authentication Guide

## Default Demo Account

MoneyFlow comes with a pre-configured demo account for quick testing:

- **Email/ID:** `1234`
- **Password:** `1234@`

These credentials are automatically pre-filled on the login page.

## Features

### Login
- Users can log in with the default demo account (1234 / 1234@)
- After successful login, users are automatically redirected to the dashboard
- Session is stored in browser localStorage with IndexedDB for persistent data

### Register
- New users can create their own account with custom credentials
- Registration requires:
  - Full Name
  - Email/ID (any unique identifier)
  - Password (minimum 5 characters)
  - Password confirmation
- After successful registration, users are automatically logged in and redirected to the dashboard

### Logout
- Users can log out from the sidebar menu (bottom-left on desktop, sliding drawer on mobile)
- Logout clears the session and redirects to the login page

## Local Database (IndexedDB)

All user data is stored locally in the browser using IndexedDB:

- **Database Name:** MoneyManager
- **Stores:**
  - `users` - Stores user account information with email index
  - `transactions` - Stores financial transactions with date, category, and type indexes
  - `categories` - Stores transaction categories
  - `budgets` - Stores budget information with month-year index

### Data Persistence

- User credentials are hashed using SHA-256 before storage
- Each transaction is timestamped with local creation time
- All data persists across browser sessions until manually cleared
- Users can switch between different accounts, each with isolated data

## Security Notes

- Passwords are hashed using SHA-256 (suitable for local demo purposes)
- Session is stored in localStorage as `currentUserId`
- In production, implement proper server-side authentication and use bcrypt or similar for password hashing
- HTTPS should be enforced in production

## Getting Started

1. **Quick Start (Demo Account):**
   - Login page loads with default credentials pre-filled (1234 / 1234@)
   - Click Login to access the dashboard immediately

2. **Create New Account:**
   - Click "Create an account" on the login page
   - Fill in your details (name, email/ID, password)
   - You'll be logged in and directed to the dashboard

3. **Dashboard:**
   - View financial summary (balance, income, expenses, savings rate)
   - See recent transactions
   - Navigate to other sections using sidebar (desktop) or bottom nav (mobile)

## Currency

- All amounts are displayed in **Indian Rupees (₹)**
- Locale: en-IN
- No decimal places displayed for whole number amounts

## Mobile & Responsive Design

- Desktop: Sidebar on the left
- Tablet/Mobile: Bottom navigation bar
- All features are fully responsive and touch-friendly
