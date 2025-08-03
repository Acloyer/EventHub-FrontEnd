import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { User, LoginDto, RegisterDto } from './types'
import { login as apiLogin, register as apiRegister, getUserProfile, impersonateUser } from './api'
import { toast } from 'react-hot-toast'
import { useTranslation } from 'next-i18next'
import { useIsClient } from './useIsClient'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  isImpersonating: boolean
  login: (data: LoginDto) => Promise<void>
  register: (data: RegisterDto) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
  startImpersonating: (targetUserId: number) => Promise<void>
  stopImpersonating: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isImpersonating, setIsImpersonating] = useState<boolean>(false)
  const { t } = useTranslation('common')
  const isClient = useIsClient()

  const router = useRouter()

  useEffect(() => {
    if (!isClient) return;
    
    // Check if user is already logged in
    let token: string | null = null
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('token')
      const impersonationToken = localStorage.getItem('impersonationToken')
      setIsImpersonating(!!impersonationToken)
    }

    if (token) {
      refreshUser()
    } else {
      setIsLoading(false)
    }
  }, [isClient])

  const login = async (data: LoginDto) => {
    if (!isClient) return;
    
    try {
      setIsLoading(true)
      const response = await apiLogin(data)
      if (response && response.Token) {
        localStorage.setItem('token', response.Token)
      } else {
        console.error('No token received in login response')
        toast.error(t('auth.noTokenReceived'))
        throw new Error('No token received')
      }
      setUser(response.User)
      
      toast.success(t('auth.loginSuccess'))
      router.push('/')
    } catch (error) {
      console.error('Login error:', error)
      toast.error(t('auth.loginFailed'))
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (data: RegisterDto) => {
    try {
      setIsLoading(true)
      await apiRegister(data)
      router.push('/login')
    } catch (error) {
      console.error('Registration error:', error)
      toast.error(t('auth.registerFailed'))
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    if (!isClient) return;
    
    setUser(null)
    setIsImpersonating(false)
    localStorage.removeItem('token')
    localStorage.removeItem('impersonationToken')
    localStorage.removeItem('originalToken')
    router.push('/login')
  }

  const startImpersonating = async (targetUserId: number) => {
    if (!isClient) return;
    
    try {
      setIsLoading(true)
      
      // Store the original token
      const originalToken = localStorage.getItem('token')
      if (originalToken) {
        localStorage.setItem('originalToken', originalToken)
      }
      
      // Get impersonation token
      const response = await impersonateUser(targetUserId)
      
      // Store the impersonation token
      localStorage.setItem('impersonationToken', response.impersonationToken)
      localStorage.setItem('token', response.impersonationToken)
      
      // Update user state
      setUser(response.targetUser)
      setIsImpersonating(true)
      
      toast.success(t('auth.impersonatingUser', { name: response.targetUser.Name }))
      router.push('/')
    } catch (error) {
      console.error('Impersonation error:', error)
      toast.error(t('auth.impersonationFailed'))
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const stopImpersonating = () => {
    if (!isClient) return;
    
    const originalToken = localStorage.getItem('originalToken')
    if (originalToken) {
      localStorage.setItem('token', originalToken)
      localStorage.removeItem('impersonationToken')
      localStorage.removeItem('originalToken')
      setIsImpersonating(false)
      refreshUser()
      toast.success(t('auth.returnedToOriginalAccount'))
    }
  }

  const refreshUser = async () => {
    if (!isClient) return;
    
    try {
      setIsLoading(true)
      const userData = await getUserProfile()
      setUser(userData)
    } catch (error) {
      console.error('Failed to refresh user profile:', error)
      // Token is invalid or expired - remove it and redirect to login
      localStorage.removeItem('token')
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated: !!user, 
        isLoading, 
        isImpersonating, 
        login, 
        register, 
        logout, 
        refreshUser,
        startImpersonating,
        stopImpersonating
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Higher-order component for protected routes
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function ProtectedRoute(props: P) {
    const { isAuthenticated, isLoading } = useAuth()
    const router = useRouter()

    // List of public routes that don't require authentication
    const publicRoutes = ['/', '/about', '/events', '/login', '/register']
    const isEventDetailsPage = /^\/events\/[^\/]+$/.test(router.pathname)
    const isPublicRoute = publicRoutes.includes(router.pathname) || isEventDetailsPage

    useEffect(() => {
      // Only redirect if not authenticated and not on a public route
      if (!isLoading && !isAuthenticated && !isPublicRoute) {
        router.replace('/login')
      }
    }, [isAuthenticated, isLoading, router, isPublicRoute])

    if (isLoading) {
      return <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    }

    // Allow access to public pages even when not authenticated
    if (!isAuthenticated && !isPublicRoute) {
      return null
    }

    return <Component {...props} />
  }
}

// Higher-order component for admin-only routes
export function withAdminAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AdminRoute(props: P) {
    const { user, isLoading } = useAuth()
    const router = useRouter()
+   const { t } = useTranslation('common')
    const isAdmin = user?.Roles?.some(role => ['Admin', 'SeniorAdmin', 'Owner', 'Organizer'].includes(role)) || false

    useEffect(() => {
      if (!isLoading && (!user || !isAdmin)) {
        toast.error(t('auth.adminAccessRequired'))
        // router.replace('/events')
      }
    }, [user, isAdmin, isLoading, router, t])

    if (isLoading) {
      return <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    }

    if (!user || !isAdmin) {
      return null
    }

    return <Component {...props} />
  }
} 