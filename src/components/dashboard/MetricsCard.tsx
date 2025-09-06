'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/Card'
import { useAnimatedCurrency } from '@/lib/hooks/use-animated-counter'
import { useAccessibility } from '@/components/providers/AccessibilityProvider'
import { clsx } from 'clsx'

interface MetricsCardProps {
  title: string
  value: number
  icon: React.ReactNode
  variant: 'income' | 'expense' | 'net'
  isLoading?: boolean
  className?: string
}



export function MetricsCard({ 
  title, 
  value, 
  icon, 
  variant, 
  isLoading = false,
  className 
}: MetricsCardProps) {
  const { prefersReducedMotion } = useAccessibility()
  const { formattedValue, isAnimating } = useAnimatedCurrency(value, {
    duration: prefersReducedMotion ? 0 : 1200,
    delay: prefersReducedMotion ? 0 : 200
  })
  
  const variantStyles = {
    income: {
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      valueColor: 'text-green-600',
      accentColor: 'border-green-200',
    },
    expense: {
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      valueColor: 'text-red-600',
      accentColor: 'border-red-200',
    },
    net: {
      iconBg: value >= 0 ? 'bg-blue-100' : 'bg-orange-100',
      iconColor: value >= 0 ? 'text-blue-600' : 'text-orange-600',
      valueColor: value >= 0 ? 'text-blue-600' : 'text-orange-600',
      accentColor: value >= 0 ? 'border-blue-200' : 'border-orange-200',
    },
  }
  
  const styles = variantStyles[variant]
  
  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
      transition={prefersReducedMotion ? {} : { duration: 0.5, ease: 'easeOut' }}
      className={className}
    >
      <Card 
        hover={!prefersReducedMotion} 
        variant="elevated" 
        className={clsx(
          'relative overflow-hidden border-l-4 transition-all duration-300',
          styles.accentColor
        )}
        aria-label={`${title}: ${formattedValue}`}
        role="region"
      >
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs sm:text-sm font-medium text-neutral-600 mb-1" id={`metric-${variant}-title`}>
                {title}
              </p>
              
              {isLoading ? (
                <motion.div 
                  className="h-8 bg-neutral-200 rounded mb-2"
                  animate={prefersReducedMotion ? {} : {
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={prefersReducedMotion ? {} : {
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  aria-label="Loading metric value"
                />
              ) : (
                <motion.div
                  initial={prefersReducedMotion ? {} : { scale: 0.8, opacity: 0 }}
                  animate={prefersReducedMotion ? {} : { scale: 1, opacity: 1 }}
                  transition={prefersReducedMotion ? {} : { delay: 0.2, duration: 0.4, type: 'spring' }}
                  className={clsx(
                    'text-xl sm:text-2xl font-bold mb-2',
                    styles.valueColor
                  )}
                  aria-labelledby={`metric-${variant}-title`}
                  aria-live="polite"
                >
                  {formattedValue}
                </motion.div>
              )}
              
              <div className="flex items-center text-xs text-neutral-500">
                <span>Current month</span>
              </div>
            </div>
            
            <motion.div
              initial={prefersReducedMotion ? {} : { scale: 0, rotate: -180 }}
              animate={prefersReducedMotion ? {} : { scale: 1, rotate: 0 }}
              transition={prefersReducedMotion ? {} : { delay: 0.3, duration: 0.5, type: 'spring' }}
              className={clsx(
                'w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center',
                styles.iconBg
              )}
              aria-hidden="true"
            >
              <div className={clsx('w-5 h-5 sm:w-6 sm:h-6', styles.iconColor)}>
                {icon}
              </div>
            </motion.div>
          </div>
        </CardContent>
        
        {/* Subtle background pattern */}
        <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
          <div className={clsx(
            'w-full h-full rounded-full transform translate-x-16 -translate-y-16',
            styles.iconBg
          )} />
        </div>
      </Card>
    </motion.div>
  )
}