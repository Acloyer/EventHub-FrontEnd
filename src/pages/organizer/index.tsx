import { useState } from 'react'
import { useRouter } from 'next/router'
import { useUserEvents, deleteEvent } from '../../lib/api'
import TelegramVerificationModal from '../../components/TelegramVerificationModal'
import { useAuth } from '../../lib/AuthContext'
import LoadingSpinner from '../../components/LoadingSpinner'
import { format, parseISO } from 'date-fns'
import { toast } from 'react-hot-toast'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { GetServerSideProps } from 'next'

export default function OrganizerPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { user } = useAuth()
  const [page, setPage] = useState(1)
  const pageSize = 10
  const { data: events, error, mutate } = useUserEvents({
    PageNumber: page,
    PageSize: pageSize
  })
  const [showTelegramModal, setShowTelegramModal] = useState(false)

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {t('common.error')}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {t('events.failedToLoadEvents')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          {t('navbar.organizerDashboard')}
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          {t('organizer.dashboardDescription')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {t('organizer.totalEvents')}
          </h3>
          <p className="text-3xl font-bold text-blue-600">
            {events?.Items?.length || 0}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {t('organizer.activeEvents')}
          </h3>
          <p className="text-3xl font-bold text-green-600">
            {events?.Items?.filter((e: any) => e.StartDate && new Date(e.StartDate) > new Date()).length || 0}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {t('organizer.totalAttendees')}
          </h3>
          <p className="text-3xl font-bold text-purple-600">
            {events?.Items?.reduce((sum: number, e: any) => sum + (e.Attendees?.length || 0), 0) || 0}
          </p>
        </div>
      </div>

      {/* Удалён блок Telegram Integration */}

      <div className="mt-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t('organizer.myEvents')}
          </h2>
          <button
            onClick={() => router.push('/organizer/events/create')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            {t('events.createEvent')}
          </button>
        </div>

        {!events ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : events?.Items?.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {t('organizer.noEvents')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t('organizer.createFirstEvent')}
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
            {events?.Items?.map((event: any) => (
              <div key={event.Id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {event.Title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {event.Description}
                </p>
                <div className="text-sm text-gray-500 mb-4">
                  <p>{event.StartDate ? format(parseISO(event.StartDate), 'PPP') : 'Date not available'}</p>
                  <p>{event.Location}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => router.push(`/organizer/events/edit/${event.Id}`)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                  >
                    {t('common.edit')}
                  </button>
                  <button
                    onClick={() => router.push(`/organizer/events/${event.Id}/attendees`)}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                  >
                    {t('events.attendees')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {events?.TotalPages && events.TotalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 sm:px-6 mt-6 rounded-md">
            <div className="flex justify-between flex-1 sm:hidden">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(events?.TotalPages || 1, p + 1))}
                disabled={page === events?.TotalPages}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Showing <span className="font-medium">{((page - 1) * pageSize) + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(page * pageSize, events?.TotalCount || 0)}
                  </span> of{' '}
                  <span className="font-medium">{events?.TotalCount || 0}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-l-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border-t border-b border-gray-300 dark:border-gray-600">
                    Page {page} of {events?.TotalPages || 1}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(events?.TotalPages || 1, p + 1))}
                    disabled={page === events?.TotalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-r-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
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
