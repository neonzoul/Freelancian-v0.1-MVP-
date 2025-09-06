'use client'

import { Modal, ModalBody, ModalFooter } from './Modal'
import { Button } from './Button'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { clsx } from 'clsx'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  confirmVariant?: 'primary' | 'danger'
  isLoading?: boolean
  icon?: React.ReactNode
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
  isLoading = false,
  icon,
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm()
  }

  const defaultIcon = confirmVariant === 'danger' ? (
    <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-error-100 rounded-full">
      <ExclamationTriangleIcon className="w-6 h-6 text-error-600" />
    </div>
  ) : null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      closeOnBackdrop={!isLoading}
      closeOnEscape={!isLoading}
    >
      <div className="text-center">
        {/* Icon */}
        {icon || defaultIcon}

        {/* Title */}
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">
          {title}
        </h3>

        {/* Message */}
        <ModalBody>
          <p className="text-neutral-600">
            {message}
          </p>
        </ModalBody>

        {/* Actions */}
        <ModalFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={confirmVariant === 'danger' ? 'primary' : 'primary'}
            onClick={handleConfirm}
            loading={isLoading}
            className={clsx(
              confirmVariant === 'danger' && 
              'bg-error-600 hover:bg-error-700 focus:ring-error-500'
            )}
          >
            {confirmText}
          </Button>
        </ModalFooter>
      </div>
    </Modal>
  )
}