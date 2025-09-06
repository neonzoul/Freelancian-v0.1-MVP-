'use client'

import { useEffect, useState } from 'react'

/**
 * Hook to detect user's reduced motion preference
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return prefersReducedMotion
}

/**
 * Hook to detect user's high contrast preference
 */
export function useHighContrast(): boolean {
  const [prefersHighContrast, setPrefersHighContrast] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)')
    setPrefersHighContrast(mediaQuery.matches)

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersHighContrast(event.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return prefersHighContrast
}

/**
 * Hook for managing focus trap within a container
 */
export function useFocusTrap(isActive: boolean) {
  useEffect(() => {
    if (!isActive) return

    const focusableElements = document.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
    )

    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus()
          event.preventDefault()
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus()
          event.preventDefault()
        }
      }
    }

    document.addEventListener('keydown', handleTabKey)
    return () => document.removeEventListener('keydown', handleTabKey)
  }, [isActive])
}

/**
 * Hook for managing focus restoration
 */
export function useFocusRestore() {
  const [previousActiveElement, setPreviousActiveElement] = useState<HTMLElement | null>(null)

  const saveFocus = () => {
    setPreviousActiveElement(document.activeElement as HTMLElement)
  }

  const restoreFocus = () => {
    if (previousActiveElement && document.contains(previousActiveElement)) {
      previousActiveElement.focus()
    }
  }

  return { saveFocus, restoreFocus }
}

/**
 * Hook for keyboard navigation
 */
export function useKeyboardNavigation(
  onEnter?: () => void,
  onEscape?: () => void,
  onArrowUp?: () => void,
  onArrowDown?: () => void,
  onArrowLeft?: () => void,
  onArrowRight?: () => void
) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Enter':
          onEnter?.()
          break
        case 'Escape':
          onEscape?.()
          break
        case 'ArrowUp':
          event.preventDefault()
          onArrowUp?.()
          break
        case 'ArrowDown':
          event.preventDefault()
          onArrowDown?.()
          break
        case 'ArrowLeft':
          onArrowLeft?.()
          break
        case 'ArrowRight':
          onArrowRight?.()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onEnter, onEscape, onArrowUp, onArrowDown, onArrowLeft, onArrowRight])
}

/**
 * Generate unique IDs for accessibility attributes
 */
export function useId(prefix: string = 'id'): string {
  const [id] = useState(() => `${prefix}-${Math.random().toString(36).substr(2, 9)}`)
  return id
}

/**
 * Announce messages to screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div')
  announcement.setAttribute('aria-live', priority)
  announcement.setAttribute('aria-atomic', 'true')
  announcement.setAttribute('class', 'sr-only')
  announcement.textContent = message

  document.body.appendChild(announcement)

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

/**
 * Check if an element is visible to screen readers
 */
export function isVisibleToScreenReader(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element)
  return !(
    style.display === 'none' ||
    style.visibility === 'hidden' ||
    style.opacity === '0' ||
    element.getAttribute('aria-hidden') === 'true' ||
    element.hasAttribute('hidden')
  )
}

/**
 * Get accessible name for an element
 */
export function getAccessibleName(element: HTMLElement): string {
  // Check aria-label first
  const ariaLabel = element.getAttribute('aria-label')
  if (ariaLabel) return ariaLabel

  // Check aria-labelledby
  const ariaLabelledBy = element.getAttribute('aria-labelledby')
  if (ariaLabelledBy) {
    const labelElement = document.getElementById(ariaLabelledBy)
    if (labelElement) return labelElement.textContent || ''
  }

  // Check associated label
  if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT') {
    const id = element.getAttribute('id')
    if (id) {
      const label = document.querySelector(`label[for="${id}"]`)
      if (label) return label.textContent || ''
    }
  }

  // Fall back to text content
  return element.textContent || ''
}

/**
 * Validate color contrast ratio
 */
export function getContrastRatio(foreground: string, background: string): number {
  // Convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }

  // Calculate relative luminance
  const getLuminance = (r: number, g: number, b: number) => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }

  const fg = hexToRgb(foreground)
  const bg = hexToRgb(background)

  if (!fg || !bg) return 0

  const fgLuminance = getLuminance(fg.r, fg.g, fg.b)
  const bgLuminance = getLuminance(bg.r, bg.g, bg.b)

  const lighter = Math.max(fgLuminance, bgLuminance)
  const darker = Math.min(fgLuminance, bgLuminance)

  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Check if contrast ratio meets WCAG standards
 */
export function meetsWCAGContrast(
  foreground: string, 
  background: string, 
  level: 'AA' | 'AAA' = 'AA',
  size: 'normal' | 'large' = 'normal'
): boolean {
  const ratio = getContrastRatio(foreground, background)
  
  if (level === 'AAA') {
    return size === 'large' ? ratio >= 4.5 : ratio >= 7
  } else {
    return size === 'large' ? ratio >= 3 : ratio >= 4.5
  }
}

/**
 * Screen reader only text utility
 */
export const srOnly = 'absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0'

/**
 * Hook for managing skip links
 */
export function useSkipLinks() {
  useEffect(() => {
    const skipLinks = document.querySelectorAll('.skip-link')
    
    skipLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault()
        const target = document.querySelector((e.target as HTMLAnchorElement).getAttribute('href') || '')
        if (target) {
          (target as HTMLElement).focus()
          target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      })
    })
  }, [])
}

/**
 * Hook for managing live regions
 */
