'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useReducedMotion, useHighContrast, useFocusIndicators } from '@/lib/accessibility'
import { KeyboardNavigationProvider } from '@/components/accessibility/KeyboardNavigationProvider'

interface AccessibilityContextType {
  prefersReducedMotion: boolean
  prefersHighContrast: boolean
  isKeyboardUser: boolean
  announceMessage: (message: string, priority?: 'polite' | 'assertive') => void
  announceError: (message: string) => void
  announceSuccess: (message: string) => void
  announceNavigation: (message: string) => void
  focusManagement: {
    trapFocus: boolean
    setTrapFocus: (trap: boolean) => void
  }
  colorScheme: 'light' | 'dark' | 'auto'
  setColorScheme: (scheme: 'light' | 'dark' | 'auto') => void
  fontSize: 'small' | 'medium' | 'large' | 'extra-large'
  setFontSize: (size: 'small' | 'medium' | 'large' | 'extra-large') => void
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined)

export function useAccessibility() {
  const context = useContext(AccessibilityContext)
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider')
  }
  return context
}

interface AccessibilityProviderProps {
  children: React.ReactNode
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const prefersReducedMotion = useReducedMotion()
  const prefersHighContrast = useHighContrast()
  const [trapFocus, setTrapFocus] = useState(false)
  const [isKeyboardUser, setIsKeyboardUser] = useState(false)
  const [colorScheme, setColorScheme] = useState<'light' | 'dark' | 'auto'>('auto')
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large' | 'extra-large'>('medium')

  // Use focus indicators hook
  useFocusIndicators()

  // Create live region for announcements
  useEffect(() => {
    const liveRegion = document.createElement('div')
    liveRegion.id = 'live-region'
    liveRegion.setAttribute('aria-live', 'polite')
    liveRegion.setAttribute('aria-atomic', 'true')
    liveRegion.className = 'sr-only absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0'
    document.body.appendChild(liveRegion)

    // Create assertive live region for urgent announcements
    const assertiveRegion = document.createElement('div')
    assertiveRegion.id = 'live-region-assertive'
    assertiveRegion.setAttribute('aria-live', 'assertive')
    assertiveRegion.setAttribute('aria-atomic', 'true')
    assertiveRegion.className = 'sr-only absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0'
    document.body.appendChild(assertiveRegion)

    return () => {
      const existingRegion = document.getElementById('live-region')
      const existingAssertiveRegion = document.getElementById('live-region-assertive')
      if (existingRegion) {
        document.body.removeChild(existingRegion)
      }
      if (existingAssertiveRegion) {
        document.body.removeChild(existingAssertiveRegion)
      }
    }
  }, [])

  // Detect keyboard usage
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' || e.key === 'Enter' || e.key === ' ' || e.key.startsWith('Arrow')) {
        setIsKeyboardUser(true)
      }
    }

    const handleMouseDown = () => {
      setIsKeyboardUser(false)
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleMouseDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleMouseDown)
    }
  }, [])

  const announceMessage = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const regionId = priority === 'assertive' ? 'live-region-assertive' : 'live-region'
    const liveRegion = document.getElementById(regionId)
    if (liveRegion) {
      liveRegion.textContent = message
      
      // Clear after announcement
      setTimeout(() => {
        liveRegion.textContent = ''
      }, 1000)
    }
  }

  const announceError = (message: string) => {
    announceMessage(`Error: ${message}`, 'assertive')
  }

  const announceSuccess = (message: string) => {
    announceMessage(`Success: ${message}`, 'polite')
  }

  const announceNavigation = (message: string) => {
    announceMessage(message, 'polite')
  }

  // Apply accessibility classes to body
  useEffect(() => {
    const body = document.body
    
    // Reduced motion
    if (prefersReducedMotion) {
      body.classList.add('reduce-motion')
    } else {
      body.classList.remove('reduce-motion')
    }

    // High contrast
    if (prefersHighContrast) {
      body.classList.add('high-contrast')
    } else {
      body.classList.remove('high-contrast')
    }

    // Color scheme
    body.classList.remove('light-mode', 'dark-mode')
    if (colorScheme !== 'auto') {
      body.classList.add(`${colorScheme}-mode`)
    }

    // Font size
    body.classList.remove('font-small', 'font-medium', 'font-large', 'font-extra-large')
    body.classList.add(`font-${fontSize}`)

    // Keyboard user
    if (isKeyboardUser) {
      body.classList.add('keyboard-navigation')
    } else {
      body.classList.remove('keyboard-navigation')
    }
  }, [prefersReducedMotion, prefersHighContrast, colorScheme, fontSize, isKeyboardUser])

  // Load saved preferences
  useEffect(() => {
    const savedColorScheme = localStorage.getItem('accessibility-color-scheme') as 'light' | 'dark' | 'auto'
    const savedFontSize = localStorage.getItem('accessibility-font-size') as 'small' | 'medium' | 'large' | 'extra-large'

    if (savedColorScheme) {
      setColorScheme(savedColorScheme)
    }
    if (savedFontSize) {
      setFontSize(savedFontSize)
    }
  }, [])

  // Save preferences
  useEffect(() => {
    localStorage.setItem('accessibility-color-scheme', colorScheme)
  }, [colorScheme])

  useEffect(() => {
    localStorage.setItem('accessibility-font-size', fontSize)
  }, [fontSize])

  const value: AccessibilityContextType = {
    prefersReducedMotion,
    prefersHighContrast,
    isKeyboardUser,
    announceMessage,
    announceError,
    announceSuccess,
    announceNavigation,
    focusManagement: {
      trapFocus,
      setTrapFocus,
    },
    colorScheme,
    setColorScheme,
    fontSize,
    setFontSize,
  }

  return (
    <AccessibilityContext.Provider value={value}>
      <KeyboardNavigationProvider>
        {children}
      </KeyboardNavigationProvider>
    </AccessibilityContext.Provider>
  )
}