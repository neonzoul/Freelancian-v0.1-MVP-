'use client'

import { useEffect, useRef, ReactNode } from 'react'
import { useFocusTrap, useFocusRestore } from '@/lib/accessibility'

interface FocusManagerProps {
  children: ReactNode
  enabled: boolean
  restoreFocus?: boolean
  autoFocus?: boolean
  className?: string
}

export function FocusManager({ 
  children, 
  enabled, 
  restoreFocus = true, 
  autoFocus = true,
  className 
}: FocusManagerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { saveFocus, restoreFocus: restore } = useFocusRestore()

  // Use focus trap when enabled
  useFocusTrap(enabled)

  useEffect(() => {
    if (enabled) {
      // Save current focus if restore is enabled
      if (restoreFocus) {
        saveFocus()
      }

      // Auto focus first focusable element
      if (autoFocus && containerRef.current) {
        const focusableElements = containerRef.current.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
        )
        
        const firstElement = focusableElements[0] as HTMLElement
        if (firstElement) {
          setTimeout(() => {
            firstElement.focus()
          }, 100)
        }
      }
    } else if (restoreFocus) {
      // Restore focus when disabled
      restore()
    }
  }, [enabled, autoFocus, restoreFocus, saveFocus, restore])

  return (
    <div 
      ref={containerRef}
      className={className}
      data-focus-manager={enabled}
    >
      {children}
    </div>
  )
}

interface FocusTrapProps {
  children: ReactNode
  active: boolean
  onEscape?: () => void
  className?: string
}

export function FocusTrap({ children, active, onEscape, className }: FocusTrapProps) {
  const trapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!active || !trapRef.current) return

    const trap = trapRef.current
    const focusableElements = trap.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
    )

    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onEscape) {
        onEscape()
        return
      }

      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    
    // Focus first element
    firstElement?.focus()

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [active, onEscape])

  return (
    <div 
      ref={trapRef}
      className={className}
      data-focus-trap={active}
    >
      {/* Focus trap sentinels */}
      {active && (
        <>
          <div 
            tabIndex={0} 
            className="focus-trap-start visually-hidden"
            onFocus={() => {
              const focusableElements = trapRef.current?.querySelectorAll(
                'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
              )
              const lastElement = focusableElements?.[focusableElements.length - 1] as HTMLElement
              lastElement?.focus()
            }}
          />
          {children}
          <div 
            tabIndex={0} 
            className="focus-trap-end visually-hidden"
            onFocus={() => {
              const focusableElements = trapRef.current?.querySelectorAll(
                'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
              )
              const firstElement = focusableElements?.[0] as HTMLElement
              firstElement?.focus()
            }}
          />
        </>
      )}
      {!active && children}
    </div>
  )
}

interface FocusGuardProps {
  onFocus: () => void
  className?: string
}

export function FocusGuard({ onFocus, className }: FocusGuardProps) {
  return (
    <div
      tabIndex={0}
      className={`focus-guard visually-hidden ${className || ''}`}
      onFocus={onFocus}
      aria-hidden="true"
    />
  )
}

interface AutoFocusProps {
  children: ReactNode
  delay?: number
  selector?: string
  enabled?: boolean
}

export function AutoFocus({ children, delay = 100, selector, enabled = true }: AutoFocusProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!enabled || !containerRef.current) return

    const timer = setTimeout(() => {
      if (!containerRef.current) return

      let elementToFocus: HTMLElement | null = null

      if (selector) {
        elementToFocus = containerRef.current.querySelector(selector)
      } else {
        // Find first focusable element
        const focusableElements = containerRef.current.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
        )
        elementToFocus = focusableElements[0] as HTMLElement
      }

      if (elementToFocus) {
        elementToFocus.focus()
      }
    }, delay)

    return () => clearTimeout(timer)
  }, [delay, selector, enabled])

  return (
    <div ref={containerRef}>
      {children}
    </div>
  )
}