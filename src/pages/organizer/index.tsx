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
  const { data: events, error, mutate } = useUserEvents()
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Telegram Status
          </h3>
          <div className="flex items-center justify-between">
            <p className={`text-sm font-medium ${user?.IsTelegramVerified ? 'text-green-600' : 'text-red-600'}`}>
              {user?.IsTelegramVerified ? 'Verified' : 'Not Verified'}
            </p>
            <button
              onClick={() => setShowTelegramModal(true)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              {user?.IsTelegramVerified ? 'Manage' : 'Setup'}
            </button>
          </div>
        </div>
      </div>

      {/* Telegram Management Section */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Telegram Integration
          </h2>
          <button
            onClick={() => setShowTelegramModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            {user?.IsTelegramVerified ? 'Manage Telegram' : 'Setup Telegram'}
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Verification Status</h3>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${user?.IsTelegramVerified ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {user?.IsTelegramVerified ? 'Verified' : 'Not Verified'}
              </span>
            </div>
            {user?.IsTelegramVerified && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Telegram ID: {user.TelegramId || 'Unknown'}
              </p>
            )}
          </div>
          
          <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Notification Settings</h3>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${user?.NotifyBeforeEvent ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Event Reminders: {user?.NotifyBeforeEvent ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
        </div>
        
        {!user?.IsTelegramVerified && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
            <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Why connect Telegram?</h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Receive notifications about your events</li>
              <li>• Get reminders before events start</li>
              <li>• Stay updated on attendee activity</li>
              <li>• Enhanced event management capabilities</li>
            </ul>
          </div>
        )}
      </div>

      <div className="mt-8">
        <div className="flex justify-between items-center mb-6">
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
      </div>

      <TelegramVerificationModal
        isOpen={showTelegramModal}
        onClose={() => setShowTelegramModal(false)}
        onVerified={() => {
          setShowTelegramModal(false);
          // Refresh user data or show success message
          toast.success('Telegram verification successful!');
        }}
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
