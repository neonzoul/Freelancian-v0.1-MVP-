'use client'

import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import { spinAnimation, pulseAnimation } from '@/lib/animations'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  color?: 'primary' | 'neutral' | 'white'
  variant?: 'spin' | 'pulse' | 'dots'
}

export function LoadingSpinner({ 
  size = 'md', 
  className,
  color = 'primary',
  variant = 'spin'
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  }

  const colorClasses = {
    primary: 'text-primary-600',
    neutral: 'text-neutral-600',
    white: 'text-white',
  }

  if (variant === 'dots') {
    return (
      <div className={clsx('flex space-x-1', className)} role="status" aria-label="Loading">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={clsx(
              'rounded-full',
              {
                'w-1 h-1': size === 'sm',
                'w-1.5 h-1.5': size === 'md',
                'w-2 h-2': size === 'lg',
                'w-3 h-3': size === 'xl',
              },
              {
                'bg-primary-600': color === 'primary',
                'bg-neutral-600': color === 'neutral',
                'bg-white': color === 'white',
              }
            )}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.1,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    )
  }

  if (variant === 'pulse') {
    return (
      <motion.div
        variants={pulseAnimation}
        initial="initial"
        animate="animate"
        className={clsx(
          'rounded-full border-2',
          sizeClasses[size],
          {
            'border-primary-600': color === 'primary',
            'border-neutral-600': color === 'neutral',
            'border-white': color === 'white',
          },
          className
        )}
        role="status"
        aria-label="Loading"
      />
    )
  }

  return (
    <motion.div
      variants={spinAnimation}
      animate="animate"
      className={clsx(
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <svg
        className="w-full h-full"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </motion.div>
  )
}