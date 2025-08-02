import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useEvent, getEventAttendees, removeAttendeeFromEvent } from '../../../../lib/api'
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
  AddedAt: string
}

export default function OrganizerEventAttendeesPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { id } = router.query
  const { isAuthenticated, user } = useAuth()
  const { data: event, error, isValidating } = useEvent(id as string)
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [attendeesLoading, setAttendeesLoading] = useState(false)
  const [removingAttendee, setRemovingAttendee] = useState<number | null>(null)

  useEffect(() => {
    const loadAttendees = async () => {
      if (!id) return
      
      setAttendeesLoading(true)
      try {
        const response = await getEventAttendees(Number(id))
        setAttendees(response.Attendees)
      } catch (error) {
        console.error('Failed to load attendees:', error)
        toast.error('Failed to load attendees')
      } finally {
        setAttendeesLoading(false)
      }
    }

    loadAttendees()
  }, [id])

  const handleRemoveAttendee = async (attendeeId: number) => {
    if (!id || !confirm('Are you sure you want to remove this attendee from the event?')) {
      return
    }

    setRemovingAttendee(attendeeId)
    try {
      await removeAttendeeFromEvent(Number(id), attendeeId)
      setAttendees(prev => prev.filter(a => a.UserId !== attendeeId))
      toast.success('Attendee removed successfully')
    } catch (error) {
      console.error('Failed to remove attendee:', error)
      toast.error('Failed to remove attendee')
    } finally {
      setRemovingAttendee(null)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {t('common.accessDenied')}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Please log in to access this page
          </p>
        </div>
      </div>
    )
  }

  if (isValidating) {
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

  // Check if user is the organizer of this event
  if (event.CreatorId !== user?.Id) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {t('common.accessDenied')}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            You can only view attendees for events you organize
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Event Attendees
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {event.Title}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {format(parseISO(event.StartDate), 'EEEE, MMMM d, yyyy')} at {event.Location}
            </p>
          </div>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Back to Event
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Attendees ({attendees.length})
            </h2>
            {attendeesLoading && <LoadingSpinner size="sm" />}
          </div>
        </div>

        <div className="p-6">
          {attendeesLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : attendees.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                No attendees yet
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                People who register for this event will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {attendees.map((attendee) => (
                <div
                  key={attendee.UserId}
                  className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {attendee.UserName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {attendee.UserName}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {attendee.UserEmail}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          Registered: {format(parseISO(attendee.AddedAt), 'MMM d, yyyy \'at\' h:mm a')}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveAttendee(attendee.UserId)}
                      disabled={removingAttendee === attendee.UserId}
                      className="px-3 py-1 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {removingAttendee === attendee.UserId ? 'Removing...' : 'Remove'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
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
