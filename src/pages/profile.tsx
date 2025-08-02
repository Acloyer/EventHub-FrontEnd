'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '../lib/AuthContext'
import { useUser, updateUserProfile, getTelegramLink, confirmTelegramCode, startTelegramVerification, useFavorites, usePlannedEvents } from '../lib/api'
import { withAuth } from '../lib/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'
import { Event, ProfileUpdateDto } from '../lib/types'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import Head from 'next/head'
import Link from 'next/link'
import EventCard from '../components/EventCard'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { GetServerSideProps } from 'next'

const profileSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().email('Please enter a valid email'),
  notifyBeforeEvent: z.boolean().optional(),
})

function ProfilePage() {
  const { user, refreshUser } = useAuth()
  const { t } = useTranslation()
  const { data: userProfile, error, mutate } = useUser()
  const { data: favoriteEventsData, error: favoriteError, mutate: mutateFavorites } = useFavorites()
  const { data: plannedEventsData, error: plannedError, mutate: mutatePlanned } = usePlannedEvents()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [telegramCode, setTelegramCode] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [showTelegramVerification, setShowTelegramVerification] = useState(false)
  const [telegramLink, setTelegramLink] = useState('')
  
  // Update form default values when user profile data is loaded
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileUpdateDto>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      email: '',
      notifyBeforeEvent: false,
    }
  })

  // Update form values when profile data changes
  useEffect(() => {
    if (userProfile) {
      reset({
        name: userProfile.Name || '',
        email: userProfile.Email || '',
        notifyBeforeEvent: userProfile.NotifyBeforeEvent || false,
      })
    }
  }, [userProfile, reset])

  const onSubmit = async (data: ProfileUpdateDto) => {
    try {
      setIsSubmitting(true)
      await updateUserProfile(data)
      await mutate()
      refreshUser()
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRequestTelegramLink = async () => {
    try {
      console.log('Requesting Telegram link for user:', user?.Id)
      const linkData = await getTelegramLink(user?.Id || 0)
      console.log('Telegram link received:', linkData)
      setTelegramLink(linkData.LinkUrl)
      setShowTelegramVerification(true)
    } catch (error) {
      console.error('Error getting Telegram link:', error)
      toast.error('Failed to get Telegram link. Please try again.')
    }
  }

  const handleStartVerification = async () => {
    try {
      await startTelegramVerification(user?.Id || 0)
      toast.success('Verification code sent to your Telegram account')
    } catch (error) {
      console.error('Error starting verification:', error)
      toast.error('Failed to send verification code')
    }
  }

  const handleVerifyCode = async () => {
    if (!telegramCode) {
      toast.error('Please enter verification code')
      return
    }
    
    try {
      setIsVerifying(true)
      await confirmTelegramCode({ code: parseInt(telegramCode, 10) })
      await refreshUser()
      await mutate()
      setShowTelegramVerification(false)
      setTelegramCode('')
      toast.success('Telegram account successfully linked!')
    } catch (error) {
      console.error('Error verifying code:', error)
      // toast.error('Failed to verify code. Please try again.')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleEventUpdate = async () => {
    await Promise.all([mutateFavorites(), mutatePlanned()])
  }

  if (!user || error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-red-50 text-red-800 p-4 rounded-md">
          Error loading profile. Please try again later.
        </div>
      </div>
    )
  }

  if (!userProfile) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>My Profile | EventHub</title>
      </Head>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">My Profile</h1>
        
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">User Information</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Personal details and account settings.</p>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:px-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{userProfile?.Email || 'N/A'}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{userProfile?.Name || 'N/A'}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Roles</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {userProfile?.Roles?.length > 0 
                    ? userProfile.Roles.join(', ') 
                    : 'No roles assigned'
                  }
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Telegram Status</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {userProfile?.IsTelegramVerified ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Not Verified
                    </span>
                  )}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Event Notifications</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {userProfile?.NotifyBeforeEvent ? 'Enabled' : 'Disabled'}
                </dd>
              </div>
              {userProfile?.TelegramId && (
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Telegram ID</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{userProfile.TelegramId}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Edit Profile Form */}
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Edit Profile</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Update your account information.</p>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-6">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    autoComplete="name"
                    className={`mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 ${
                      errors.name ? 'border-red-500' : ''
                    }`}
                    {...register('name')}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    autoComplete="email"
                    className={`mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 ${
                      errors.email ? 'border-red-500' : ''
                    }`}
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div className="col-span-6">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="notifyBeforeEvent"
                        type="checkbox"
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                        {...register('notifyBeforeEvent')}
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="notifyBeforeEvent" className="font-medium text-gray-700 dark:text-gray-300">
                        Notifications in telegram
                      </label>
                      <p className="text-gray-500 dark:text-gray-400">Get notifications before events you are planning to attend and when you manage your favorite/planned list.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Telegram Verification */}
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Telegram Integration</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Link your Telegram account for notifications.</p>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-6">
            {userProfile?.IsTelegramVerified ? (
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-900">Telegram account linked</h3>
                  <p className="mt-1 text-sm text-gray-500">Your Telegram account has been successfully linked.</p>
                </div>
              </div>
            ) : showTelegramVerification ? (
              <div className="space-y-6">
                {/* Debug info */}
                <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                  Debug: showTelegramVerification={showTelegramVerification.toString()}, 
                  telegramLink={telegramLink || 'null'}
                </div>
                {telegramLink && (
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm text-gray-700 mb-2">1. Open this link in Telegram:</p>
                    <a
                      href={telegramLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 break-all font-medium"
                    >
                      {telegramLink}
                    </a>
                    <p className="text-sm text-gray-700 mt-4 mb-2">2. Start the verification process:</p>
                    {/* <button
                      type="button"
                      onClick={handleStartVerification}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Send Verification Code
                    </button> */}

                    <p className="text-sm text-gray-700 mt-4 mb-2">Sending the command /start</p>

                    <div className="mt-4">
                      <p className="text-sm text-gray-700 mb-2">3. Enter the verification code:</p>
                      <div className="mt-1 flex rounded-md shadow-sm">
                        <input
                          type="text"
                          value={telegramCode}
                          onChange={(e) => setTelegramCode(e.target.value)}
                          className="focus:ring-blue-500 focus:border-blue-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
                          placeholder="Verification code"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyCode}
                          disabled={isVerifying}
                          className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                          {isVerifying ? 'Verifying...' : 'Verify'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowTelegramVerification(false)}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-500 mb-4">
                  Link your Telegram account to receive notifications and verify your identity.
                </p>
                <button
                  type="button"
                  onClick={handleRequestTelegramLink}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Connect Telegram Account
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Favorite Events */}
        {/* <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">Favorite Events</h2>
            <p className="mt-1 text-sm text-gray-500">Events you have marked as favorites.</p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            {favoriteError ? (
              <div className="bg-red-50 text-red-800 p-4 rounded-md">
                Error loading favorite events. Please try again later.
              </div>
            ) : !favoriteEventsData ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : favoriteEventsData?.Items?.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>You haven't favorited any events yet.</p>
                <Link href="/events" className="mt-2 inline-block text-blue-600 hover:text-blue-800">
                  Browse events
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {favoriteEventsData?.Items?.map((event: Event) => (
                  <EventCard 
                    key={event.id} 
                    event={event} 
                    onEventUpdate={handleEventUpdate}
                    showOrganizer={true} 
                  />
                ))}
              </div>
            )}
          </div>
        </div> */}

        {/* Planned Events
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">Events You're Going To</h2>
            <p className="mt-1 text-sm text-gray-500">Events you've planned to attend.</p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            {plannedError ? (
              <div className="bg-red-50 text-red-800 p-4 rounded-md">
                Error loading planned events. Please try again later.
              </div>
            ) : !plannedEventsData ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : plannedEventsData?.Items?.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>You haven't planned to attend any events yet.</p>
                <Link href="/events" className="mt-2 inline-block text-blue-600 hover:text-blue-800">
                  Browse events
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {plannedEventsData?.Items?.map((event: Event) => (
                  <EventCard 
                    key={event.id} 
                    event={event} 
                    onEventUpdate={handleEventUpdate}
                    showOrganizer={true} 
                  />
                ))}
              </div>
            )}
          </div>
        </div> */}
      </div>
    </>
  )
}

export default withAuth(ProfilePage)

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common', 'profile'])),
    },
  }
}