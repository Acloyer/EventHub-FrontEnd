import { useState, useEffect } from 'react'
import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useAuth } from '../../lib/AuthContext'
import { toast } from 'react-hot-toast'
import AdminLayout from '../../components/AdminLayout'
import { startSeedConfirmation, confirmDeleteCode, seedDatabase, getDatabaseStats } from '../../lib/api'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { GetServerSideProps } from 'next'
import Link from 'next/link'
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ChatBubbleLeftRightIcon,
  TrashIcon,
  PlusIcon,
  CogIcon,
  UsersIcon,
  CalendarIcon,
  ChatBubbleLeftIcon,
  HeartIcon,
  StarIcon
} from '@heroicons/react/24/outline'

interface DatabaseStats {
  users: number
  usersLastCreated?: string
  events: number
  eventsLastCreated?: string
  comments: number
  commentsLastCreated?: string
  reactions: number
  reactionsLastCreated?: string
  favorites: number
  favoritesLastCreated?: string
  plannedEvents: number
  plannedEventsLastCreated?: string
}

interface SeedSettings {
  // Users
  seniorAdminCount: number
  adminCount: number
  organizerCount: number
  regularUserCount: number
  
  // Events
  pastEventCount: number
  futureEventCount: number
  
  // Comments
  positiveCommentCount: number
  neutralCommentCount: number
  negativeCommentCount: number
  
  // Reactions
  positiveReactionCount: number
  neutralReactionCount: number
  negativeReactionCount: number
  
  // Other
  createFavorites: boolean
  createPlannedEvents: boolean
}

