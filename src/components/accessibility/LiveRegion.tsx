'use client'

import { useEffect, useRef, useState } from 'react'

interface LiveRegionProps {
  message?: string
  priority?: 'polite' | 'assertive'
  clearDelay?: number
  className?: string
}

export function LiveRegion({ 
  message, 
  priority = 'polite', 
  clearDelay = 1000,
  className = 'sr-only'
}: LiveRegionProps) {
  const [currentMessage, setCurrentMessage] = useState('')
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (message) {
      setCurrentMessage(message)
      
      // Clear message after delay
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      
      timeoutRef.current = setTimeout(() => {
        setCurrentMessage('')
      }, clearDelay)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [message, clearDelay])

  return (
    <div
      aria-live={priority}
      aria-atomic="true"
      className={className}
      role="status"
    >
      {currentMessage}
    </div>
  )
}

interface AnnouncerProps {
  children: (announce: (message: string, priority?: 'polite' | 'assertive') => void) => React.ReactNode
}

export function Announcer({ children }: AnnouncerProps) {
  const [announcement, setAnnouncement] = useState<{
    message: string
    priority: 'polite' | 'assertive'
    id: number
  } | null>(null)

  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    setAnnouncement({
      message,
      priority,
      id: Date.now()
    })
  }

  return (
    <>
      {children(announce)}
      {announcement && (
        <LiveRegion
          key={announcement.id}
          message={announcement.message}
          priority={announcement.priority}
        />
      )}
    </>
  )
}

interface StatusAnnouncerProps {
  status: 'loading' | 'success' | 'error' | 'idle'
  messages?: {
    loading?: string
    success?: string
    error?: string
  }
  priority?: 'polite' | 'assertive'
}

export function StatusAnnouncer({ 
  status, 
  messages = {
    loading: 'Loading...',
    success: 'Operation completed successfully',
    error: 'An error occurred'
  },
  priority = 'polite'
}: StatusAnnouncerProps) {
  const [currentStatus, setCurrentStatus] = useState<string>('')
  const prevStatusRef = useRef<string>('')

  useEffect(() => {
    if (status !== prevStatusRef.current) {
      prevStatusRef.current = status
      
      switch (status) {
        case 'loading':
          setCurrentStatus(messages.loading || '')
          break
        case 'success':
          setCurrentStatus(messages.success || '')
          break
        case 'error':
          setCurrentStatus(messages.error || '')
          break
        default:
          setCurrentStatus('')
      }
    }
  }, [status, messages])

  return (
    <LiveRegion
      message={currentStatus}
      priority={priority}
    />
  )
}

interface FormAnnouncerProps {
  errors?: Record<string, string>
  success?: string
  priority?: 'polite' | 'assertive'
}

export function FormAnnouncer({ 
  errors, 
  success, 
  priority = 'assertive' 
}: FormAnnouncerProps) {
  const [announcement, setAnnouncement] = useState('')
  const prevErrorsRef = useRef<Record<string, string>>({})
  const prevSuccessRef = useRef<string>('')

  useEffect(() => {
    if (success && success !== prevSuccessRef.current) {
      prevSuccessRef.current = success
      setAnnouncement(success)
      return
    }

    if (errors && Object.keys(errors).length > 0) {
      const errorMessages = Object.values(errors)
      const newErrorMessage = `Form has ${errorMessages.length} error${errorMessages.length > 1 ? 's' : ''}: ${errorMessages.join(', ')}`
      
      // Only announce if errors have changed
      const errorString = JSON.stringify(errors)
      const prevErrorString = JSON.stringify(prevErrorsRef.current)
      
      if (errorString !== prevErrorString) {
        prevErrorsRef.current = errors
        setAnnouncement(newErrorMessage)
      }
    } else if (Object.keys(prevErrorsRef.current).length > 0) {
      // Errors were cleared
      prevErrorsRef.current = {}
      setAnnouncement('Form errors have been resolved')
    }
  }, [errors, success])

  return (
    <LiveRegion
      message={announcement}
      priority={priority}
    />
  )
}

interface NavigationAnnouncerProps {
  currentPage?: string
  totalPages?: number
  currentItem?: number
  totalItems?: number
  priority?: 'polite' | 'assertive'
}

export function NavigationAnnouncer({ 
  currentPage, 
  totalPages, 
  currentItem, 
  totalItems,
  priority = 'polite'
}: NavigationAnnouncerProps) {
  const [announcement, setAnnouncement] = useState('')
  const prevStateRef = useRef<string>('')

  useEffect(() => {
    let newAnnouncement = ''

    if (currentPage && totalPages) {
      newAnnouncement = `Page ${currentPage} of ${totalPages}`
    } else if (currentItem && totalItems) {
      newAnnouncement = `Item ${currentItem} of ${totalItems}`
    }

    if (newAnnouncement && newAnnouncement !== prevStateRef.current) {
      prevStateRef.current = newAnnouncement
      setAnnouncement(newAnnouncement)
    }
  }, [currentPage, totalPages, currentItem, totalItems])

  return (
    <LiveRegion
      message={announcement}
      priority={priority}
    />
  )
}

// Global live region hook
export function useGlobalAnnouncer() {
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

  const announceError = (message: string) => {
    announce(`Error: ${message}`, 'assertive')
  }

  const announceSuccess = (message: string) => {
    announce(`Success: ${message}`, 'polite')
  }

  const announceNavigation = (message: string) => {
    announce(message, 'polite')
  }

  const announceStatus = (status: string) => {
    announce(`Status: ${status}`, 'polite')
  }

  return {
    announce,
    announceError,
    announceSuccess,
    announceNavigation,
    announceStatus,
  }
}