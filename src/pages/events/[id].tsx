import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { format } from 'date-fns'
import { Event } from '../../lib/types'
import { 
  useEvent, 
  toggleFavorite,
  togglePlanned
} from '../../lib/api'
import { useAuth } from '../../lib/AuthContext'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorBoundary from '../../components/ErrorBoundary'
import EventComments from '../../components/EventComments'
import ReactionPicker from '../../components/ReactionPicker'
import { 
  CalendarIcon, 
  MapPinIcon, 
  TagIcon,
  UserIcon,
  EnvelopeIcon,
  ChatBubbleLeftIcon,
  HeartIcon as HeartIconOutline,
  CalendarIcon as CalendarIconOutline
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid, CalendarIcon as CalendarIconSolid } from '@heroicons/react/24/solid'
import toast from 'react-hot-toast'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { GetServerSideProps } from 'next'

export default function EventPage() {
  const router = useRouter()
  const { id } = router.query
  const { t } = useTranslation()
  const { isAuthenticated } = useAuth()
  const [isFavorite, setIsFavorite] = useState(false)
  const [isPlanned, setIsPlanned] = useState(false)
  const [showReactionPicker, setShowReactionPicker] = useState(false)

  const { data: event, error, mutate } = useEvent(id as string)

  useEffect(() => {
    if (event) {
      setIsFavorite(event.IsFavorite || false)
      setIsPlanned(event.IsPlanned || false)
    }
  }, [event])

  const handleToggleFavorite = useCallback(async () => {
    if (!isAuthenticated) {
      toast.error(t('events.pleaseSignInToAddFavorites'))
      return
    }

    try {
      await toggleFavorite(event!.Id)
      setIsFavorite(!isFavorite)
      mutate()
      toast.success(isFavorite ? t('events.removedFromFavorites') : t('events.addedToFavorites'))
    } catch (error) {
      toast.error(t('events.failedToUpdateFavorites'))
    }
  }, [event, isFavorite, isAuthenticated, t, mutate])

  const handleTogglePlanned = useCallback(async () => {
    if (!isAuthenticated) {
      toast.error(t('events.pleaseSignInToPlanEvents'))
      return
    }

    try {
      await togglePlanned(event!.Id)
      setIsPlanned(!isPlanned)
      mutate()
      toast.success(isPlanned ? t('events.removedFromPlanned') : t('events.addedToPlannedEvents'))
    } catch (error) {
      toast.error(t('events.failedToUpdatePlannedList'))
    }
  }, [event, isPlanned, isAuthenticated, t, mutate])

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {t('events.failedToLoadEvents')}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {t('common.error')}
          </p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Head>
          <title>{event.Title} - EventHub</title>
          <meta name="description" content={event.Description} />
        </Head>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Event Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {event.Title}
              </h1>
              <div className="flex space-x-2">
                <button
                  onClick={handleToggleFavorite}
                  className={`p-2 rounded-full transition-colors ${
                    isFavorite 
                      ? 'text-red-500 hover:text-red-600' 
                      : 'text-gray-400 hover:text-red-500'
                  }`}
                >
                  {isFavorite ? (
                    <HeartIconSolid className="h-6 w-6" />
                  ) : (
                    <HeartIconOutline className="h-6 w-6" />
                  )}
                </button>
                <button
                  onClick={handleTogglePlanned}
                  className={`p-2 rounded-full transition-colors ${
                    isPlanned 
                      ? 'text-blue-500 hover:text-blue-600' 
                      : 'text-gray-400 hover:text-blue-500'
                  }`}
                >
                  {isPlanned ? (
                    <CalendarIconSolid className="h-6 w-6" />
                  ) : (
                    <CalendarIconOutline className="h-6 w-6" />
                  )}
                </button>
                <button
                  onClick={() => setShowReactionPicker(!showReactionPicker)}
                  className="p-2 rounded-full transition-colors text-gray-400 hover:text-blue-500 text-2xl"
                >
                  😊
                </button>
              </div>
            </div>

            {/* Event Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <CalendarIcon className="h-5 w-5 mr-2" />
                  <span>{format(new Date(event.StartDate), 'PPP')}</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <MapPinIcon className="h-5 w-5 mr-2" />
                  <span>{event.Location}</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <TagIcon className="h-5 w-5 mr-2" />
                  <span>{event.Category}</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <UserIcon className="h-5 w-5 mr-2" />
                  <span>{event.OrganizerName}</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <EnvelopeIcon className="h-5 w-5 mr-2" />
                  <span>{event.OrganizerEmail}</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <ChatBubbleLeftIcon className="h-5 w-5 mr-2" />
                  <span>{event.CommentsCount || 0} {t('events.comments')}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {t('events.description')}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                {event.Description}
              </p>
            </div>

            {/* Reactions Section */}
            {showReactionPicker && (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <ReactionPicker
                  eventId={event.Id}
                  showAllReactions={true}
                />
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <EventComments eventId={event.Id} />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common'])),
    },
  }
}
