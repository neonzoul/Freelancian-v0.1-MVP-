'use client'

import { QueryClient, MutationCache, QueryCache } from '@tanstack/react-query'
// Using custom toast system instead of react-hot-toast
const toast = {
  error: (message: string, options?: { id?: string; duration?: number }) => {
    console.error('Toast Error:', message)
    // In a real implementation, this would integrate with our custom Toast component
    // For now, we'll just log the error
  }
}

// Create a query client with global error handling
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        retry: (failureCount, error) => {
          // Don't retry on 4xx errors (client errors)
          if (error instanceof Error && error.message.includes('4')) {
            return false
          }
          // Retry up to 2 times for other errors
          return failureCount < 2
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 1,
        retryDelay: 1000,
      },
    },
    queryCache: new QueryCache({
      onError: (error, query) => {
        // Only show error toasts for background refetches
        // UI-triggered queries should handle their own errors
        if (query.state.data !== undefined) {
          console.error('Background query error:', error)
          
          // Show a subtle notification for background errors
          const errorMessage = getErrorMessage(error)
          if (errorMessage.includes('network') || errorMessage.includes('connection')) {
            // Don't spam users with network errors during background refetches
            return
          }
          
          toast.error('Failed to refresh data', {
            id: `query-error-${query.queryHash}`,
            duration: 3000,
          })
        }
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, variables, context, mutation) => {
        // Let individual mutations handle their own errors
        // This is just for logging and monitoring
        console.error('Mutation error:', {
          error,
          mutationKey: mutation.options.mutationKey,
          variables,
        })
        
        // In production, send to error monitoring service
        if (process.env.NODE_ENV === 'production') {
          // Example: Sentry.captureException(error, { extra: { mutationKey, variables } })
        }
      },
    }),
  })
}

// Extract user-friendly error messages
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Handle fetch errors
    if (error.message.includes('fetch')) {
      return 'network error'
    }
    
    // Handle timeout errors
    if (error.message.includes('timeout')) {
      return 'request timeout'
    }
    
    // Handle abort errors
    if (error.message.includes('abort')) {
      return 'request cancelled'
    }
    
    return error.message
  }
  
  if (typeof error === 'string') {
    return error
  }
  
  return 'An unexpected error occurred'
}

// Utility function to handle React Query errors in components
export function handleQueryError(error: unknown, fallbackMessage?: string) {
  const message = getErrorMessage(error)
  console.error('Query error:', error)
  
  // Return user-friendly message
  if (message.includes('network') || message.includes('fetch')) {
    return 'Unable to connect to the server. Please check your internet connection.'
  }
  
  if (message.includes('timeout')) {
    return 'The request took too long to complete. Please try again.'
  }
  
  if (message.includes('404') || message.includes('not found')) {
    return 'The requested data was not found.'
  }
  
  if (message.includes('403') || message.includes('forbidden')) {
    return 'You don\'t have permission to access this data.'
  }
  
  if (message.includes('401') || message.includes('unauthorized')) {
    return 'Authentication required. Please log in.'
  }
  
  if (message.includes('500') || message.includes('server')) {
    return 'Server error. Please try again later.'
  }
  
  return fallbackMessage || 'An unexpected error occurred. Please try again.'
}

// Hook for handling mutation errors with toast notifications
export function useMutationErrorHandler() {
  return (error: unknown, context?: string) => {
    const message = handleQueryError(error)
    const contextMessage = context ? `${context}: ${message}` : message
    
    toast.error(contextMessage, {
      duration: 5000,
    })
  }
}

// Optimistic update error handler
export function handleOptimisticUpdateError<T>(
  queryClient: QueryClient,
  queryKey: unknown[],
  previousData: T | undefined,
  error: unknown,
  context?: string
) {
  // Rollback optimistic update
  if (previousData !== undefined) {
    queryClient.setQueryData(queryKey, previousData)
  }
  
  // Show error message
  const message = handleQueryError(error, 'Failed to save changes')
  const contextMessage = context ? `${context}: ${message}` : message
  
  toast.error(contextMessage, {
    duration: 5000,
  })
  
  // Invalidate queries to ensure data consistency
  queryClient.invalidateQueries({ queryKey })
}