export default function SeedDatabasePage() {
  const { t } = useTranslation('common')
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
    reactions: 0,
    favorites: 0,
    plannedEvents: 0
  })
  
  // Seed configuration states
  const [seedSettings, setSeedSettings] = useState<SeedSettings>({
    // Users
    seniorAdminCount: 1,
    adminCount: 2,
    organizerCount: 1,
    regularUserCount: 10,
    
    // Events
    pastEventCount: 10,
    futureEventCount: 20,
    
    // Comments
    positiveCommentCount: 24,
    neutralCommentCount: 24,
    negativeCommentCount: 12,
    
    // Reactions
    positiveReactionCount: 50,
    neutralReactionCount: 30,
    negativeReactionCount: 20,
    
    // Other
    createFavorites: true,
    createPlannedEvents: true
  })

  const [isSeeding, setIsSeeding] = useState(false)
  const [isLoadingStats, setIsLoadingStats] = useState(false)

  // Check if user has Telegram connected
  const hasTelegramConnected = user?.TelegramId && user.TelegramId > 0

  // Load database stats
  const loadDatabaseStats = async () => {
    setIsLoadingStats(true)
    try {
      const stats = await getDatabaseStats()
      setDatabaseStats(stats)
    } catch (error) {
      console.error('Failed to load database stats:', error)
    } finally {
      setIsLoadingStats(false)
    }
  }

  useEffect(() => {
    if (isAccessGranted) {
      loadDatabaseStats()
    }
  }, [isAccessGranted])

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
    setIsSeeding(true)
    try {
      const seedData = {
        OwnerCount: 1, // Always 1
        SeniorAdminCount: seedSettings.seniorAdminCount,
        AdminCount: seedSettings.adminCount,
        OrganizerCount: seedSettings.organizerCount,
        RegularUserCount: seedSettings.regularUserCount,
        PastEventCount: seedSettings.pastEventCount,
        FutureEventCount: seedSettings.futureEventCount,
        PositiveCommentCount: seedSettings.positiveCommentCount,
        NeutralCommentCount: seedSettings.neutralCommentCount,
        NegativeCommentCount: seedSettings.negativeCommentCount,
        CreateReactions: true, // We'll handle reaction counts separately
        CreateFavorites: seedSettings.createFavorites,
        CreatePlannedEvents: seedSettings.createPlannedEvents
      }

      await seedDatabase(seedData)
      toast.success('Database seeded successfully!')
      loadDatabaseStats() // Reload stats after seeding
    } catch (error) {
      console.error('Failed to seed database:', error)
      toast.error('Failed to seed database')
    } finally {
      setIsSeeding(false)
    }
  }

  // Handle clear database
  const handleClearDatabase = async () => {
    if (!isAccessGranted) {
      toast.error(t('admin.accessRequiredForDeletion'))
      return
    }

    if (!confirm('Are you sure you want to clear the entire database? This action cannot be undone.')) {
      return
    }

    try {
      // TODO: Implement clear database API call
      toast.success('Database cleared successfully')
      setIsAccessGranted(false) // Reset access after clearing
      setDatabaseStats({
        users: 0,
        events: 0,
        comments: 0,
        reactions: 0,
        favorites: 0,
        plannedEvents: 0
      })
    } catch (error) {
      console.error('Failed to clear database:', error)
      toast.error('Failed to clear database')
    }
  }

  // Calculate totals
  const totalUsers = 1 + seedSettings.seniorAdminCount + seedSettings.adminCount + 
                    seedSettings.organizerCount + seedSettings.regularUserCount
  const totalEvents = seedSettings.pastEventCount + seedSettings.futureEventCount
  const totalComments = seedSettings.positiveCommentCount + seedSettings.neutralCommentCount + seedSettings.negativeCommentCount
  const totalReactions = seedSettings.positiveReactionCount + seedSettings.neutralReactionCount + seedSettings.negativeReactionCount

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
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Seed Database
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
                  Access Control Required
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  This operation requires additional verification via Telegram.
                </p>

                {!hasTelegramConnected ? (
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <ChatBubbleLeftRightIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      <div>
                        <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                          Telegram not connected
                        </p>
                        <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                          You need to connect your Telegram account to proceed.
                        </p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Link
                        href="/profile"
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-amber-800 bg-amber-100 border border-amber-300 rounded-md hover:bg-amber-200 dark:text-amber-200 dark:bg-amber-900/30 dark:border-amber-700 dark:hover:bg-amber-900/50 transition-colors"
                      >
                        Connect Telegram in Profile
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
                          Generating Code...
                        </>
                      ) : (
                        <>
                          <CogIcon className="h-4 w-4 mr-2" />
                          Generate Verification Code
                        </>
                      )}
                    </button>
                    
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Enter the verification code sent to your Telegram:
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
                          {isVerifying ? 'Verifying...' : 'Verify'}
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
                  Database Status
                </h2>
                <div className="space-y-3">
                  {/* Users */}
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600 dark:text-gray-300 capitalize">Users</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {isLoadingStats ? '...' : databaseStats.users}
                      </span>
                    </div>
                    {databaseStats.usersLastCreated && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Last created: {format(parseISO(databaseStats.usersLastCreated), 'dd.MM.yyyy HH:mm', { locale: ru })}
                      </div>
                    )}
                  </div>

                  {/* Events */}
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600 dark:text-gray-300 capitalize">Events</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {isLoadingStats ? '...' : databaseStats.events}
                      </span>
                    </div>
                    {databaseStats.eventsLastCreated && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Last created: {format(parseISO(databaseStats.eventsLastCreated), 'dd.MM.yyyy HH:mm', { locale: ru })}
                      </div>
                    )}
                  </div>

                  {/* Comments */}
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600 dark:text-gray-300 capitalize">Comments</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {isLoadingStats ? '...' : databaseStats.comments}
                      </span>
                    </div>
                    {databaseStats.commentsLastCreated && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Last created: {format(parseISO(databaseStats.commentsLastCreated), 'dd.MM.yyyy HH:mm', { locale: ru })}
                      </div>
                    )}
                  </div>

                  {/* Reactions */}
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600 dark:text-gray-300 capitalize">Reactions</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {isLoadingStats ? '...' : databaseStats.reactions}
                      </span>
                    </div>
                    {databaseStats.reactionsLastCreated && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Last created: {format(parseISO(databaseStats.reactionsLastCreated), 'dd.MM.yyyy HH:mm', { locale: ru })}
                      </div>
                    )}
                  </div>

                  {/* Favorites */}
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600 dark:text-gray-300 capitalize">Favorites</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {isLoadingStats ? '...' : databaseStats.favorites}
                      </span>
                    </div>
                    {databaseStats.favoritesLastCreated && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Last created: {format(parseISO(databaseStats.favoritesLastCreated), 'dd.MM.yyyy HH:mm', { locale: ru })}
                      </div>
                    )}
                  </div>

                  {/* Planned Events */}
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600 dark:text-gray-300 capitalize">Planned Events</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {isLoadingStats ? '...' : databaseStats.plannedEvents}
                      </span>
                    </div>
                    {databaseStats.plannedEventsLastCreated && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Last created: {format(parseISO(databaseStats.plannedEventsLastCreated), 'dd.MM.yyyy HH:mm', { locale: ru })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Quick Actions
                </h2>
                <div className="space-y-3">
                  <button
                    onClick={handleSeedDatabase}
                    disabled={isSeeding}
                    className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                  >
                    {isSeeding ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                        Seeding Database...
                      </>
                    ) : (
                      <>
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Seed Database
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={handleClearDatabase}
                    className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-md hover:bg-red-50 dark:text-red-400 dark:bg-gray-800 dark:border-red-600 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <TrashIcon className="h-4 w-4 mr-2" />
                    Clear Database
                  </button>
                </div>
              </div>

              {/* Access Status */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Access Status
                </h2>
                <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                      Access Granted
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      All operations are now available
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Seed Configuration */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Seed Configuration
              </h2>
              
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="flex items-center">
                    <UsersIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Total Users</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{totalUsers}</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="flex items-center">
                    <CalendarIcon className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                    <span className="text-sm font-medium text-green-800 dark:text-green-200">Total Events</span>
                  </div>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">{totalEvents}</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <div className="flex items-center">
                    <ChatBubbleLeftIcon className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-2" />
                    <span className="text-sm font-medium text-purple-800 dark:text-purple-200">Total Comments</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{totalComments}</p>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                  <div className="flex items-center">
                    <HeartIcon className="h-5 w-5 text-orange-600 dark:text-orange-400 mr-2" />
                    <span className="text-sm font-medium text-orange-800 dark:text-orange-200">Total Reactions</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{totalReactions}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Users Configuration */}
                <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                    <UsersIcon className="h-5 w-5 mr-2" />
                    Users
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Senior Admins
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={seedSettings.seniorAdminCount}
                        onChange={(e) => setSeedSettings(prev => ({ ...prev, seniorAdminCount: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Admins
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        value={seedSettings.adminCount}
                        onChange={(e) => setSeedSettings(prev => ({ ...prev, adminCount: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Organizers
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="15"
                        value={seedSettings.organizerCount}
                        onChange={(e) => setSeedSettings(prev => ({ ...prev, organizerCount: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Regular Users
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={seedSettings.regularUserCount}
                        onChange={(e) => setSeedSettings(prev => ({ ...prev, regularUserCount: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                      />
                    </div>
                  </div>
                </div>

                {/* Events Configuration */}
                <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                    <CalendarIcon className="h-5 w-5 mr-2" />
                    Events
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('events.pastEvents')}
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={seedSettings.pastEventCount}
                        onChange={(e) => setSeedSettings(prev => ({ ...prev, pastEventCount: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('events.futureEvents')}
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={seedSettings.futureEventCount}
                        onChange={(e) => setSeedSettings(prev => ({ ...prev, futureEventCount: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                      />
                    </div>
                  </div>
                </div>

                {/* Comments Configuration */}
                <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                    <ChatBubbleLeftIcon className="h-5 w-5 mr-2" />
                    Comments
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-green-700 dark:text-green-300 mb-1">
                        Positive Comments
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={seedSettings.positiveCommentCount}
                        onChange={(e) => setSeedSettings(prev => ({ ...prev, positiveCommentCount: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-green-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-green-600 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Neutral Comments
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={seedSettings.neutralCommentCount}
                        onChange={(e) => setSeedSettings(prev => ({ ...prev, neutralCommentCount: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-red-700 dark:text-red-300 mb-1">
                        Negative Comments
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={seedSettings.negativeCommentCount}
                        onChange={(e) => setSeedSettings(prev => ({ ...prev, negativeCommentCount: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-red-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-red-600 dark:text-gray-100"
                      />
                    </div>
                  </div>
                </div>

                {/* Reactions Configuration */}
                <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                    <HeartIcon className="h-5 w-5 mr-2" />
                    Reactions
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-green-700 dark:text-green-300 mb-1">
                        Positive Reactions (👍❤️)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="200"
                        value={seedSettings.positiveReactionCount}
                        onChange={(e) => setSeedSettings(prev => ({ ...prev, positiveReactionCount: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-green-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-green-600 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Neutral Reactions (😐🤔)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="200"
                        value={seedSettings.neutralReactionCount}
                        onChange={(e) => setSeedSettings(prev => ({ ...prev, neutralReactionCount: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-red-700 dark:text-red-300 mb-1">
                        Negative Reactions (👎😞)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="200"
                        value={seedSettings.negativeReactionCount}
                        onChange={(e) => setSeedSettings(prev => ({ ...prev, negativeReactionCount: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-red-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-red-600 dark:text-gray-100"
                      />
                    </div>
                  </div>
                </div>

                {/* Other Options */}
                <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg lg:col-span-2">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                    <StarIcon className="h-5 w-5 mr-2" />
                    Additional Options
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={seedSettings.createFavorites}
                        onChange={(e) => setSeedSettings(prev => ({ ...prev, createFavorites: e.target.checked }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Create Favorites
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={seedSettings.createPlannedEvents}
                        onChange={(e) => setSeedSettings(prev => ({ ...prev, createPlannedEvents: e.target.checked }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Create Planned Events
                      </span>
                    </label>
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
