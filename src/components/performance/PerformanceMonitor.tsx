'use client'

import { useEffect } from 'react'
import { initializePerformanceMonitoring } from '@/lib/performance'

export function PerformanceMonitor() {
  useEffect(() => {
    // Initialize performance monitoring
    initializePerformanceMonitoring()
    
    // Add performance observer for long tasks
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) { // Tasks longer than 50ms
            console.warn('Long Task detected:', {
              duration: entry.duration,
              startTime: entry.startTime,
              name: entry.name,
            })
          }
        }
      })
      
      try {
        observer.observe({ entryTypes: ['longtask'] })
      } catch (error) {
        // Long task API not supported
        console.log('Long Task API not supported')
      }
    }

    // Monitor React Query performance
    const originalFetch = window.fetch
    window.fetch = async (...args) => {
      const startTime = performance.now()
      const url = args[0]?.toString() || 'unknown'
      
      try {
        const response = await originalFetch(...args)
        const duration = performance.now() - startTime
        
        // Log slow API calls
        if (duration > 1000) {
          console.warn('Slow API call:', {
            url,
            duration: `${duration.toFixed(2)}ms`,
            status: response.status,
          })
        }
        
        return response
      } catch (error) {
        const duration = performance.now() - startTime
        console.error('Failed API call:', {
          url,
          duration: `${duration.toFixed(2)}ms`,
          error,
        })
        throw error
      }
    }

    // Cleanup
    return () => {
      window.fetch = originalFetch
    }
  }, [])

  // Only render in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return null // This component doesn't render anything visible
}