import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../../lib/AuthContext'
import { usePlannedEvents } from '../../lib/api'
import EventCard from '../../components/EventCard'
import LoadingSpinner from '../../components/LoadingSpinner'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { GetServerSideProps } from 'next'

export default function GoingEvents() {
  const { t } = useTranslation()
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const { data: plannedEvents, error, mutate } = usePlannedEvents()

  if (!isAuthenticated) {
    router.push('/login')
    return null
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {t('events.failedToLoadEvents')}
          </h1>
          <p className="text-gray-600">
            {t('common.error')}
          </p>
        </div>
      </div>
    )
  }

  if (!plannedEvents) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          {t('events.going')}
        </h1>
      </div>

      {plannedEvents?.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {t('events.noPlannedEventsFound')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t('events.noPlannedEventsFound')}
          </p>
          <button
            onClick={() => router.push('/events')}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            {t('events.browseEvents')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plannedEvents?.map((event: any) => (
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
