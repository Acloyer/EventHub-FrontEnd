import React from 'react'
import Head from 'next/head'
import { withAuth } from '../lib/AuthContext'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { GetServerSideProps } from 'next'

function AboutPage() {
  const { t } = useTranslation()
  
  return (
    <>
      <Head>
        <title>{t('navbar.about')}</title>
        <meta name="description" content={t('missionDescription')} />
      </Head>
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t('navbar.about')}</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            {t('missionDescription')}
          </p>
        </div>

        <div className="prose prose-blue max-w-none dark:prose-invert">
          <h2 className="text-gray-900 dark:text-gray-100">{t('mission')}</h2>
          <p className="text-gray-700 dark:text-gray-300">
            {t('missionDescription')}
          </p>
          
          <h2 className="text-gray-900 dark:text-gray-100">{t('whatWeOffer')}</h2>
          <div className="grid md:grid-cols-3 gap-6 my-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600 dark:text-blue-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100">{t('eventDiscovery')}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('eventDiscoveryDescription')}
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600 dark:text-blue-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100">{t('socialEngagement')}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('socialEngagementDescription')}
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600 dark:text-blue-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100">{t('easyPlanning')}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('easyPlanningDescription')}
              </p>
            </div>
          </div>
          
          <h2 className="text-gray-900 dark:text-gray-100">{t('forOrganizers')}</h2>
          <p className="text-gray-700 dark:text-gray-300">
            {t('forOrganizersDescription')}
          </p>
          <ul className="text-gray-700 dark:text-gray-300">
            {(t('organizerFeatures', { returnObjects: true }) as string[]).map((feature: string, index: number) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
          
          <h2 className="text-gray-900 dark:text-gray-100">{t('joinCommunity')}</h2>
          <p className="text-gray-700 dark:text-gray-300">
            {t('joinCommunityDescription')}
          </p>
        </div>
        
        <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8">
          <h3 className="text-xl font-semibold mb-4 text-center text-gray-900 dark:text-gray-100">{t('footer.haveQuestions')}</h3>
          <p className="text-center text-gray-600 dark:text-gray-300">
            {t('footer.contactSupport')} <a href="mailto:support@eventhub.com" className="text-blue-600 hover:underline dark:text-blue-400 dark:hover:text-blue-300">support@eventhub.com</a>
          </p>
        </div>
      </div>
    </>
  )
}

export default AboutPage

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common'])),
    },
  }
} 