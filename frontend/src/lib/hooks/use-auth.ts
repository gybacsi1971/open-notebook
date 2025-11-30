'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { getLogoutRedirectUrl } from '@/lib/config'
import { useAuthStore } from '@/lib/stores/auth-store'
export function useAuth() {
  const router = useRouter()
  const {
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuth,
    checkAuthRequired,
    error,
    hasHydrated,
    authRequired
  } = useAuthStore()

  useEffect(() => {
    // Only check auth after the store has hydrated from localStorage
    if (hasHydrated) {
      // First check if auth is required
      if (authRequired === null) {
        checkAuthRequired().then((required) => {
          // If auth is required, check if we have valid credentials
          if (required) {
            checkAuth()
          }
        })
      } else if (authRequired) {
        // Auth is required, check credentials
        checkAuth()
      }
      // If authRequired === false, we're already authenticated (set in checkAuthRequired)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated, authRequired])

  const handleLogin = async (password: string) => {
    const success = await login(password)
    if (success) {
      // Check if there's a stored redirect path
      const redirectPath = sessionStorage.getItem('redirectAfterLogin')
      if (redirectPath) {
        sessionStorage.removeItem('redirectAfterLogin')
        router.push(redirectPath)
      } else {
        router.push('/notebooks')
      }
    }
    return success
  }

  const handleLogout = async () => {
    logout()
    const target = await getLogoutRedirectUrl()
    if (target.startsWith('http')) {
      window.location.assign(target)
    } else {
      router.push(target)
    }
  }

  return {
    isAuthenticated,
    isLoading: isLoading || !hasHydrated, // Treat lack of hydration as loading
    error,
    login: handleLogin,
    logout: handleLogout
  }
}
