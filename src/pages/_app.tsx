import type { AppProps } from 'next/app'
import { appWithTranslation } from 'next-i18next';
import { ThemeProvider } from '../lib/ThemeContext';
import { LanguageProvider } from '../lib/LanguageContext';
import '../styles/globals.css'
import { AuthProvider } from '../lib/AuthContext'
import Layout from '../components/Layout'
import ErrorBoundary from '../components/ErrorBoundary'
import BanGuard from '../components/BanGuard'
import LanguageInitializer from '../components/LanguageInitializer'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <LanguageInitializer />
        <AuthProvider>
          <BanGuard>
            <ThemeProvider>
              <Layout>
                <Component {...pageProps} />
              </Layout>
            </ThemeProvider>
          </BanGuard>
        </AuthProvider>
      </LanguageProvider>
    </ErrorBoundary>
  )
}

export default appWithTranslation(MyApp)
