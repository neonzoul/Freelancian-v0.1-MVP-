'use client'

import { useState, useEffect } from 'react'
import { 
  getViewportDimensions, 
  isMobileViewport, 
  isTabletViewport, 
  isDesktopViewport,
  getCurrentBreakpoint,
  type Breakpoint
} from '@/lib/mobile-utils'

interface ResponsiveState {
  width: number
  height: number
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  breakpoint: Breakpoint
}

export function useResponsive(): ResponsiveState {
  const [state, setState] = useState<ResponsiveState>(() => {
    if (typeof window === 'undefined') {
      return {
        width: 0,
        height: 0,
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        breakpoint: 'lg' as Breakpoint,
      }
    }
    
    const { width, height } = getViewportDimensions()
    return {
      width,
      height,
      isMobile: isMobileViewport(),
      isTablet: isTabletViewport(),
      isDesktop: isDesktopViewport(),
      breakpoint: getCurrentBreakpoint(),
    }
  })

  useEffect(() => {
    const handleResize = () => {
      const { width, height } = getViewportDimensions()
      setState({
        width,
        height,
        isMobile: isMobileViewport(),
        isTablet: isTabletViewport(),
        isDesktop: isDesktopViewport(),
        breakpoint: getCurrentBreakpoint(),
      })
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)

    // Initial call to set correct state
    handleResize()

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
    }
  }, [])

  return state
}

// Hook for checking specific breakpoints
export function useBreakpoint(breakpoint: Breakpoint): boolean {
  const { breakpoint: current } = useResponsive()
  
  const breakpointOrder: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl']
  const currentIndex = breakpointOrder.indexOf(current)
  const targetIndex = breakpointOrder.indexOf(breakpoint)
  
  return currentIndex >= targetIndex
}

// Hook for mobile-specific behavior
export function useMobile() {
  const { isMobile } = useResponsive()
  return isMobile
}

// Hook for tablet-specific behavior
export function useTablet() {
  const { isTablet } = useResponsive()
  return isTablet
}

// Hook for desktop-specific behavior
export function useDesktop() {
  const { isDesktop } = useResponsive()
  return isDesktop
}