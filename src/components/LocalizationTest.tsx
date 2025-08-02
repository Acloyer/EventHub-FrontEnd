import { useTranslation } from 'next-i18next'
import { useLanguage } from '../lib/LanguageContext'

export default function LocalizationTest() {
  const { t } = useTranslation()
  const { currentLanguage, setLanguage } = useLanguage()

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'ru', name: 'Русский' },
    { code: 'az', name: 'Azərbaycan' }
  ]

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Localization Test</h2>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">Current Language: {currentLanguage}</p>
        <div className="flex space-x-2">
          {languages.map(lang => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`px-3 py-1 rounded text-sm ${
                currentLanguage === lang.code
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {lang.name}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <p><strong>Welcome:</strong> {t('welcome')}</p>
        <p><strong>Home:</strong> {t('navbar.home')}</p>
        <p><strong>Events:</strong> {t('navbar.events')}</p>
        <p><strong>Profile:</strong> {t('navbar.profile')}</p>
        <p><strong>Login:</strong> {t('navbar.login')}</p>
        <p><strong>Register:</strong> {t('navbar.register')}</p>
        <p><strong>Save:</strong> {t('common.save')}</p>
        <p><strong>Cancel:</strong> {t('common.cancel')}</p>
        <p><strong>Edit:</strong> {t('common.edit')}</p>
        <p><strong>Delete:</strong> {t('common.delete')}</p>
        <p><strong>Loading:</strong> {t('common.loading')}</p>
        <p><strong>Error:</strong> {t('common.error')}</p>
        <p><strong>Email:</strong> {t('auth.email')}</p>
        <p><strong>Password:</strong> {t('auth.password')}</p>
        <p><strong>Sign In:</strong> {t('auth.signIn')}</p>
        <p><strong>Sign Up:</strong> {t('auth.signUp')}</p>
        <p><strong>Events Title:</strong> {t('events.title')}</p>
        <p><strong>Create Event:</strong> {t('events.createEvent')}</p>
        <p><strong>Event Details:</strong> {t('events.eventDetails')}</p>
        <p><strong>Admin Dashboard:</strong> {t('admin.dashboard')}</p>
        <p><strong>User Management:</strong> {t('admin.userManagement')}</p>
        <p><strong>Profile Title:</strong> {t('profile.title')}</p>
        <p><strong>Edit Profile:</strong> {t('profile.editProfile')}</p>
        <p><strong>Footer Description:</strong> {t('footer.description')}</p>
      </div>
    </div>
  )
} 