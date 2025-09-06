'use client'

// Performance monitoring utilities for Core Web Vitals and custom metrics

interface PerformanceMetric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  timestamp: number
}

interface WebVitalsMetrics {
  CLS?: PerformanceMetric
  FID?: PerformanceMetric
  FCP?: PerformanceMetric
  LCP?: PerformanceMetric
  TTFB?: PerformanceMetric
}

// Core Web Vitals thresholds
const THRESHOLDS = {
  CLS: { good: 0.1, poor: 0.25 },
  FID: { good: 100, poor: 300 },
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  TTFB: { good: 800, poor: 1800 },
}

// Get rating based on thresholds
function getRating(name: keyof typeof THRESHOLDS, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name]
  if (value <= threshold.good) return 'good'
  if (value <= threshold.poor) return 'needs-improvement'
  return 'poor'
}

// Performance metrics storage
let metrics: WebVitalsMetrics = {}

// Report metric to analytics (placeholder for future implementation)
function reportMetric(metric: PerformanceMetric) {
  // In production, you would send this to your analytics service
  console.log('Performance Metric:', metric)
  
  // Store locally for debugging
  metrics[metric.name as keyof WebVitalsMetrics] = metric
  
  // You could send to services like:
  // - Google Analytics 4
  // - Vercel Analytics
  // - Custom analytics endpoint
  // - Sentry Performance
}

// Web Vitals measurement functions
export function measureCLS() {
  if (typeof window === 'undefined') return

  let clsValue = 0
  let clsEntries: LayoutShift[] = []

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries() as LayoutShift[]) {
      // Only count layout shifts without recent user input
      if (!entry.hadRecentInput) {
        clsValue += entry.value
        clsEntries.push(entry)
      }
    }
  })

  observer.observe({ type: 'layout-shift', buffered: true })

  // Report CLS when the page is about to be unloaded
  const reportCLS = () => {
    reportMetric({
      name: 'CLS',
      value: clsValue,
      rating: getRating('CLS', clsValue),
      timestamp: Date.now(),
    })
  }

  // Report on page unload
  window.addEventListener('beforeunload', reportCLS)
  
  // Also report after 5 seconds for SPA navigation
  setTimeout(reportCLS, 5000)
}

export function measureFID() {
  if (typeof window === 'undefined') return

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries() as PerformanceEventTiming[]) {
      reportMetric({
        name: 'FID',
        value: entry.processingStart - entry.startTime,
        rating: getRating('FID', entry.processingStart - entry.startTime),
        timestamp: Date.now(),
      })
    }
  })

  observer.observe({ type: 'first-input', buffered: true })
}

export function measureLCP() {
  if (typeof window === 'undefined') return

  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries() as PerformancePaintTiming[]
    const lastEntry = entries[entries.length - 1]
    
    reportMetric({
      name: 'LCP',
      value: lastEntry.startTime,
      rating: getRating('LCP', lastEntry.startTime),
      timestamp: Date.now(),
    })
  })

  observer.observe({ type: 'largest-contentful-paint', buffered: true })
}

export function measureFCP() {
  if (typeof window === 'undefined') return

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries() as PerformancePaintTiming[]) {
      if (entry.name === 'first-contentful-paint') {
        reportMetric({
          name: 'FCP',
          value: entry.startTime,
          rating: getRating('FCP', entry.startTime),
          timestamp: Date.now(),
        })
      }
    }
  })

  observer.observe({ type: 'paint', buffered: true })
}

export function measureTTFB() {
  if (typeof window === 'undefined') return

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries() as PerformanceNavigationTiming[]) {
      const ttfb = entry.responseStart - entry.requestStart
      
      reportMetric({
        name: 'TTFB',
        value: ttfb,
        rating: getRating('TTFB', ttfb),
        timestamp: Date.now(),
      })
    }
  })

  observer.observe({ type: 'navigation', buffered: true })
}

// Custom performance metrics
export function measureCustomMetric(name: string, startTime: number, endTime?: number) {
  const value = (endTime || performance.now()) - startTime
  
  console.log(`Custom Metric - ${name}:`, value, 'ms')
  
  // You could also report custom metrics to analytics
  return value
}

// React Query performance tracking
export function trackQueryPerformance(queryKey: string, startTime: number) {
  return {
    onSuccess: () => {
      measureCustomMetric(`Query Success: ${queryKey}`, startTime)
    },
    onError: () => {
      measureCustomMetric(`Query Error: ${queryKey}`, startTime)
    },
  }
}

// Component render performance tracking
export function useRenderPerformance(componentName: string) {
  if (typeof window === 'undefined') return

  const startTime = performance.now()
  
  // Track component mount time
  React.useEffect(() => {
    measureCustomMetric(`Component Mount: ${componentName}`, startTime)
  }, [componentName, startTime])
}

// Bundle size analysis helper
export function analyzeBundleSize() {
  if (typeof window === 'undefined') return

  // Get all loaded scripts
  const scripts = Array.from(document.querySelectorAll('script[src]'))
  let totalSize = 0

  scripts.forEach(async (script) => {
    try {
      const response = await fetch(script.src, { method: 'HEAD' })
      const size = parseInt(response.headers.get('content-length') || '0')
      totalSize += size
      
      console.log(`Script: ${script.src.split('/').pop()}, Size: ${(size / 1024).toFixed(2)}KB`)
    } catch (error) {
      console.warn('Could not fetch script size:', script.src)
    }
  })

  console.log(`Total bundle size: ${(totalSize / 1024).toFixed(2)}KB`)
}

// Memory usage tracking
export function trackMemoryUsage() {
  if (typeof window === 'undefined' || !('memory' in performance)) return

  const memory = (performance as any).memory
  
  console.log('Memory Usage:', {
    used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
    total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
    limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`,
  })
}

// Initialize all Web Vitals measurements
export function initializePerformanceMonitoring() {
  if (typeof window === 'undefined') return

  measureCLS()
  measureFID()
  measureLCP()
  measureFCP()
  measureTTFB()

  // Track memory usage periodically in development
  if (process.env.NODE_ENV === 'development') {
    setInterval(trackMemoryUsage, 30000) // Every 30 seconds
  }
}

// Get current performance metrics
export function getPerformanceMetrics(): WebVitalsMetrics {
  return { ...metrics }
}

// Performance budget checker
export function checkPerformanceBudget() {
  const currentMetrics = getPerformanceMetrics()
  const issues: string[] = []

  Object.entries(currentMetrics).forEach(([name, metric]) => {
    if (metric && metric.rating === 'poor') {
      issues.push(`${name}: ${metric.value} (${metric.rating})`)
    }
  })

  if (issues.length > 0) {
    console.warn('Performance Budget Issues:', issues)
  } else {
    console.log('Performance Budget: All metrics within acceptable range')
  }

  return issues
}

// React hook for performance monitoring
export function usePerformanceMonitoring() {
  React.useEffect(() => {
    initializePerformanceMonitoring()
    
    // Check performance budget after 10 seconds
    const timeout = setTimeout(() => {
      checkPerformanceBudget()
    }, 10000)

    return () => clearTimeout(timeout)
  }, [])

  return {
    getMetrics: getPerformanceMetrics,
    checkBudget: checkPerformanceBudget,
    trackCustom: measureCustomMetric,
  }
}

// Export for Next.js reportWebVitals
export function reportWebVitals(metric: any) {
  reportMetric({
    name: metric.name,
    value: metric.value,
    rating: getRating(metric.name as keyof typeof THRESHOLDS, metric.value),
    timestamp: Date.now(),
  })
}