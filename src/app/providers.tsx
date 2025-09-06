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
            retry: (failureCount, error: any) => {
              // Don't retry on 4xx errors
              if (error?.status >= 400 && error?.status < 500) {
                return false
              }
              // Retry up to 2 times for other errors
              return failureCount < 2
            },
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
            // Enable background refetching for better UX
            refetchInterval: false,
            refetchIntervalInBackground: false,
            // Network mode for better offline handling
            networkMode: 'online',
          },
          mutations: {
            retry: (failureCount, error: any) => {
              // Don't retry on 4xx errors
              if (error?.status >= 400 && error?.status < 500) {
                return false
              }
              return failureCount < 1
            },
            retryDelay: 1000,
            networkMode: 'online',
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