import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useEvent, updateEvent } from '../../../../lib/api'
import { useAuth } from '../../../../lib/AuthContext'
import LoadingSpinner from '../../../../components/LoadingSpinner'
import { toast } from 'react-hot-toast'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { GetServerSideProps } from 'next'
import type { EventCreateDto } from '../../../../lib/types'

export default function OrganizerEditEventPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { id } = router.query
  const { isAuthenticated, user } = useAuth()
  const { data: event, error, loading } = useEvent(id as string)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<EventCreateDto>({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    category: '',
    location: '',
    maxParticipants: 0,
  })

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.Title || '',
        description: event.Description || '',
        startDate: event.StartDate ? new Date(event.StartDate).toISOString().slice(0, 16) : '',
        endDate: event.EndDate ? new Date(event.EndDate).toISOString().slice(0, 16) : '',
        category: event.Category || '',
        location: event.Location || '',
        maxParticipants: event.MaxParticipants || 0,
      })
    }
  }, [event])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return

    setIsSubmitting(true)
    try {
      await updateEvent(Number(id), formData)
      toast.success('Event updated successfully')
      router.push('/organizer')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update event')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }))
  }

  if (!isAuthenticated || !user?.Roles?.some(role => ['Organizer', 'Admin', 'SeniorAdmin', 'Owner'].includes(role))) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {t('common.accessDenied')}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {t('common.organizerAccessRequired')}
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <div className="px-4 sm:px-0">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
                  {t('events.editEvent')}
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  {t('events.editEventDescription')}
                </p>
              </div>
            </div>

            <div className="mt-5 md:mt-0 md:col-span-2">
              <form onSubmit={handleSubmit}>
                <div className="shadow-soft sm:rounded-md sm:overflow-hidden">
                  <div className="px-4 py-5 bg-white dark:bg-gray-800 space-y-6 sm:p-6">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('events.eventTitle')}
                      </label>
                      <input
                        type="text"
                        name="title"
                        id="title"
                        required
                        value={formData.title}
                        onChange={handleChange}
                        className="mt-1 input"
                        placeholder={t('events.eventTitlePlaceholder')}
                      />
                    </div>

                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('events.description')}
                      </label>
                      <textarea
                        name="description"
                        id="description"
                        rows={4}
                        required
                        value={formData.description}
                        onChange={handleChange}
                        className="mt-1 textarea"
                        placeholder={t('events.descriptionPlaceholder')}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          {t('events.startDate')}
                        </label>
                        <input
                          type="datetime-local"
                          name="startDate"
                          id="startDate"
                          required
                          value={formData.startDate}
                          onChange={handleChange}
                          className="mt-1 input"
                        />
                      </div>

                      <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          {t('events.endDate')}
                        </label>
                        <input
                          type="datetime-local"
                          name="endDate"
                          id="endDate"
                          required
                          value={formData.endDate}
                          onChange={handleChange}
                          className="mt-1 input"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('events.category')}
                      </label>
                      <select
                        name="category"
                        id="category"
                        required
                        value={formData.category}
                        onChange={handleChange}
                        className="mt-1 select"
                      >
                        <option value="">{t('events.selectCategory')}</option>
                        <option value="Conference">{t('events.categories.conference')}</option>
                        <option value="Workshop">{t('events.categories.workshop')}</option>
                        <option value="Meetup">{t('events.categories.meetup')}</option>
                        <option value="Social">{t('events.categories.social')}</option>
                        <option value="Other">{t('events.categories.other')}</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('events.location')}
                      </label>
                      <input
                        type="text"
                        name="location"
                        id="location"
                        required
                        value={formData.location}
                        onChange={handleChange}
                        className="mt-1 input"
                        placeholder={t('events.locationPlaceholder')}
                      />
                    </div>

                    <div>
                      <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('events.maxParticipants')}
                      </label>
                      <input
                        type="number"
                        name="maxParticipants"
                        id="maxParticipants"
                        required
                        min="2"
                        max="10000"
                        value={formData.maxParticipants}
                        onChange={handleChange}
                        className="mt-1 input"
                        placeholder={t('events.maxParticipantsPlaceholder')}
                      />
                    </div>
                  </div>

                  <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 text-right sm:px-6">
                    <button
                      type="button"
                      onClick={() => router.push('/organizer')}
                      className="btn-secondary mr-3"
                    >
                      {t('common.cancel')}
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-primary"
                    >
                      {isSubmitting ? (
                        <svg className="animate-spin h-5 w-5 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : t('events.updateEvent')}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
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
