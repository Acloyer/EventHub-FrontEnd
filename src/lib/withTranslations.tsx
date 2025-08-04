import React from 'react'
import { useTranslation } from 'next-i18next'

export function withTranslations<P extends object>(
  Component: React.ComponentType<P>,
  namespaces: string[] = ['common']
) {
  return function WithTranslationsComponent(props: P) {
    const { t, i18n } = useTranslation(namespaces)
    
    return <Component {...props} t={t} i18n={i18n} />
  }
}

export default withTranslations 