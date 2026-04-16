'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard,
  ArrowRightLeft,
  Wallet,
  Tags,
  BarChart3,
  Menu,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from './auth-provider'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Transactions', href: '/transactions', icon: ArrowRightLeft },
  { name: 'Budgets', href: '/budgets', icon: Wallet },
  { name: 'Categories', href: '/categories', icon: Tags },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { logout, user, isLoggedIn } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  if (!isLoggedIn) {
    return null
  }

  if (isMobile) {
    return (
      <>
        {/* Mobile Header */}
        <header className="fixed top-0 left-0 right-0 bg-slate-900 text-white border-b border-slate-800 p-4 z-40 flex items-center justify-between md:hidden">
          <h1 className="text-lg font-bold flex items-center gap-2">
            <Wallet className="w-5 h-5 text-teal-400" />
            MoneyFlow
          </h1>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 hover:bg-slate-800 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 flex gap-1 px-2 py-2 md:hidden z-40">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex-1 flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-colors text-xs',
                  isActive
                    ? 'bg-teal-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="hidden sm:inline">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Mobile Drawer Menu */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
        )}
        <aside className={cn(
          'fixed top-0 left-0 bottom-0 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300 z-40 md:hidden',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}>
          {/* Logo/Header */}
          <div className="p-6 border-b border-slate-800">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Wallet className="w-6 h-6 text-teal-400" />
              MoneyFlow
            </h1>
            <p className="text-sm text-slate-400 mt-1">Manage your finances</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                    isActive
                      ? 'bg-teal-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-800 space-y-3">
            {user && (
              <div className="text-xs text-slate-400 px-4 py-2 bg-slate-800 rounded-lg">
                <p className="font-semibold text-slate-300">{user.name}</p>
                <p className="text-slate-500 truncate">{user.email}</p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-900 hover:bg-opacity-20 w-full transition-colors text-sm font-medium"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </aside>
      </>
    )
  }

  return (
    <aside className="w-64 bg-slate-900 text-white h-screen flex flex-col hidden md:flex">
      {/* Logo/Header */}
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Wallet className="w-6 h-6 text-emerald-400" />
          MoneyFlow
        </h1>
        <p className="text-sm text-slate-400 mt-1">Manage your finances</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                isActive
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800 space-y-3">
        {user && (
          <div className="text-xs text-slate-400 px-4 py-2 bg-slate-800 rounded-lg">
            <p className="font-semibold text-slate-300">{user.name}</p>
            <p className="text-slate-500">{user.email}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-900 hover:bg-opacity-20 w-full transition-colors text-sm font-medium"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