export function useLiveRegion() {
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const liveRegion = document.getElementById('live-region')
    if (liveRegion) {
      liveRegion.setAttribute('aria-live', priority)
      liveRegion.textContent = message
      
      // Clear after announcement
      setTimeout(() => {
        liveRegion.textContent = ''
      }, 1000)
    }
  }

  return { announce }
}

/**
 * Hook for managing focus indicators
 */
export function useFocusIndicators() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation')
      }
    }

    const handleMouseDown = () => {
      document.body.classList.remove('keyboard-navigation')
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleMouseDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleMouseDown)
    }
  }, [])
}

/**
 * Hook for managing aria-expanded state
 */
export function useAriaExpanded(initialState: boolean = false) {
  const [isExpanded, setIsExpanded] = useState(initialState)

  const toggle = () => setIsExpanded(!isExpanded)
  const expand = () => setIsExpanded(true)
  const collapse = () => setIsExpanded(false)

  return {
    isExpanded,
    'aria-expanded': isExpanded,
    toggle,
    expand,
    collapse,
  }
}

/**
 * Hook for managing aria-pressed state (toggle buttons)
 */
export function useAriaPressed(initialState: boolean = false) {
  const [isPressed, setIsPressed] = useState(initialState)

  const toggle = () => setIsPressed(!isPressed)
  const press = () => setIsPressed(true)
  const release = () => setIsPressed(false)

  return {
    isPressed,
    'aria-pressed': isPressed,
    toggle,
    press,
    release,
  }
}

/**
 * Hook for managing roving tabindex (for component groups)
 */
export function useRovingTabIndex(items: HTMLElement[], activeIndex: number = 0) {
  useEffect(() => {
    items.forEach((item, index) => {
      item.setAttribute('tabindex', index === activeIndex ? '0' : '-1')
    })
  }, [items, activeIndex])

  const handleKeyDown = (e: KeyboardEvent, currentIndex: number, onIndexChange: (index: number) => void) => {
    let newIndex = currentIndex

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault()
        newIndex = (currentIndex + 1) % items.length
        break
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault()
        newIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1
        break
      case 'Home':
        e.preventDefault()
        newIndex = 0
        break
      case 'End':
        e.preventDefault()
        newIndex = items.length - 1
        break
      default:
        return
    }

    onIndexChange(newIndex)
    items[newIndex]?.focus()
  }

  return { handleKeyDown }
}

/**
 * Validate ARIA attributes
 */
export function validateAriaAttributes(element: HTMLElement): string[] {
  const errors: string[] = []

  // Check for invalid ARIA references
  const labelledBy = element.getAttribute('aria-labelledby')
  const describedBy = element.getAttribute('aria-describedby')

  if (labelledBy) {
    const ids = labelledBy.split(' ')
    ids.forEach(id => {
      if (!document.getElementById(id)) {
        errors.push(`aria-labelledby references non-existent element: ${id}`)
      }
    })
  }

  if (describedBy) {
    const ids = describedBy.split(' ')
    ids.forEach(id => {
      if (!document.getElementById(id)) {
        errors.push(`aria-describedby references non-existent element: ${id}`)
      }
    })
  }

  // Check for required labels
  const role = element.getAttribute('role')
  const tagName = element.tagName.toLowerCase()
  
  if (['button', 'link', 'menuitem', 'tab'].includes(role || tagName)) {
    const hasLabel = getAccessibleName(element)
    if (!hasLabel) {
      errors.push(`${role || tagName} element missing accessible name`)
    }
  }

  return errors
}

/**
 * Check if element is keyboard accessible
 */
export function isKeyboardAccessible(element: HTMLElement): boolean {
  const tabIndex = element.getAttribute('tabindex')
  const isInteractive = ['button', 'a', 'input', 'select', 'textarea'].includes(element.tagName.toLowerCase())
  const hasRole = ['button', 'link', 'menuitem', 'tab', 'checkbox', 'radio'].includes(element.getAttribute('role') || '')
  
  return (
    (isInteractive || hasRole) &&
    tabIndex !== '-1' &&
    !element.hasAttribute('disabled') &&
    !element.getAttribute('aria-disabled')
  )
}

/**
 * Get all focusable elements within a container
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
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

  return Array.from(container.querySelectorAll(selector)) as HTMLElement[]
}

/**
 * Create accessible description for complex UI elements
 */
export function createAccessibleDescription(element: HTMLElement, description: string): string {
  const descriptionId = `${element.id || 'element'}-description-${Math.random().toString(36).substr(2, 9)}`
  
  // Create description element
  const descriptionElement = document.createElement('div')
  descriptionElement.id = descriptionId
  descriptionElement.className = 'sr-only'
  descriptionElement.textContent = description
  
  // Append to body
  document.body.appendChild(descriptionElement)
  
  // Set aria-describedby
  const existingDescribedBy = element.getAttribute('aria-describedby')
  element.setAttribute(
    'aria-describedby',
    existingDescribedBy ? `${existingDescribedBy} ${descriptionId}` : descriptionId
  )
  
  return descriptionId
}

/**
 * Remove accessible description
 */
export function removeAccessibleDescription(element: HTMLElement, descriptionId: string) {
  const descriptionElement = document.getElementById(descriptionId)
  if (descriptionElement) {
    document.body.removeChild(descriptionElement)
  }
  
  const describedBy = element.getAttribute('aria-describedby')
  if (describedBy) {
    const newDescribedBy = describedBy
      .split(' ')
      .filter(id => id !== descriptionId)
      .join(' ')
    
    if (newDescribedBy) {
      element.setAttribute('aria-describedby', newDescribedBy)
    } else {
      element.removeAttribute('aria-describedby')
    }
  }
}