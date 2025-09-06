'use client'

import { Fragment, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { clsx } from 'clsx'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closeOnBackdrop?: boolean
  closeOnEscape?: boolean
  className?: string
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnBackdrop = true,
  closeOnEscape = true,
  className,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  // Handle escape key
  useEffect(() => {
    if (!closeOnEscape) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose, closeOnEscape])

  // Handle focus management
  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previousActiveElement.current = document.activeElement as HTMLElement
      
      // Focus the modal
      setTimeout(() => {
        modalRef.current?.focus()
      }, 100)
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden'
    } else {
      // Restore focus to the previously focused element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus()
      }
      
      // Restore body scroll
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Handle focus trap
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key !== 'Tab') return

    const modal = modalRef.current
    if (!modal) return

    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

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

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (closeOnBackdrop && event.target === event.currentTarget) {
      onClose()
    }
  }

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  }

  if (!isOpen) return null

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div 
        className={clsx(
          'fixed inset-0 bg-black/50 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0'
        )}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div
        ref={modalRef}
        className={clsx(
          'relative w-full bg-white rounded-2xl shadow-strong transform transition-all duration-300',
          sizeClasses[size],
          isOpen ? 'opacity-100 scale-100 animate-scale-in' : 'opacity-0 scale-95',
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-6 pb-0">
            <h2 id="modal-title" className="text-xl font-semibold text-neutral-900">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors duration-200"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        {/* Content */}
        <div className={clsx('p-6', title && 'pt-4')}>
          {children}
        </div>
      </div>
    </div>
  )

  // Render modal in portal
  return typeof window !== 'undefined' 
    ? createPortal(modalContent, document.body)
    : null
}

// Modal subcomponents for better composition
export const ModalHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={clsx('mb-4', className)}>
    {children}
  </div>
)

export const ModalBody = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={clsx('mb-6', className)}>
    {children}
  </div>
)

export const ModalFooter = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={clsx('flex items-center justify-end gap-3 pt-4 border-t border-neutral-200', className)}>
    {children}
  </div>
)