import { useEffect } from 'react'
import { useLanguage } from '../lib/LanguageContext'
import { useIsClient } from '../lib/useIsClient'

export default function LanguageInitializer() {
  const { currentLanguage, setLanguage } = useLanguage()
  const isClient = useIsClient()

  useEffect(() => {
    if (!isClient) return

    // Проверяем язык в localStorage при загрузке
    const storedLanguage = localStorage.getItem('eventhub-language')
    if (storedLanguage && storedLanguage !== currentLanguage) {
      setLanguage(storedLanguage)
    }
  }, [isClient, currentLanguage, setLanguage])

  return null
} 