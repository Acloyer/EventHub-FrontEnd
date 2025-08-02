import { useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../lib/AuthContext'
import { useUserEvents, useFavorites, usePlannedEvents } from '../lib/api'
import EventCard from '../components/EventCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { GetServerSideProps } from 'next'

export default function MyEventsPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  
  const { data: events, error, mutate } = useUserEvents()
  const { data: favorites } = useFavorites()
  const { data: plannedEvents } = usePlannedEvents()

  if (!isAuthenticated) {
    router.push('/login')
    return null
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {t('events.failedToLoadEvents')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('common.error')}
          </p>
        </div>
      </div>
    )
  }

  if (!events) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  // Calculate statistics
  const totalFavorited = favorites?.length || 0
  const totalPlanned = plannedEvents?.length || 0
  const totalReactions = events?.Items?.reduce((sum: number, event: any) => {
    return sum + (event.Reactions?.length || 0)
  }, 0) || 0
  const totalComments = events?.Items?.reduce((sum: number, event: any) => {
    return sum + (event.CommentsCount || 0)
  }, 0) || 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          {t('events.myEvents')}
        </h1>
        
        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {t('events.favorites')}
            </h3>
            <p className="text-3xl font-bold text-blue-600">
              {totalFavorited}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total favorited events
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {t('events.going')}
            </h3>
            <p className="text-3xl font-bold text-green-600">
              {totalPlanned}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Planned events
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {t('events.reactions')}
            </h3>
            <p className="text-3xl font-bold text-yellow-600">
              {totalReactions}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total reactions received
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {t('events.comments')}
            </h3>
            <p className="text-3xl font-bold text-purple-600">
              {totalComments}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total comments received
            </p>
          </div>
        </div>
      </div>

      {events.Items?.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {t('events.noEventsFound')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t('events.createFirstEvent')}
          </p>
          <button
            onClick={() => router.push('/organizer/events/create')}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            {t('events.createEvent')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.Items?.map(event => (
            <EventCard 
              key={event.Id} 
              event={event}
              onEventUpdate={mutate}
            />
          ))}
        </div>
      )}
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
