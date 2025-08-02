// pages/index.tsx
import { useState } from 'react'
import useSWR from 'swr'
import { useEvents, useFavorites, usePlannedEvents, useEventsSimple } from '../lib/api'
import type { Event } from '../lib/types'
import EventCard from '../components/EventCard'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@lib/AuthContext'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { GetServerSideProps } from 'next'
import LocalizationTest from '../components/LocalizationTest'

export default function Home() {
  const { isAuthenticated } = useAuth()
  const { t } = useTranslation()
  // const [category, setCategory] = useState<string>('')
  // const [filter, setFilter] = useState<'all' | 'favorites' | 'planned'>('all')
  // const [token, setToken] = useState<string>()
  // const { data, error, mutate } = useEvents(category ? { category } : undefined)
  const { data: events, error, mutate } = useEventsSimple()
  const { data: favorites } = useFavorites()
  const { data: planned } = usePlannedEvents()
  console.log(events)
  
  // const displayedEvents = (): Event[] => {
  //   if (filter === 'favorites') return favorites?.items || [];
  //   if (filter === 'planned') return planned?.items || [];
  //   // if (Array.isArray(data)) return data;
  //   return data?.items || [];
  //   // return data?.Items || [];
  // }

  // const categories = ['Conference', 'Workshop', 'Meetup', 'Other']

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="relative h-[600px] overflow-hidden bg-gradient-to-br from-indigo-700 via-purple-700 via-blue-700 via-indigo-800 to-purple-900 flowing-gradient">
        {/* Hero Content */}
        <div className="relative z-10 h-full flex items-center">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl"
            >
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                {t('welcome')}
              </h1>
              <p className="text-xl text-gray-200 mb-8">
                {t('missionDescription')}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/events"
                  className="bg-white text-gray-900 px-8 py-3 rounded-full font-medium hover:shadow-lg transition-all duration-300"
                >
                  {t('events.title')}
                </Link>
                {!isAuthenticated && (
                  <Link
                    href="/register"
                    className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-full font-medium hover:bg-white hover:text-gray-900 transition-all duration-300"
                  >
                    {t('auth.signUp')}
                  </Link>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
          <div className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
          <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {t('whatWeOffer')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {t('missionDescription')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
              title={t('eventDiscovery')}
              description={t('eventDiscoveryDescription')}
            />
            <FeatureCard
              icon={
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              }
              title={t('socialEngagement')}
              description={t('socialEngagementDescription')}
            />
            <FeatureCard
              icon={
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
              title={t('easyPlanning')}
              description={t('easyPlanningDescription')}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-purple-600 to-indigo-600 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
              {t('joinCommunity')}
            </h2>
            <Link
              href={isAuthenticated ? "/events" : "/register"}
              className="bg-white text-gray-900 px-8 py-3 rounded-full font-medium hover:shadow-lg transition-all duration-300 inline-block"
            >
              {isAuthenticated ? t('events.title') : t('auth.signUp')}
            </Link>
          </motion.div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t('events.upcomingEvents')}</h1>
        </div>

        {error && (
          <div className="text-red-600 dark:text-red-400 mb-4">{t('events.failedToLoadEvents')}</div>
        )}

        {!events && !error && (
          <div className="text-gray-600 dark:text-gray-400">{t('events.loadingEvents')}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(events?.Items ?? []).map(event => (            
            <EventCard 
              key={event.Id} 
              event={event}
            />
          ))}
        </div>
      </main>
      
      {/* Localization Test Component */}
      {/* <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LocalizationTest />
      </div> */}
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
    >
      <div className="text-purple-600 dark:text-purple-400 mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </motion.div>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common'])),
    },
  }
}
