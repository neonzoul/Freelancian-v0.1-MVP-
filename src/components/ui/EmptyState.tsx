'use client'

import { Button } from './Button'
import Link from 'next/link'
import { clsx } from 'clsx'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick?: () => void
    href?: string
    variant?: 'primary' | 'secondary' | 'outline'
  }
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={clsx('text-center py-12', className)}>
      {/* Icon */}
      {icon && (
        <div className="flex justify-center mb-4">
          {icon}
        </div>
      )}

      {/* Title */}
      <h3 className="text-lg font-semibold text-neutral-900 mb-2">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-neutral-600 mb-6 max-w-md mx-auto">
          {description}
        </p>
      )}

      {/* Action */}
      {action && (
        <div className="flex justify-center">
          {action.href ? (
            <Link href={action.href as any}>
              <Button variant={action.variant || 'primary'}>
                {action.label}
              </Button>
            </Link>
          ) : (
            <Button
              variant={action.variant || 'primary'}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}