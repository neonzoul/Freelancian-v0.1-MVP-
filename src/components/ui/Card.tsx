import { HTMLAttributes, forwardRef } from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import { cardHover } from '@/lib/animations'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  variant?: 'default' | 'elevated' | 'outlined'
  interactive?: boolean
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = false, variant = 'default', interactive = false, children, ...props }, ref) => {
    const MotionComponent = hover || interactive ? motion.div : 'div'
    const motionProps = hover || interactive ? {
      variants: cardHover,
      initial: "initial",
      whileHover: "hover",
      whileTap: interactive ? "tap" : undefined,
    } : {}

    return (
      <MotionComponent
        {...motionProps}
        className={clsx(
          'rounded-xl transition-all duration-200',
          {
            // Variant styles
            'bg-white shadow-soft border border-neutral-200': variant === 'default',
            'bg-white shadow-medium border border-neutral-200': variant === 'elevated',
            'bg-white border-2 border-neutral-200': variant === 'outlined',
            
            // Hover effects (now handled by Framer Motion)
            'hover:shadow-medium': hover && variant === 'default',
            'hover:shadow-strong': hover && variant === 'elevated',
            'hover:border-primary-300 hover:shadow-soft': hover && variant === 'outlined',
            
            // Interactive states
            'cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2': interactive,
          },
          className
        )}
        ref={ref}
        tabIndex={interactive ? 0 : undefined}
        role={interactive ? 'button' : undefined}
        {...props}
      >
        {children}
      </MotionComponent>
    )
  }
)

Card.displayName = 'Card'

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={clsx('p-6 pb-0', className)} {...props} />
  )
)

CardHeader.displayName = 'CardHeader'

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={clsx('p-6', className)} {...props} />
  )
)

CardContent.displayName = 'CardContent'

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={clsx('p-6 pt-0', className)} {...props} />
  )
)

CardFooter.displayName = 'CardFooter'