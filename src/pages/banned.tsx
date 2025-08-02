import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { ShieldExclamationIcon, ClockIcon, UserIcon } from '@heroicons/react/24/outline'
import { getMyBanStatus } from '../lib/api'
import { useAuth } from '../lib/AuthContext'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { GetServerSideProps } from 'next'

interface BanInfo {
  isBanned: boolean
  until?: string
  reason?: string
  bannedBy?: string
}

export default function BannedPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { user } = useAuth()
  const [banInfo, setBanInfo] = useState<BanInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkBanStatus = async () => {
      try {
        const status = await getMyBanStatus()
        setBanInfo(status)
      } catch (error) {
        console.error('Error checking ban status:', error)
      } finally {
        setLoading(false)
      }
    }

    checkBanStatus()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    )
  }

  // If user is not banned, redirect to home
  if (!banInfo?.isBanned) {
    router.push('/')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <ShieldExclamationIcon className="h-16 w-16 text-red-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {t('common.accountBanned')}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {t('common.accountBannedDescription')}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div className="flex items-center">
              <ClockIcon className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {t('common.banExpires')}
                </p>
                <p className="text-sm text-gray-500">
                  {banInfo.until ? new Date(banInfo.until).toLocaleDateString() : t('common.permanentBan')}
                </p>
              </div>
            </div>

            {banInfo.reason && (
              <div className="flex items-start">
                <UserIcon className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {t('common.banReason')}
                  </p>
                  <p className="text-sm text-gray-500">{banInfo.reason}</p>
                </div>
              </div>
            )}

            {banInfo.bannedBy && (
              <div className="flex items-center">
                <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {t('common.bannedBy')}
                  </p>
                  <p className="text-sm text-gray-500">{banInfo.bannedBy}</p>
                </div>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <ShieldExclamationIcon className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    {t('common.contactSupport')}
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      {t('common.banAppealInstructions')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common'])),
    },
  }
}
