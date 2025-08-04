import { useTranslation } from 'next-i18next'
import { useLanguage } from '../lib/LanguageContext'

export default function LocalizationTest() {
  const { t } = useTranslation('common')
  const { currentLanguage, setLanguage } = useLanguage()

  const testKeys = [
    'navbar.home',
    'navbar.about',
    'navbar.events',
    'auth.signIn',
    'auth.signUp',
    'events.title',
    'common.save',
    'common.cancel'
  ]

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Localization Test</h2>
      <p className="mb-4">Current Language: {currentLanguage}</p>
      
      <div className="mb-4">
        <button 
          onClick={() => setLanguage('en')}
          className="mr-2 px-3 py-1 bg-blue-500 text-white rounded"
        >
          English
        </button>
        <button 
          onClick={() => setLanguage('ru')}
          className="mr-2 px-3 py-1 bg-blue-500 text-white rounded"
        >
          Русский
        </button>
        <button 
          onClick={() => setLanguage('az')}
          className="px-3 py-1 bg-blue-500 text-white rounded"
        >
          Azərbaycan
        </button>
      </div>

      <div className="space-y-2">
        {testKeys.map(key => (
          <div key={key} className="flex justify-between">
            <span className="font-mono text-sm">{key}:</span>
            <span>{t(key)}</span>
          </div>
        ))}
      </div>
    </div>
  )
} 