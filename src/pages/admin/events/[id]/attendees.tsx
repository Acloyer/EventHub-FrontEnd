import { useRouter } from 'next/router'
import AdminLayout from '../../../../components/AdminLayout'
import { useEvent, useEventAttendees, removeAttendeeFromEvent } from '../../../../lib/api'
import { useAuth } from '../../../../lib/AuthContext'
import LoadingSpinner from '../../../../components/LoadingSpinner'
import { format, parseISO } from 'date-fns'
import { toast } from 'react-hot-toast'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { GetServerSideProps } from 'next'
import { useState } from 'react'
import { TrashIcon } from '@heroicons/react/24/outline'

export default function EventAttendeesPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { id } = router.query
  const { isAuthenticated, user } = useAuth()
  const { data: event, error, isValidating } = useEvent(id as string)
  const { data: attendeesData, error: attendeesError, isValidating: attendeesLoading, mutate: mutateAttendees } = useEventAttendees(id as string)
  const [removingAttendee, setRemovingAttendee] = useState<number | null>(null)

  const handleRemoveAttendee = async (attendeeId: number, attendeeName: string) => {
    if (!id) return
    
    setRemovingAttendee(attendeeId)
    try {
      await removeAttendeeFromEvent(Number(id), attendeeId)
      toast.success(t('admin.toast.attendeeRemovedSuccessfully'))
      // Обновляем список участников
      mutateAttendees()
    } catch (error) {
      console.error('Failed to remove attendee:', error)
      toast.error(t('admin.toast.failedToRemoveAttendee'))
    } finally {
      setRemovingAttendee(null)
    }
  }

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

  if (isValidating || attendeesLoading) {
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
            {t('admin.toast.failedToLoadEvent')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {t('events.eventAttendees')}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {event.Title}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {format(parseISO(event.StartDate), 'EEEE, MMMM d, yyyy')} at {format(parseISO(event.StartDate), 'HH:mm')}
              </p>
            </div>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              ← {t('common.back')}
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t('events.attendees')} ({attendeesData?.AttendeesCount || 0})
            </h2>
          </div>

          <div className="p-6">
            {attendeesError ? (
              <div className="text-center py-8">
                <p className="text-red-600 dark:text-red-400 mb-2">
                  {t('admin.toast.failedToLoadAttendees')}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {t('common.tryAgain')}
                </button>
              </div>
            ) : !attendeesData?.Attendees || attendeesData.Attendees.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-300 text-center py-8">
                {t('events.noAttendeesFound')}
              </p>
            ) : (
              <div className="space-y-4">
                {attendeesData.Attendees.map((attendee) => (
                  <div
                    key={attendee.UserId}
                    className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {attendee.UserName}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {attendee.UserEmail}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          Added: {format(parseISO(attendee.AddedAt), 'MMM d, yyyy HH:mm')}
                        </p>
                      </div>
                      <div className="ml-4 flex items-center space-x-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Confirmed
                        </span>
                        <button
                          onClick={() => handleRemoveAttendee(attendee.UserId, attendee.UserName)}
                          disabled={removingAttendee === attendee.UserId}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title={t('events.removeAttendeeTooltip', { name: attendee.UserName })}
                        >
                          <TrashIcon className="h-4 w-4" />
                          {removingAttendee === attendee.UserId ? (
                                                      <span className="ml-1">{t('events.removingAttendee')}</span>
                        ) : (
                          <span className="ml-1">{t('events.removeAttendee')}</span>
                        )}
                        </button>
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
