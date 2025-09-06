'use client'

import { Modal, ModalBody, ModalFooter } from './Modal'
import { Button } from './Button'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
  loading?: boolean
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm()
    if (!loading) {
      onClose()
    }
  }

  const getIcon = () => {
    const iconClass = "w-12 h-12 mx-auto mb-4"
    
    switch (variant) {
      case 'danger':
        return (
          <div className="bg-error-100 rounded-full p-3 w-fit mx-auto mb-4">
            <svg className="w-6 h-6 text-error-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        )
      case 'warning':
        return (
          <div className="bg-secondary-100 rounded-full p-3 w-fit mx-auto mb-4">
            <svg className="w-6 h-6 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        )
      case 'info':
        return (
          <div className="bg-primary-100 rounded-full p-3 w-fit mx-auto mb-4">
            <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )
    }
  }

  const getConfirmButtonVariant = () => {
    switch (variant) {
      case 'danger':
        return 'bg-error-600 hover:bg-error-700 text-white focus:ring-error-500'
      case 'warning':
        return 'bg-secondary-600 hover:bg-secondary-700 text-white focus:ring-secondary-500'
      case 'info':
        return 'primary'
      default:
        return 'primary'
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      closeOnBackdrop={!loading}
      closeOnEscape={!loading}
    >
      <div className="text-center">
        {getIcon()}
        
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">
          {title}
        </h3>
        
        <ModalBody>
          <p className="text-neutral-600 text-sm leading-relaxed">
            {message}
          </p>
        </ModalBody>
        
        <ModalFooter className="justify-center gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="min-w-[80px]"
          >
            {cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            loading={loading}
            disabled={loading}
            className={`min-w-[80px] ${variant === 'danger' ? 'bg-error-600 hover:bg-error-700 text-white focus:ring-error-500' : variant === 'warning' ? 'bg-secondary-600 hover:bg-secondary-700 text-white focus:ring-secondary-500' : ''}`}
          >
            {confirmText}
          </Button>
        </ModalFooter>
      </div>
    </Modal>
  )
}

// Hook for easier usage
export function useConfirmDialog() {
  const [dialog, setDialog] = useState<{
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
    variant?: 'danger' | 'warning' | 'info'
    confirmText?: string
    cancelText?: string
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  })

  const confirm = (options: {
    title: string
    message: string
    onConfirm: () => void
    variant?: 'danger' | 'warning' | 'info'
    confirmText?: string
    cancelText?: string
  }) => {
    setDialog({
      isOpen: true,
      ...options,
    })
  }

  const close = () => {
    setDialog(prev => ({ ...prev, isOpen: false }))
  }

  const ConfirmDialogComponent = () => (
    <ConfirmDialog
      isOpen={dialog.isOpen}
      onClose={close}
      onConfirm={dialog.onConfirm}
      title={dialog.title}
      message={dialog.message}
      variant={dialog.variant}
      confirmText={dialog.confirmText}
      cancelText={dialog.cancelText}
    />
  )

  return {
    confirm,
    close,
    ConfirmDialog: ConfirmDialogComponent,
  }
}

import { useState } from 'react'