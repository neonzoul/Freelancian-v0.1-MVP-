'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { ToastProvider } from '@/components/ui/Toast'
import { ErrorBoundary } from '@/components/error/ErrorBoundary'
import { AccessibilityProvider } from '@/components/providers/AccessibilityProvider'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
            retry: 1,
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: 1,
          },
        },
      })
  )

  const handleGlobalError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error('Global error boundary caught:', error, errorInfo)
    
    // In production, you might want to send this to an error reporting service
    // like Sentry, LogRocket, etc.
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { extra: errorInfo })
    }
  }

  return (
    <ErrorBoundary onError={handleGlobalError}>
      <QueryClientProvider client={queryClient}>
        <AccessibilityProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AccessibilityProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}