'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth-provider'

export default function Home() {
  const router = useRouter()
  const { isLoggedIn, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      if (isLoggedIn) {
        router.replace('/dashboard')
      } else {
        router.replace('/login')
      }
    }
  }, [isLoggedIn, isLoading, router])

  return null
}
