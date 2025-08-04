import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { GetServerSideProps } from 'next'
import { useLanguage } from '../lib/LanguageContext'

export default function DebugI18n() {
  const { t, i18n } = useTranslation('common')
  const { currentLanguage, setLanguage } = useLanguage()

  const testKeys = [
    'navbar.home',
    'navbar.about', 
    'navbar.events',
    'auth.signIn',
    'auth.signUp',
    'events.title',
    'common.save',
    'common.cancel',
    'welcome',
    'missionDescription'
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Отладка i18n
        </h1>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">Информация о i18n</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="font-semibold">Текущий язык:</h3>
              <p>{currentLanguage}</p>
            </div>
            <div>
              <h3 className="font-semibold">Язык i18n:</h3>
              <p>{i18n.language}</p>
            </div>
            <div>
              <h3 className="font-semibold">Доступные языки:</h3>
              <p>{i18n.languages?.join(', ')}</p>
            </div>
            <div>
              <h3 className="font-semibold">Режим:</h3>
              <p>{i18n.isInitialized ? 'Инициализирован' : 'Не инициализирован'}</p>
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            <button 
              onClick={() => setLanguage('en')}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              English
            </button>
            <button 
              onClick={() => setLanguage('ru')}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Русский
            </button>
            <button 
              onClick={() => setLanguage('az')}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Azərbaycan
            </button>
          </div>

          <div className="space-y-4">
            {testKeys.map(key => (
              <div key={key} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <span className="font-mono text-sm text-gray-600 dark:text-gray-300">{key}:</span>
                <span className="text-gray-900 dark:text-white">{t(key)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Отладочная информация</h2>
          <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded text-sm overflow-x-auto">
            {JSON.stringify({
              currentLanguage,
              i18nLanguage: i18n.language,
              isInitialized: i18n.isInitialized,
              availableLanguages: i18n.languages,
              testResults: testKeys.map(key => ({
                key,
                value: t(key),
                isTranslated: t(key) !== key
              }))
            }, null, 2)}
          </pre>
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