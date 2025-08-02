import { useState, useEffect } from 'react'
import { useAuth } from '../../lib/AuthContext'
import { toast } from 'react-hot-toast'
import AdminLayout from '../../components/AdminLayout'
import { startSeedConfirmation, confirmDeleteCode } from '../../lib/api'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { GetServerSideProps } from 'next'
import Link from 'next/link'
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChatBubbleLeftRightIcon,
  TrashIcon,
  PlusIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'

interface DatabaseStats {
  users: number
  events: number
  comments: number
  reactions: number
}

export default function SeedDatabasePage() {
  const { t } = useTranslation()
  const { isAuthenticated, user } = useAuth()
  
  // States for access control
  const [isAccessGranted, setIsAccessGranted] = useState(false)
  const [enteredCode, setEnteredCode] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [isGeneratingCode, setIsGeneratingCode] = useState(false)
  
  // States for database operations
  const [databaseStats, setDatabaseStats] = useState<DatabaseStats>({
    users: 0,
    events: 0,
    comments: 0,
    reactions: 0
  })
  
  // Seed configuration states
  const [seedConfig, setSeedConfig] = useState({
    users: {
      admin: true,
      regular: true,
      organizers: true
    },
    events: {
      upcoming: true,
      past: true,
      categories: true
    },
    content: {
      comments: true,
      reactions: true,
      favorites: true
    }
  })

  // Check if user has Telegram connected
  const hasTelegramConnected = user?.TelegramId && user.TelegramId > 0



    // Handle verification code generation and sending
  const handleGenerateCode = async () => {
    if (!hasTelegramConnected) {
      toast.error(t('admin.telegramRequiredForDeletion'))
      return
    }

    setIsGeneratingCode(true)
    try {
      await startSeedConfirmation()
      toast.success(t('admin.verificationCodeSent'))
    } catch (error) {
      console.error('Failed to send verification code:', error)
      toast.error(t('admin.failedToSendCode'))
    } finally {
      setIsGeneratingCode(false)
    }
  }

  // Handle code verification
  const handleVerifyCode = async () => {
    setIsVerifying(true)
    try {
      await confirmDeleteCode({ code: parseInt(enteredCode) })
      setIsAccessGranted(true)
      toast.success(t('admin.accessGranted'))
      setEnteredCode('')
    } catch (error) {
      toast.error(t('admin.invalidCode'))
      setEnteredCode('')
    } finally {
      setIsVerifying(false)
    }
  }

  // Handle seed database
  const handleSeedDatabase = async () => {
    try {
      // TODO: Implement seed database API call
      toast.success(t('admin.databaseSeeded'))
    } catch (error) {
      console.error('Failed to seed database:', error)
      toast.error(t('admin.failedToSeedDatabase'))
    }
  }

  // Handle clear database
  const handleClearDatabase = async () => {
    if (!isAccessGranted) {
      toast.error(t('admin.accessRequiredForDeletion'))
      return
    }

    try {
      // TODO: Implement clear database API call
      toast.success(t('admin.databaseCleared'))
      setIsAccessGranted(false) // Reset access after clearing
    } catch (error) {
      console.error('Failed to clear database:', error)
      toast.error(t('admin.failedToClearDatabase'))
    }
  }

  // Access control check
  if (!isAuthenticated || !user?.Roles?.some(role => ['Admin', 'SeniorAdmin', 'Owner'].includes(role))) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {t('common.accessDenied')}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {t('common.adminAccessRequired')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <AdminLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          {t('admin.seedDatabase')}
        </h1>

        {/* Access Control Section */}
        {!isAccessGranted && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-6 w-6 text-amber-500" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {t('admin.accessControlRequired')}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {t('admin.accessControlDescription')}
                </p>

                {!hasTelegramConnected ? (
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <ChatBubbleLeftRightIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      <div>
                        <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                          {t('admin.telegramNotConnected')}
                        </p>
                        <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                          {t('admin.telegramRequiredForAccess')}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Link
                        href="/profile"
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-amber-800 bg-amber-100 border border-amber-300 rounded-md hover:bg-amber-200 dark:text-amber-200 dark:bg-amber-900/30 dark:border-amber-700 dark:hover:bg-amber-900/50 transition-colors"
                      >
                        {t('admin.connectTelegramInProfile')}
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <button
                      onClick={handleGenerateCode}
                      disabled={isGeneratingCode}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                    >
                      {isGeneratingCode ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                          {t('admin.generatingCode')}
                        </>
                      ) : (
                        <>
                          <Cog6ToothIcon className="h-4 w-4 mr-2" />
                          {t('admin.generateVerificationCode')}
                        </>
                      )}
                    </button>
                    
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t('admin.enterVerificationCode')}
                      </p>
                      <div className="flex space-x-3">
                        <input
                          type="text"
                          value={enteredCode}
                          onChange={(e) => setEnteredCode(e.target.value)}
                          placeholder="000000"
                          maxLength={6}
                          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                        />
                        <button
                          onClick={handleVerifyCode}
                          disabled={enteredCode.length !== 6 || isVerifying}
                          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                          {isVerifying ? t('admin.verifying') : t('admin.verify')}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Content - Only shown after access is granted */}
        {isAccessGranted && (
          <>
            {/* Database Status */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  {t('admin.databaseStatus')}
                </h2>
                <div className="space-y-3">
                  {Object.entries(databaseStats).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="text-sm text-gray-600 dark:text-gray-300 capitalize">
                        {t(`admin.${key}`)}
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  {t('admin.quickActions')}
                </h2>
                <div className="space-y-3">
                  <button
                    onClick={handleSeedDatabase}
                    className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    {t('admin.seedDatabase')}
                  </button>
                  
                  <button
                    onClick={handleClearDatabase}
                    className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-md hover:bg-red-50 dark:text-red-400 dark:bg-gray-800 dark:border-red-600 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <TrashIcon className="h-4 w-4 mr-2" />
                    {t('admin.clearDatabase')}
                  </button>
                </div>
              </div>

              {/* Access Status */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  {t('admin.accessStatus')}
                </h2>
                <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                      {t('admin.accessGranted')}
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      {t('admin.allOperationsAvailable')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Seed Configuration */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                {t('admin.seedConfiguration')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Users Configuration */}
                <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                    {t('admin.users')}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {t('admin.createSampleUsersDescription')}
                  </p>
                  <div className="space-y-2">
                    {Object.entries(seedConfig.users).map(([key, checked]) => (
                      <label key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => setSeedConfig(prev => ({
                            ...prev,
                            users: { ...prev.users, [key]: e.target.checked }
                          }))}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          {t(`admin.${key}Users`)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Events Configuration */}
                <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                    {t('admin.events')}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {t('admin.generateSampleEventsDescription')}
                  </p>
                  <div className="space-y-2">
                    {Object.entries(seedConfig.events).map(([key, checked]) => (
                      <label key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => setSeedConfig(prev => ({
                            ...prev,
                            events: { ...prev.events, [key]: e.target.checked }
                          }))}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          {t(`admin.${key}Events`)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Content Configuration */}
                <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                    {t('admin.content')}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {t('admin.addSampleContentDescription')}
                  </p>
                  <div className="space-y-2">
                    {Object.entries(seedConfig.content).map(([key, checked]) => (
                      <label key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => setSeedConfig(prev => ({
                            ...prev,
                            content: { ...prev.content, [key]: e.target.checked }
                          }))}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          {t(`admin.${key}`)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common'])),
    },
  }
}
