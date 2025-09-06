'use client'

import { motion } from 'framer-motion'
import { MobileNavigation } from './MobileNavigation'
import { clsx } from 'clsx'

interface PageWrapperProps {
  children: React.ReactNode
  className?: string
  showMobileNav?: boolean
  title?: string
  subtitle?: string
  actions?: React.ReactNode
}

export function PageWrapper({ 
  children, 
  className,
  showMobileNav = true,
  title,
  subtitle,
  actions
}: PageWrapperProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className={clsx(
        'container mx-auto mobile-padding py-4 sm:py-8',
        showMobileNav && 'pb-20 sm:pb-8', // Add bottom padding for mobile nav
        className
      )}>
        {/* Page Header */}
        {(title || subtitle || actions) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="mb-6 sm:mb-8"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {(title || subtitle) && (
                <div>
                  {title && (
                    <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">
                      {title}
                    </h1>
                  )}
                  {subtitle && (
                    <p className="text-sm sm:text-base text-neutral-600">
                      {subtitle}
                    </p>
                  )}
                </div>
              )}
              
              {actions && (
                <div className="flex flex-col xs:flex-row gap-2 xs:gap-3">
                  {actions}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Page Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {children}
        </motion.div>
      </div>

      {/* Mobile Navigation */}
      {showMobileNav && <MobileNavigation />}
    </div>
  )
}