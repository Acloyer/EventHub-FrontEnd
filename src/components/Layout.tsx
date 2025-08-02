// src/components/Layout.tsx
import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import { Toaster } from 'react-hot-toast'
import Navbar from './Navbar'
import Footer from './Footer'
import ErrorBoundary from './ErrorBoundary'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter()
  
  // Don't show navigation and footer on /banned page
  const isBannedPage = router.pathname === '/banned'

  // Add click handler for toast notifications
  useEffect(() => {
    const handleToastClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      // Look for toast elements by their class names or data attributes
      const toastElement = target.closest('[class*="toast"]') || 
                          target.closest('[data-testid="toast"]') || 
                          target.closest('[role="status"]') ||
                          target.closest('[style*="background: rgb(54, 54, 54)"]')
      
      if (toastElement) {
        // Add smooth fade out animation
        const element = toastElement as HTMLElement
        element.style.opacity = '0'
        element.style.transform = 'translateX(100%)'
        element.style.transition = 'all 0.3s ease'
        
        // Remove the toast after animation
        setTimeout(() => {
          if (element.parentNode) {
            element.parentNode.removeChild(element)
          }
        }, 300)
      }
    }

    // Add event listener with a small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      document.addEventListener('click', handleToastClick)
    }, 100)

    // Cleanup
    return () => {
      clearTimeout(timer)
      document.removeEventListener('click', handleToastClick)
    }
  }, [])

  return (
    <ErrorBoundary>
      <div className="flex flex-col min-h-screen">
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--toast-bg, #363636)',
              color: 'var(--toast-color, #fff)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10B981',
                secondary: 'white',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#EF4444',
                secondary: 'white',
              },
            },
          }}
        />
        {!isBannedPage && <Navbar />}
        <main className={`flex-grow ${isBannedPage ? '' : 'container mx-auto px-4 py-6 sm:px-6 lg:px-8'}`}>
          {children}
        </main>
        {!isBannedPage && <Footer />}
      </div>
    </ErrorBoundary>
  )
}
