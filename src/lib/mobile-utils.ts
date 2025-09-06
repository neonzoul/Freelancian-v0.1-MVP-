/**
 * Mobile and touch interaction utilities
 */

// Check if device is mobile based on user agent
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
}

// Check if device supports touch
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false
  
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

// Get viewport dimensions
export function getViewportDimensions() {
  if (typeof window === 'undefined') {
    return { width: 0, height: 0 }
  }
  
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  }
}

// Check if viewport is mobile size
export function isMobileViewport(): boolean {
  const { width } = getViewportDimensions()
  return width < 640 // sm breakpoint
}

// Check if viewport is tablet size
export function isTabletViewport(): boolean {
  const { width } = getViewportDimensions()
  return width >= 640 && width < 1024 // sm to lg breakpoint
}

// Check if viewport is desktop size
export function isDesktopViewport(): boolean {
  const { width } = getViewportDimensions()
  return width >= 1024 // lg breakpoint and above
}

// Prevent zoom on input focus (iOS Safari)
export function preventZoomOnFocus(element: HTMLInputElement | HTMLTextAreaElement) {
  if (!isMobileDevice()) return
  
  const originalFontSize = element.style.fontSize
  
  element.addEventListener('focus', () => {
    element.style.fontSize = '16px'
  })
  
  element.addEventListener('blur', () => {
    element.style.fontSize = originalFontSize
  })
}

// Add touch-friendly class based on device
export function getTouchFriendlyClass(): string {
  if (typeof window === 'undefined') return ''
  
  return isTouchDevice() ? 'touch-device' : 'no-touch'
}

// Debounced resize handler for responsive components
export function useResponsiveHandler(
  callback: () => void,
  delay: number = 250
): () => void {
  let timeoutId: NodeJS.Timeout
  
  return () => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(callback, delay)
  }
}

// Safe area insets for devices with notches
export function getSafeAreaInsets() {
  if (typeof window === 'undefined') {
    return { top: 0, right: 0, bottom: 0, left: 0 }
  }
  
  const style = getComputedStyle(document.documentElement)
  
  return {
    top: parseInt(style.getPropertyValue('--safe-area-inset-top') || '0'),
    right: parseInt(style.getPropertyValue('--safe-area-inset-right') || '0'),
    bottom: parseInt(style.getPropertyValue('--safe-area-inset-bottom') || '0'),
    left: parseInt(style.getPropertyValue('--safe-area-inset-left') || '0'),
  }
}

// Optimize scroll performance on mobile
export function optimizeScrollPerformance(element: HTMLElement) {
  if (!isMobileDevice()) return
  
  ;(element.style as any).webkitOverflowScrolling = 'touch'
  ;(element.style as any).overflowScrolling = 'touch'
}

// Handle orientation change
export function handleOrientationChange(callback: (orientation: string) => void) {
  if (typeof window === 'undefined') return
  
  const handleChange = () => {
    const orientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
    callback(orientation)
  }
  
  window.addEventListener('orientationchange', handleChange)
  window.addEventListener('resize', handleChange)
  
  // Initial call
  handleChange()
  
  // Return cleanup function
  return () => {
    window.removeEventListener('orientationchange', handleChange)
    window.removeEventListener('resize', handleChange)
  }
}

// Responsive breakpoint utilities
export const breakpoints = {
  xs: 475,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

export type Breakpoint = keyof typeof breakpoints

export function isBreakpoint(breakpoint: Breakpoint): boolean {
  const { width } = getViewportDimensions()
  return width >= breakpoints[breakpoint]
}

export function getCurrentBreakpoint(): Breakpoint {
  const { width } = getViewportDimensions()
  
  if (width >= breakpoints['2xl']) return '2xl'
  if (width >= breakpoints.xl) return 'xl'
  if (width >= breakpoints.lg) return 'lg'
  if (width >= breakpoints.md) return 'md'
  if (width >= breakpoints.sm) return 'sm'
  return 'xs'
}