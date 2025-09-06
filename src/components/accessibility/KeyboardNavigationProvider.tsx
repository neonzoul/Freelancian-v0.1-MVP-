'use client'

import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { useFocusIndicators, useSkipLinks } from '@/lib/accessibility'

interface KeyboardNavigationContextType {
  isKeyboardUser: boolean
  currentFocusedElement: HTMLElement | null
  focusHistory: HTMLElement[]
  navigateToElement: (element: HTMLElement) => void
  navigateToNext: () => void
  navigateToPrevious: () => void
  navigateToFirst: () => void
  navigateToLast: () => void
  announceNavigation: (message: string) => void
}

const KeyboardNavigationContext = createContext<KeyboardNavigationContextType | undefined>(undefined)

export function useKeyboardNavigation() {
  const context = useContext(KeyboardNavigationContext)
  if (context === undefined) {
    throw new Error('useKeyboardNavigation must be used within a KeyboardNavigationProvider')
  }
  return context
}

interface KeyboardNavigationProviderProps {
  children: React.ReactNode
}

export function KeyboardNavigationProvider({ children }: KeyboardNavigationProviderProps) {
  const [isKeyboardUser, setIsKeyboardUser] = useState(false)
  const [currentFocusedElement, setCurrentFocusedElement] = useState<HTMLElement | null>(null)
  const [focusHistory, setFocusHistory] = useState<HTMLElement[]>([])
  const lastInteractionRef = useRef<'keyboard' | 'mouse'>('mouse')

  // Use accessibility hooks
  useFocusIndicators()
  useSkipLinks()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Detect keyboard usage
      if (e.key === 'Tab' || e.key === 'Enter' || e.key === ' ' || e.key.startsWith('Arrow')) {
        setIsKeyboardUser(true)
        lastInteractionRef.current = 'keyboard'
        document.body.classList.add('keyboard-navigation')
      }

      // Handle global keyboard shortcuts
      if (e.altKey && e.key === 'k') {
        e.preventDefault()
        showKeyboardShortcuts()
      }

      // Handle escape key globally
      if (e.key === 'Escape') {
        handleGlobalEscape()
      }
    }

    const handleMouseDown = () => {
      setIsKeyboardUser(false)
      lastInteractionRef.current = 'mouse'
      document.body.classList.remove('keyboard-navigation')
    }

    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement
      if (target && target !== currentFocusedElement) {
        setCurrentFocusedElement(target)
        
        // Add to focus history (keep last 10)
        setFocusHistory(prev => {
          const newHistory = [target, ...prev.filter(el => el !== target)]
          return newHistory.slice(0, 10)
        })

        // Announce focus change for screen readers if keyboard user
        if (isKeyboardUser) {
          announceFocusChange(target)
        }
      }
    }

    const handleFocusOut = (e: FocusEvent) => {
      // Small delay to check if focus moved to another element
      setTimeout(() => {
        if (!document.activeElement || document.activeElement === document.body) {
          setCurrentFocusedElement(null)
        }
      }, 10)
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('focusin', handleFocusIn)
    document.addEventListener('focusout', handleFocusOut)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('focusin', handleFocusIn)
      document.removeEventListener('focusout', handleFocusOut)
    }
  }, [currentFocusedElement, isKeyboardUser])

  const getFocusableElements = (): HTMLElement[] => {
    const selector = [
      'button:not([disabled])',
      '[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"]):not([disabled])',
      '[role="button"]:not([disabled])',
      '[role="link"]:not([disabled])',
      '[role="menuitem"]:not([disabled])',
      '[role="tab"]:not([disabled])',
    ].join(', ')

    return Array.from(document.querySelectorAll(selector)) as HTMLElement[]
  }

  const navigateToElement = (element: HTMLElement) => {
    element.focus()
    element.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }

  const navigateToNext = () => {
    const focusableElements = getFocusableElements()
    const currentIndex = currentFocusedElement 
      ? focusableElements.indexOf(currentFocusedElement)
      : -1
    
    const nextIndex = currentIndex < focusableElements.length - 1 ? currentIndex + 1 : 0
    navigateToElement(focusableElements[nextIndex])
  }

  const navigateToPrevious = () => {
    const focusableElements = getFocusableElements()
    const currentIndex = currentFocusedElement 
      ? focusableElements.indexOf(currentFocusedElement)
      : -1
    
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : focusableElements.length - 1
    navigateToElement(focusableElements[prevIndex])
  }

  const navigateToFirst = () => {
    const focusableElements = getFocusableElements()
    if (focusableElements.length > 0) {
      navigateToElement(focusableElements[0])
    }
  }

  const navigateToLast = () => {
    const focusableElements = getFocusableElements()
    if (focusableElements.length > 0) {
      navigateToElement(focusableElements[focusableElements.length - 1])
    }
  }

  const announceNavigation = (message: string) => {
    const liveRegion = document.getElementById('live-region')
    if (liveRegion) {
      liveRegion.setAttribute('aria-live', 'polite')
      liveRegion.textContent = message
      
      setTimeout(() => {
        liveRegion.textContent = ''
      }, 1000)
    }
  }

  const announceFocusChange = (element: HTMLElement) => {
    const elementName = getElementDescription(element)
    if (elementName) {
      announceNavigation(`Focused on ${elementName}`)
    }
  }

  const getElementDescription = (element: HTMLElement): string => {
    // Get accessible name
    const ariaLabel = element.getAttribute('aria-label')
    if (ariaLabel) return ariaLabel

    const ariaLabelledBy = element.getAttribute('aria-labelledby')
    if (ariaLabelledBy) {
      const labelElement = document.getElementById(ariaLabelledBy)
      if (labelElement) return labelElement.textContent || ''
    }

    // For form controls, check for associated label
    if (['input', 'select', 'textarea'].includes(element.tagName.toLowerCase())) {
      const id = element.getAttribute('id')
      if (id) {
        const label = document.querySelector(`label[for="${id}"]`)
        if (label) return label.textContent || ''
      }
    }

    // Fall back to text content or placeholder
    const textContent = element.textContent?.trim()
    if (textContent) return textContent

    const placeholder = element.getAttribute('placeholder')
    if (placeholder) return placeholder

    // Describe by tag and role
    const role = element.getAttribute('role')
    const tagName = element.tagName.toLowerCase()
    return role || tagName
  }

  const showKeyboardShortcuts = () => {
    const shortcuts = [
      'Tab - Navigate to next element',
      'Shift + Tab - Navigate to previous element',
      'Enter/Space - Activate buttons and links',
      'Escape - Close modals and menus',
      'Alt + K - Show keyboard shortcuts',
      'Arrow keys - Navigate within components',
      'Home - Go to first element',
      'End - Go to last element',
    ]

    announceNavigation(`Keyboard shortcuts: ${shortcuts.join(', ')}`)
  }

  const handleGlobalEscape = () => {
    // Close any open modals, dropdowns, etc.
    const openModals = document.querySelectorAll('[role="dialog"][aria-modal="true"]')
    const openMenus = document.querySelectorAll('[role="menu"][aria-expanded="true"]')
    
    if (openModals.length > 0) {
      // Find close button in modal and click it
      const modal = openModals[openModals.length - 1] // Get topmost modal
      const closeButton = modal.querySelector('[aria-label*="close"], [aria-label*="Close"], .modal-close')
      if (closeButton) {
        (closeButton as HTMLElement).click()
      }
    } else if (openMenus.length > 0) {
      // Close menus
      openMenus.forEach(menu => {
        menu.setAttribute('aria-expanded', 'false')
      })
    }
  }

  const value: KeyboardNavigationContextType = {
    isKeyboardUser,
    currentFocusedElement,
    focusHistory,
    navigateToElement,
    navigateToNext,
    navigateToPrevious,
    navigateToFirst,
    navigateToLast,
    announceNavigation,
  }

  return (
    <KeyboardNavigationContext.Provider value={value}>
      {children}
      
      {/* Keyboard shortcuts help */}
      {isKeyboardUser && (
        <div 
          className="fixed bottom-4 right-4 bg-neutral-900 text-white text-xs px-3 py-2 rounded-lg shadow-strong z-50 opacity-75"
          role="status"
          aria-live="polite"
        >
          Press Alt + K for keyboard shortcuts
        </div>
      )}
    </KeyboardNavigationContext.Provider>
  )
}