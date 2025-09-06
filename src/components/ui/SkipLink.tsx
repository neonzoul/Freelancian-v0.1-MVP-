'use client'

import { forwardRef } from 'react'
import { clsx } from 'clsx'

interface SkipLinkProps {
  href: string
  children: React.ReactNode
  className?: string
}

export const SkipLink = forwardRef<HTMLAnchorElement, SkipLinkProps>(
  ({ href, children, className, ...props }, ref) => {
    return (
      <a
        ref={ref}
        href={href}
        className={clsx(
          'skip-link',
          'absolute -top-10 left-4 z-50 bg-primary-600 text-white px-4 py-2 rounded-md',
          'focus:top-4 transition-all duration-200',
          'font-medium text-sm',
          'focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600',
          className
        )}
        {...props}
      >
        {children}
      </a>
    )
  }
)

SkipLink.displayName = 'SkipLink'