import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from '../../../../components/AdminLayout'
import { useEvent } from '../../../../lib/api'
import { useAuth } from '../../../../lib/AuthContext'
import LoadingSpinner from '../../../../components/LoadingSpinner'
import { format, parseISO } from 'date-fns'
import { toast } from 'react-hot-toast'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { GetServerSideProps } from 'next'

interface Attendee {
  UserId: number
  UserName: string
  UserEmail: string
  EventId: number
  Event: {
    Id: number
    Title: string
    StartDate: string
    EndDate: string
    Location: string
  }
  AddedAt: string
}

export default function EventAttendeesPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { id } = router.query
  const { isAuthenticated, user } = useAuth()
  const { data: event, error, loading } = useEvent(id as string)
  const [attendees, setAttendees] = useState<Attendee[]>([])

  useEffect(() => {
    // Здесь можно добавить загрузку участников события
    // Пока что оставляем пустой массив
  }, [id])

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {t('common.error')}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Failed to load event
          </p>
        </div>
      </div>
    )
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Event Attendees
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {event.Title}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Attendees ({attendees.length})
            </h2>
          </div>

          <div className="p-6">
            {attendees.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-300 text-center py-8">
                No attendees found for this event.
              </p>
            ) : (
              <div className="space-y-4">
                {attendees.map((attendee) => (
                  <div
                    key={attendee.UserId}
                    className="border border-gray-200 dark:border-gray-600 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {attendee.UserName}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {attendee.UserEmail}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          Added: {format(parseISO(attendee.AddedAt), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
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
