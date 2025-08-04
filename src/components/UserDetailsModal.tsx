import React, { useState } from 'react'
import { XMarkIcon, EyeIcon, TrashIcon, CalendarIcon, UserIcon, EnvelopeIcon } from '@heroicons/react/24/outline'
import { User } from '../lib/types'
import { useTranslation } from 'next-i18next'
import { useUserPlannedEvents, removeUserFromPlannedEvent } from '../lib/api'
import { toast } from 'react-hot-toast'
import { format, parseISO } from 'date-fns'
import RoleBadge from './RoleBadge'

interface UserDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  user: User
}

export default function UserDetailsModal({ isOpen, onClose, user }: UserDetailsModalProps) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'details' | 'planned'>('details')
  const [removingEvent, setRemovingEvent] = useState<number | null>(null)
  
  const { data: plannedEvents, mutate: mutatePlannedEvents } = useUserPlannedEvents(user.Id)

  const handleRemoveFromEvent = async (eventId: number, eventTitle: string) => {
    setRemovingEvent(eventId)
    try {
      await removeUserFromPlannedEvent(user.Id, eventId)
      toast.success(t('admin.toast.attendeeRemovedSuccessfully'))
      mutatePlannedEvents()
    } catch (error) {
      console.error('Failed to remove from event:', error)
      toast.error(t('admin.toast.failedToRemoveAttendee'))
    } finally {
      setRemovingEvent(null)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-medium text-lg">
                {user.Name?.charAt(0)?.toUpperCase() ?? 'U'}
              </span>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {user.Name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                ID: {user.Id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'details'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {t('admin.userDetails')}
            </button>
            <button
              onClick={() => setActiveTab('planned')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'planned'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {t('events.plannedEvents')} ({plannedEvents?.Items?.length || 0})
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                  {t('admin.basicInformation')}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t('auth.name')}
                    </label>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                      {user.Name || t('common.unknown')}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t('auth.email')}
                    </label>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                      {user.Email}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t('admin.status')}
                    </label>
                    <div className="mt-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.IsBanned 
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : user.IsMuted
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {user.IsBanned ? t('admin.banned') : user.IsMuted ? t('admin.muted') : t('admin.active')}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t('admin.roles')}
                    </label>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {user.Roles?.map((role) => (
                        <RoleBadge key={role} role={role} />
                      )) || <span className="text-gray-500 dark:text-gray-400">{t('admin.noRoles')}</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                  {t('admin.additionalInformation')}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t('admin.telegramStatus')}
                    </label>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                      {user.IsTelegramVerified ? t('admin.verified') : t('admin.notVerified')}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t('admin.preferredLanguage')}
                    </label>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                      {user.PreferredLanguage || 'en'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'planned' && (
            <div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                {t('events.plannedEvents')}
              </h4>
              
              {!plannedEvents?.Items || plannedEvents.Items.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  {t('events.noPlannedEventsFound')}
                </p>
              ) : (
                <div className="space-y-4">
                  {plannedEvents.Items.map((plannedEvent) => (
                    <div
                      key={plannedEvent.Id}
                      className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {plannedEvent.Event.Title}
                          </h5>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {format(parseISO(plannedEvent.Event.StartDate), 'EEEE, MMMM d, yyyy')} at {format(parseISO(plannedEvent.Event.StartDate), 'HH:mm')}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {plannedEvent.Event.Location || t('events.locationTBD')}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => window.open(`/events/${plannedEvent.Event.Id}`, '_blank')}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                            title={t('events.viewEvent')}
                          >
                            <EyeIcon className="h-4 w-4 mr-1" />
                            {t('events.view')}
                          </button>
                          <button
                            onClick={() => plannedEvent.Event.Id && handleRemoveFromEvent(plannedEvent.Event.Id, plannedEvent.Event.Title)}
                            disabled={removingEvent === plannedEvent.Event.Id || !plannedEvent.Event.Id}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title={t('events.removeFromPlanned')}
                          >
                            <TrashIcon className="h-4 w-4 mr-1" />
                            {removingEvent === plannedEvent.Event.Id ? t('events.removing') : t('events.remove')}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  )
} 