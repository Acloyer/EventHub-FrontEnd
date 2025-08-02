// src/components/EventCard.tsx
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import {
  HeartIcon,
  CalendarIcon,
  MapPinIcon,
  TagIcon,
  UserIcon,
  EnvelopeIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline'
import {
  HeartIcon as HeartIconSolid,
  CalendarIcon as CalendarIconSolid
} from '@heroicons/react/24/solid'
import { Event } from '../lib/types'
import { toggleFavorite, togglePlanned } from '../lib/api'
import { useAuth } from '../lib/AuthContext'
import { toast } from 'react-hot-toast'
import ReactionPicker from './ReactionPicker'
import { useTranslation } from 'next-i18next'
import RoleBadge from './RoleBadge'

interface EventCardProps {
  event: Event
  onEventUpdate?: () => void
  showOrganizer?: boolean
}

export default function EventCard({
  event,
  onEventUpdate,
  showOrganizer = true
}: EventCardProps) {
  const { t } = useTranslation()
  const { isAuthenticated } = useAuth()
  const [isFavorite, setIsFavorite] = useState(event.IsFavorite)
  const [isPlanned, setIsPlanned] = useState(event.IsPlanned)
  const [loading, setLoading] = useState({ favorite: false, planned: false })

  // Sync local state with event data when it changes
  useEffect(() => {
    setIsFavorite(event.IsFavorite)
    setIsPlanned(event.IsPlanned)
  }, [event.IsFavorite, event.IsPlanned])

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!isAuthenticated) {
      toast.error(t('events.pleaseSignInToAddFavorites'))
      return
    }
    try {
      setLoading(prev => ({ ...prev, favorite: true }))
      await toggleFavorite(event.Id)
      setIsFavorite(prev => !prev)
      toast.success(!isFavorite ? t('events.addedToFavorites') : t('events.removedFromFavorites'))
      if (onEventUpdate) onEventUpdate()
    } catch (error) {
      console.error('Error toggling favorite status:', error)
      toast.error(t('events.failedToUpdateFavorites'))
    } finally {
      setLoading(prev => ({ ...prev, favorite: false }))
    }
  }

  const handleTogglePlanned = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!isAuthenticated) {
      toast.error(t('events.pleaseSignInToPlanEvents'))
      return
    }
    try {
      setLoading(prev => ({ ...prev, planned: true }))
      await togglePlanned(event.Id)
      setIsPlanned(prev => !prev)
      toast.success(!isPlanned ? t('events.addedToPlannedEvents') : t('events.removedFromPlanned'))
      if (onEventUpdate) onEventUpdate()
    } catch (error: any) {
      console.error('Error toggling planned status:', error)
      // Don't show additional error message if it's already handled in togglePlanned
      if (error.response?.status !== 403) {
        toast.error(t('events.failedToUpdatePlannedList'))
      }
    } finally {
      setLoading(prev => ({ ...prev, planned: false }))
    }
  }

  const formatDateRange = () => {
    if (!event.StartDate) return t('events.dateNotSpecified')
    const start = new Date(event.StartDate)
    let formatted = format(start, 'MMM d, yyyy')
    if (event.EndDate) {
      const end = new Date(event.EndDate)
      if (format(start, 'yyyy-MM-dd') === format(end, 'yyyy-MM-dd')) {
        formatted = `${formatted} (${format(start, 'h:mm a')} - ${format(end, 'h:mm a')})`
      } else {
        formatted = `${formatted} - ${format(end, 'MMM d, yyyy')}`
      }
    }
    return formatted
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/events/${event.Id}`} className="block">
        <div className="p-5">
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {event.Title}
            </h3>
            <div className="flex space-x-2">
              {isAuthenticated && (
                <>
                  <button
                    onClick={handleToggleFavorite}
                    disabled={loading.favorite}
                    className="text-gray-400 hover:text-red-500 transition-colors focus:outline-none disabled:opacity-50"
                    aria-label={isFavorite ? t('events.removeFromFavorites') : t('events.addToFavorites')}
                  >
                    {isFavorite ? (
                      <HeartIconSolid className="h-6 w-6 text-red-500" />
                    ) : (
                      <HeartIcon className="h-6 w-6" />
                    )}
                  </button>
                  <button
                    onClick={handleTogglePlanned}
                    disabled={loading.planned}
                    className="text-gray-400 hover:text-blue-500 transition-colors focus:outline-none disabled:opacity-50"
                    aria-label={isPlanned ? t('events.removeFromPlanned') : t('events.planToAttend')}
                  >
                    {isPlanned ? (
                      <CalendarIconSolid className="h-6 w-6 text-blue-500" />
                    ) : (
                      <CalendarIcon className="h-6 w-6" />
                    )}
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="space-y-2 mt-3">
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <CalendarIcon className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400 flex-shrink-0" />
              <span>{formatDateRange()}</span>
            </div>

            {event.Location && (
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <MapPinIcon className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                <span>{event.Location}</span>
              </div>
            )}

            {event.Category && (
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <TagIcon className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                <span>{event.Category}</span>
              </div>
            )}

            {showOrganizer && event.OrganizerName && (
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <UserIcon className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                <span>{event.OrganizerName}</span>
                {event.CreatorRoles && event.CreatorRoles.length > 0 && (
                  <span className="ml-2">
                    <RoleBadge role={event.CreatorRoles[0]} size="sm" />
                  </span>
                )}
              </div>
            )}

            {showOrganizer && event.OrganizerEmail && (
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <EnvelopeIcon className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                <span className="truncate">{event.OrganizerEmail}</span>
              </div>
            )}

            {event.CommentsCount !== undefined && (
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <ChatBubbleLeftIcon className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                <span>{event.CommentsCount} {t('events.comments')}</span>
              </div>
            )}
          </div>

          {event.Description && (
            <div className="mt-3 text-gray-700 dark:text-gray-300">
              <p className="line-clamp-2">{event.Description}</p>
            </div>
          )}

          {/* Reactions */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <ReactionPicker eventId={event.Id} />
          </div>
        </div>
      </Link>
    </div>
  )
}
