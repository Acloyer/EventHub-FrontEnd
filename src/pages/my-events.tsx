import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../lib/AuthContext'
import { useUserEvents, useFavorites, usePlannedEvents, useMyBlacklist } from '../lib/api'
import LoadingSpinner from '../components/LoadingSpinner'
import { BlacklistModal } from '../components/BlacklistModal'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { GetServerSideProps } from 'next'
import { format, parseISO, isPast, isFuture, isToday } from 'date-fns'
import {
  CalendarIcon,
  MapPinIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  EyeIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UsersIcon,
  NoSymbolIcon
} from '@heroicons/react/24/outline'
import {
  HeartIcon as HeartIconSolid,
  CalendarIcon as CalendarIconSolid
} from '@heroicons/react/24/solid'

export default function MyEventsPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [page, setPage] = useState(1)
  const pageSize = 10
  
  const { data: events, error, mutate } = useUserEvents({
    PageNumber: page,
    PageSize: pageSize
  })
  const { data: favorites, mutate: mutateFavorites } = useFavorites()
  const { data: plannedEvents, mutate: mutatePlanned } = usePlannedEvents()
  const { data: blacklist, mutate: mutateBlacklist } = useMyBlacklist()
  const [showBlacklistModal, setShowBlacklistModal] = useState(false)

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
    return sum + (event.ReactionsCount || 0)
  }, 0) || 0
  const totalComments = events?.Items?.reduce((sum: number, event: any) => {
    return sum + (event.CommentsCount || 0)
  }, 0) || 0
  const totalBlacklisted = blacklist?.length || 0

  // Function to get event status
  const getEventStatus = (startDate: string, endDate?: string) => {
    const start = parseISO(startDate)
    const end = endDate ? parseISO(endDate) : null
    
    if (isPast(start)) {
      return { status: 'Past', color: 'text-gray-500', bgColor: 'bg-gray-100', icon: ClockIcon }
    } else if (isToday(start)) {
      return { status: 'Today', color: 'text-green-600', bgColor: 'bg-green-100', icon: CheckCircleIcon }
    } else if (isFuture(start)) {
      return { status: 'Upcoming', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: CalendarIcon }
    }
    
    return { status: 'Unknown', color: 'text-gray-500', bgColor: 'bg-gray-100', icon: ExclamationTriangleIcon }
  }

  // Function to format date
  const formatEventDate = (startDate: string, endDate?: string) => {
    const start = parseISO(startDate)
    let formatted = format(start, 'MMM d, yyyy')
    
    if (endDate) {
      const end = parseISO(endDate)
      if (format(start, 'yyyy-MM-dd') === format(end, 'yyyy-MM-dd')) {
        formatted = `${formatted} (${format(start, 'h:mm a')} - ${format(end, 'h:mm a')})`
      } else {
        formatted = `${formatted} - ${format(end, 'MMM d, yyyy')}`
      }
    } else {
      formatted = `${formatted} at ${format(start, 'h:mm a')}`
    }
    
    return formatted
  }

  // Function to check if event is in favorites
  const isEventInFavorites = (eventId: number) => {
    return favorites?.some(fav => fav.Id === eventId) || false
  }

  // Function to check if event is in planned
  const isEventInPlanned = (eventId: number) => {
    return plannedEvents?.some(planned => planned.Id === eventId) || false
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {t('events.myEvents')}
          </h1>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowBlacklistModal(true)}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <NoSymbolIcon className="h-4 w-4 mr-2" />
              Blacklist ({totalBlacklisted})
            </button>
            <button
              onClick={() => router.push('/organizer/events/create')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Event
            </button>
          </div>
        </div>
        
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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Engagement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {events.Items?.map((event) => {
                  const statusInfo = getEventStatus(event.StartDate, event.EndDate)
                  const StatusIcon = statusInfo.icon
                  const isFavorited = isEventInFavorites(event.Id)
                  const isPlanned = isEventInPlanned(event.Id)
                  
                  return (
                    <tr key={event.Id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                              <CalendarIcon className="h-6 w-6 text-white" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {event.Title}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {event.Description?.substring(0, 50)}...
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                              {isFavorited && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                  <HeartIconSolid className="h-3 w-3 mr-1" />
                                  Favorited
                                </span>
                              )}
                              {isPlanned && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                  <CalendarIconSolid className="h-3 w-3 mr-1" />
                                  Planned
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusInfo.status}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {formatEventDate(event.StartDate, event.EndDate)}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900 dark:text-gray-100">
                          <MapPinIcon className="h-4 w-4 mr-1 text-gray-400" />
                          {event.Location || 'Location TBD'}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center text-sm text-gray-900 dark:text-gray-100">
                            <HeartIcon className="h-4 w-4 mr-1 text-red-500" />
                            {event.ReactionsCount || 0}
                          </div>
                          <div className="flex items-center text-sm text-gray-900 dark:text-gray-100">
                            <ChatBubbleLeftIcon className="h-4 w-4 mr-1 text-blue-500" />
                            {event.CommentsCount || 0}
                          </div>
                          <div className="flex items-center text-sm text-gray-900 dark:text-gray-100">
                            <UsersIcon className="h-4 w-4 mr-1 text-green-500" />
                            {event.MaxParticipants || 0}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => router.push(`/events/${event.Id}`)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title="View Event"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => router.push(`/organizer/events/edit/${event.Id}`)}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                            title="Edit Event"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => router.push(`/organizer/events/${event.Id}/attendees`)}
                            className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                            title="View Attendees"
                          >
                            <UsersIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {events?.TotalPages > 1 && (
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

      {/* Blacklist Modal */}
      <BlacklistModal
        isOpen={showBlacklistModal}
        onClose={() => setShowBlacklistModal(false)}
        blacklist={blacklist || []}
        onBlacklistUpdate={() => mutateBlacklist()}
      />
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
