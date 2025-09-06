'use client'

import { Fragment, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'
import { modalBackdrop, modalContent, accessibleScaleIn } from '@/lib/animations'
import { useAccessibility } from '@/components/providers/AccessibilityProvider'
import { useFocusTrap, useFocusRestore } from '@/lib/accessibility'

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
  const { prefersReducedMotion, announceMessage } = useAccessibility()
  const { saveFocus, restoreFocus } = useFocusRestore()
  
  // Use focus trap when modal is open
  useFocusTrap(isOpen)

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

  // Handle focus management and announcements
  useEffect(() => {
    if (isOpen) {
      // Save current focus
      saveFocus()
      
      // Focus the modal
      setTimeout(() => {
        modalRef.current?.focus()
      }, 100)
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden'
      
      // Announce modal opening to screen readers
      if (title) {
        announceMessage(`${title} dialog opened`, 'assertive')
      } else {
        announceMessage('Dialog opened', 'assertive')
      }
    } else {
      // Restore focus
      restoreFocus()
      
      // Restore body scroll
      document.body.style.overflow = 'unset'
      
      // Announce modal closing
      announceMessage('Dialog closed', 'polite')
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, title, saveFocus, restoreFocus, announceMessage])

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

  const modalContentJSX = (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={handleBackdropClick}
        >
          {/* Backdrop */}
          <motion.div 
            variants={modalBackdrop}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed inset-0 bg-black/50"
            aria-hidden="true"
          />
          
          {/* Modal */}
          <motion.div
            variants={accessibleScaleIn(prefersReducedMotion)}
            initial="initial"
            animate="animate"
            exit="exit"
            ref={modalRef}
            className={clsx(
              'relative w-full bg-white rounded-2xl shadow-strong',
              sizeClasses[size],
              className
            )}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
            aria-describedby="modal-content"
            tabIndex={-1}
            onKeyDown={handleKeyDown}
          >
            {/* Header */}
            {title && (
              <div className="flex items-center justify-between p-6 pb-0">
                <motion.h2 
                  id="modal-title" 
                  className="text-xl font-semibold text-neutral-900"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {title}
                </motion.h2>
                <motion.button
                  onClick={onClose}
                  className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors duration-200"
                  aria-label="Close modal"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>
            )}
            
            {/* Content */}
            <motion.div 
              id="modal-content"
              className={clsx('p-6', title && 'pt-4')}
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
              animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
              transition={prefersReducedMotion ? {} : { delay: 0.15 }}
            >
              {children}
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )

  // Render modal in portal
  return typeof window !== 'undefined' 
    ? createPortal(modalContentJSX, document.body)
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