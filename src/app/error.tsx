'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { fadeInUp, staggerContainer } from '@/lib/animations'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error boundary caught:', error)
  }, [error])

  const handleReload = () => {
    window.location.reload()
  }

  const getErrorMessage = () => {
    // Provide user-friendly messages for common errors
    if (error.message.includes('fetch')) {
      return {
        title: 'Connection Problem',
        description: "We're having trouble connecting to our servers. Please check your internet connection and try again.",
        suggestion: 'This is usually temporary and should resolve itself shortly.'
      }
    }
    
    if (error.message.includes('timeout')) {
      return {
        title: 'Request Timeout',
        description: 'The request took too long to complete. This might be due to a slow connection or server issues.',
        suggestion: 'Please try again in a moment.'
      }
    }
    
    if (error.message.includes('validation') || error.message.includes('invalid')) {
      return {
        title: 'Invalid Data',
        description: 'There was a problem with the data format. This is likely a temporary issue.',
        suggestion: 'Please refresh the page and try again.'
      }
    }

    // Default error message
    return {
      title: 'Something went wrong',
      description: "We encountered an unexpected error. Don't worry, your data is safe.",
      suggestion: 'You can try refreshing the page or go back to continue.'
    }
  }

  const errorInfo = getErrorMessage()

  return (
    <div className="min-h-screen bg-gradient-to-br from-error-50 to-neutral-50 flex items-center justify-center p-4">
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="max-w-lg w-full text-center"
      >
        {/* Error Icon */}
        <motion.div
          variants={fadeInUp}
          className="mb-8"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, -5, 5, 0]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className="w-24 h-24 bg-error-100 rounded-full flex items-center justify-center mx-auto"
          >
            <svg 
              className="w-12 h-12 text-error-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
              />
            </svg>
          </motion.div>
        </motion.div>

        {/* Content */}
        <motion.div variants={fadeInUp} className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-4">
            {errorInfo.title}
          </h1>
          <p className="text-lg text-neutral-600 mb-3">
            {errorInfo.description}
          </p>
          <p className="text-neutral-500">
            {errorInfo.suggestion}
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div 
          variants={fadeInUp}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
        >
          <Button
            onClick={reset}
            variant="primary"
            size="lg"
            className="flex-1 sm:flex-none"
          >
            <svg 
              className="w-5 h-5 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
              />
            </svg>
            Try Again
          </Button>
          
          <Button
            onClick={handleReload}
            variant="outline"
            size="lg"
            className="flex-1 sm:flex-none"
          >
            <svg 
              className="w-5 h-5 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
              />
            </svg>
            Refresh Page
          </Button>
        </motion.div>

        {/* Development Error Details */}
        {process.env.NODE_ENV === 'development' && (
          <motion.details 
            variants={fadeInUp}
            className="text-left bg-white rounded-lg p-4 shadow-soft"
          >
            <summary className="cursor-pointer text-sm font-medium text-neutral-700 hover:text-neutral-900 mb-3">
              Error Details (Development Only)
            </summary>
            <div className="space-y-3">
              <div>
                <div className="text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-1">
                  Error Message
                </div>
                <div className="text-sm font-mono bg-neutral-50 p-3 rounded border text-error-700">
                  {error.message}
                </div>
              </div>
              
              {error.digest && (
                <div>
                  <div className="text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-1">
                    Error Digest
                  </div>
                  <div className="text-sm font-mono bg-neutral-50 p-3 rounded border text-neutral-700">
                    {error.digest}
                  </div>
                </div>
              )}
              
              {error.stack && (
                <div>
                  <div className="text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-1">
                    Stack Trace
                  </div>
                  <div className="text-xs font-mono bg-neutral-50 p-3 rounded border text-neutral-700 overflow-auto max-h-40">
                    <pre className="whitespace-pre-wrap">{error.stack}</pre>
                  </div>
                </div>
              )}
            </div>
          </motion.details>
        )}
      </motion.div>
    </div>
  )
}