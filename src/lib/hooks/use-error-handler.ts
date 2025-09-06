'use client'

import { useCallback } from 'react'
import { useToast } from '@/components/ui/Toast'
import type { ApiErrorResponse } from '@/types/api'

interface ErrorHandlerOptions {
  showToast?: boolean
  logError?: boolean
  fallbackMessage?: string
}

export function useErrorHandler() {
  const { error: showErrorToast, warning: showWarningToast } = useToast()

  const handleError = useCallback((
    error: unknown,
    options: ErrorHandlerOptions = {}
  ) => {
    const {
      showToast = true,
      logError = true,
      fallbackMessage = 'An unexpected error occurred'
    } = options

    // Log error for debugging
    if (logError) {
      console.error('Error handled by useErrorHandler:', error)
    }

    // Extract error message and details
    const errorInfo = extractErrorInfo(error, fallbackMessage)

    // Show toast notification
    if (showToast) {
      if (errorInfo.type === 'warning') {
        showWarningToast(errorInfo.title, errorInfo.message)
      } else {
        showErrorToast(errorInfo.title, errorInfo.message)
      }
    }

    return errorInfo
  }, [showErrorToast, showWarningToast])

  // Handle API errors specifically
  const handleApiError = useCallback((
    error: unknown,
    options: ErrorHandlerOptions = {}
  ) => {
    const errorInfo = extractApiErrorInfo(error)
    return handleError(error, {
      fallbackMessage: errorInfo.message,
      ...options
    })
  }, [handleError])

  // Handle form validation errors
  const handleValidationError = useCallback((
    error: unknown,
    options: ErrorHandlerOptions = {}
  ) => {
    const errorInfo = extractValidationErrorInfo(error)
    return handleError(error, {
      fallbackMessage: errorInfo.message,
      showToast: false, // Usually handled by form UI
      ...options
    })
  }, [handleError])

  // Handle network errors
  const handleNetworkError = useCallback((
    error: unknown,
    options: ErrorHandlerOptions = {}
  ) => {
    const errorInfo = extractNetworkErrorInfo(error)
    return handleError(error, {
      fallbackMessage: errorInfo.message,
      ...options
    })
  }, [handleError])

  return {
    handleError,
    handleApiError,
    handleValidationError,
    handleNetworkError
  }
}

// Error information extraction utilities
interface ErrorInfo {
  title: string
  message: string
  type: 'error' | 'warning'
  code?: string
  details?: Record<string, string[]>
}

function extractErrorInfo(error: unknown, fallbackMessage: string): ErrorInfo {
  // Handle Error objects
  if (error instanceof Error) {
    return {
      title: 'Error',
      message: error.message || fallbackMessage,
      type: 'error'
    }
  }

  // Handle string errors
  if (typeof error === 'string') {
    return {
      title: 'Error',
      message: error || fallbackMessage,
      type: 'error'
    }
  }

  // Handle API error responses
  if (isApiErrorResponse(error)) {
    return {
      title: error.error.title || 'API Error',
      message: error.error.detail || fallbackMessage,
      type: error.error.status >= 500 ? 'error' : 'warning',
      code: error.error.type,
      details: error.error.errors
    }
  }

  // Default fallback
  return {
    title: 'Error',
    message: fallbackMessage,
    type: 'error'
  }
}

function extractApiErrorInfo(error: unknown): ErrorInfo {
  if (isApiErrorResponse(error)) {
    const { error: apiError } = error
    
    // Map common HTTP status codes to user-friendly messages
    const statusMessages: Record<number, { title: string; message: string }> = {
      400: {
        title: 'Invalid Request',
        message: 'The request contains invalid data. Please check your input and try again.'
      },
      401: {
        title: 'Authentication Required',
        message: 'You need to be logged in to perform this action.'
      },
      403: {
        title: 'Access Denied',
        message: 'You don\'t have permission to perform this action.'
      },
      404: {
        title: 'Not Found',
        message: 'The requested resource could not be found.'
      },
      409: {
        title: 'Conflict',
        message: 'This action conflicts with existing data. Please refresh and try again.'
      },
      422: {
        title: 'Validation Error',
        message: 'Please check your input and correct any errors.'
      },
      429: {
        title: 'Too Many Requests',
        message: 'You\'re making requests too quickly. Please wait a moment and try again.'
      },
      500: {
        title: 'Server Error',
        message: 'We\'re experiencing technical difficulties. Please try again later.'
      },
      503: {
        title: 'Service Unavailable',
        message: 'The service is temporarily unavailable. Please try again later.'
      }
    }

    const statusInfo = statusMessages[apiError.status]
    
    return {
      title: statusInfo?.title || apiError.title || 'API Error',
      message: apiError.detail || statusInfo?.message || 'An API error occurred',
      type: apiError.status >= 500 ? 'error' : 'warning',
      code: apiError.type,
      details: apiError.errors
    }
  }

  return extractErrorInfo(error, 'An API error occurred')
}

function extractValidationErrorInfo(error: unknown): ErrorInfo {
  if (isApiErrorResponse(error) && error.error.errors) {
    const fieldErrors = Object.entries(error.error.errors)
    const firstError = fieldErrors[0]
    
    if (firstError) {
      const [field, messages] = firstError
      return {
        title: 'Validation Error',
        message: `${field}: ${messages[0]}`,
        type: 'warning',
        details: error.error.errors
      }
    }
  }

  return extractErrorInfo(error, 'Please check your input and try again')
}

function extractNetworkErrorInfo(error: unknown): ErrorInfo {
  if (error instanceof Error) {
    // Handle common network error patterns
    if (error.message.includes('fetch')) {
      return {
        title: 'Connection Error',
        message: 'Unable to connect to the server. Please check your internet connection.',
        type: 'error'
      }
    }
    
    if (error.message.includes('timeout')) {
      return {
        title: 'Request Timeout',
        message: 'The request took too long to complete. Please try again.',
        type: 'warning'
      }
    }
    
    if (error.message.includes('abort')) {
      return {
        title: 'Request Cancelled',
        message: 'The request was cancelled. Please try again.',
        type: 'warning'
      }
    }
  }

  return extractErrorInfo(error, 'A network error occurred')
}

// Type guard for API error responses
function isApiErrorResponse(error: unknown): error is ApiErrorResponse {
  return (
    typeof error === 'object' &&
    error !== null &&
    'success' in error &&
    error.success === false &&
    'error' in error &&
    typeof error.error === 'object'
  )
}

// Utility function to get user-friendly error messages for specific error codes
export function getErrorMessage(code: string): string {
  const errorMessages: Record<string, string> = {
    'VALIDATION_ERROR': 'Please check your input and correct any errors.',
    'DUPLICATE_ENTRY': 'An entry with this information already exists.',
    'INVALID_DATE': 'Please enter a valid date.',
    'INVALID_AMOUNT': 'Please enter a valid amount.',
    'REQUIRED_FIELD': 'This field is required.',
    'INVALID_FORMAT': 'The format of this field is invalid.',
    'OUT_OF_RANGE': 'The value is outside the allowed range.',
    'UNAUTHORIZED': 'You are not authorized to perform this action.',
    'FORBIDDEN': 'Access to this resource is forbidden.',
    'NOT_FOUND': 'The requested resource was not found.',
    'CONFLICT': 'This action conflicts with existing data.',
    'RATE_LIMITED': 'Too many requests. Please wait before trying again.',
    'SERVER_ERROR': 'A server error occurred. Please try again later.',
    'SERVICE_UNAVAILABLE': 'The service is temporarily unavailable.'
  }

  return errorMessages[code] || 'An unexpected error occurred.'
}