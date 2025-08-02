import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

interface LanguageContextType {
  currentLanguage: string
  setLanguage: (lang: string) => void
  isLoading: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const SUPPORTED_LANGUAGES = ['en', 'ru', 'az']
const DEFAULT_LANGUAGE = 'en'
const LANGUAGE_STORAGE_KEY = 'eventhub-language'

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<string>(DEFAULT_LANGUAGE)
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  const router = useRouter()
  const { i18n } = useTranslation()

  // Функция для получения языка из localStorage или определения по умолчанию
  const getStoredLanguage = (): string => {
    if (typeof window === 'undefined') return DEFAULT_LANGUAGE
    
    try {
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY)
      if (stored && SUPPORTED_LANGUAGES.includes(stored)) {
        return stored
      }
    } catch (error) {
      console.warn('Failed to read language from localStorage:', error)
    }
    
    return DEFAULT_LANGUAGE
  }

  // Функция для сохранения языка в localStorage
  const saveLanguageToStorage = (lang: string) => {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang)
    } catch (error) {
      console.warn('Failed to save language to localStorage:', error)
    }
  }

  // Функция для изменения языка
  const setLanguage = async (lang: string) => {
    if (!SUPPORTED_LANGUAGES.includes(lang)) {
      console.warn(`Unsupported language: ${lang}`)
      return
    }

    setIsLoading(true)
    
    try {
      // Сохраняем в localStorage
      saveLanguageToStorage(lang)
      
      // Обновляем состояние
      setCurrentLanguage(lang)
      
      // Изменяем язык в i18n
      if (i18n && typeof i18n.changeLanguage === 'function') {
        await i18n.changeLanguage(lang)
      }
      
      // Обновляем роутер с новым языком
      const currentPath = router.asPath
      await router.push(currentPath, currentPath, { locale: lang })
      
    } catch (error) {
      console.error('Failed to change language:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Инициализация языка при загрузке
  useEffect(() => {
    const initializeLanguage = async () => {
      if (isInitialized) return
      
      setIsLoading(true)
      
      try {
        // Получаем сохраненный язык или используем язык из роутера
        const storedLang = getStoredLanguage()
        const routerLang = router.locale || router.defaultLocale || DEFAULT_LANGUAGE
        const targetLang = storedLang !== DEFAULT_LANGUAGE ? storedLang : routerLang
        
        // Устанавливаем язык в i18n
        if (i18n && typeof i18n.changeLanguage === 'function') {
          await i18n.changeLanguage(targetLang)
        }
        
        // Обновляем состояние
        setCurrentLanguage(targetLang)
        
        // Если язык в роутере отличается от сохраненного, обновляем роутер
        if (router.locale !== targetLang) {
          const currentPath = router.asPath
          await router.push(currentPath, currentPath, { locale: targetLang })
        }
        
        setIsInitialized(true)
        
      } catch (error) {
        console.error('Failed to initialize language:', error)
        setCurrentLanguage(DEFAULT_LANGUAGE)
        setIsInitialized(true)
      } finally {
        setIsLoading(false)
      }
    }

    initializeLanguage()
  }, [router.locale, router.asPath, i18n, isInitialized])

  // Синхронизация с изменениями роутера
  useEffect(() => {
    if (isInitialized && router.locale && router.locale !== currentLanguage) {
      setCurrentLanguage(router.locale)
      saveLanguageToStorage(router.locale)
    }
  }, [router.locale, currentLanguage, isInitialized])

  const value: LanguageContextType = {
    currentLanguage,
    setLanguage,
    isLoading
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
} 