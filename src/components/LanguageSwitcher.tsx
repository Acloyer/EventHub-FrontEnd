import { useLanguage } from '../lib/LanguageContext'
import { useTranslation } from 'next-i18next'
import { useIsClient } from '../lib/useIsClient'

const LANGS = [
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'RU' },
  { code: 'az', label: 'AZ' },
]

export default function LanguageSwitcher() {
  const { currentLanguage, setLanguage, isLoading } = useLanguage()
  const { t } = useTranslation()
  const isClient = useIsClient()

  const handleLanguageChange = async (langCode: string) => {
    if (isLoading || langCode === currentLanguage || !isClient) return
    
    try {
      await setLanguage(langCode)
    } catch (error) {
      console.error('Failed to change language:', error)
    }
  }

  // Не рендерим на сервере
  if (!isClient) {
    return (
      <div className="flex items-center space-x-1 ml-2">
        {LANGS.map(lang => (
          <div
            key={lang.code}
            className="px-2 py-1 rounded text-sm font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
          >
            {lang.label}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-1 ml-2">
      {LANGS.map(lang => (
        <button
          key={lang.code}
          onClick={() => handleLanguageChange(lang.code)}
          disabled={isLoading}
          className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
            currentLanguage === lang.code
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-label={t(`language.${lang.code}`)}
        >
          {lang.label}
        </button>
      ))}
    </div>
  )
} 