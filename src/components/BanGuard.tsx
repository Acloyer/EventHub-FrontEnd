import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../lib/AuthContext'
import { getMyBanStatus } from '../lib/api'

interface BanGuardProps {
  children: React.ReactNode
}

interface BanInfo {
  isBanned: boolean
  until?: string
  reason?: string
  bannedBy?: string
}

export default function BanGuard({ children }: BanGuardProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [banInfo, setBanInfo] = useState<BanInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkBanStatus = async () => {
      // If user is not authenticated, don't check ban
      if (!user) {
        setLoading(false)
        return
      }

      // If we're already on the /banned page, don't check ban
      if (router.pathname === '/banned') {
        setLoading(false)
        return
      }

      try {
        const status = await getMyBanStatus()
        setBanInfo(status)
        
        // If user is banned, redirect to /banned
        if (status.isBanned) {
          router.push('/banned')
          return
        }
      } catch (error) {
        console.error('Failed to get ban status:', error)
        // In case of error, continue working
      } finally {
        setLoading(false)
      }
    }

    checkBanStatus()
  }, [user, router])

  // Show loading only if user is authenticated and we're not on the /banned page
  if (loading && user && router.pathname !== '/banned') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    )
  }

  // If user is banned and we're not on the /banned page, don't show content
  if (banInfo?.isBanned && router.pathname !== '/banned') {
    return null // Will be redirected in useEffect
  }

  return <>{children}</>
} 