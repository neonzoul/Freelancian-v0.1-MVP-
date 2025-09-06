import { HTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  variant?: 'default' | 'elevated' | 'outlined'
  interactive?: boolean
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = false, variant = 'default', interactive = false, children, ...props }, ref) => {
    return (
      <div
        className={clsx(
          'rounded-xl transition-all duration-200',
          {
            // Variant styles
            'bg-white shadow-soft border border-neutral-200': variant === 'default',
            'bg-white shadow-medium border border-neutral-200': variant === 'elevated',
            'bg-white border-2 border-neutral-200': variant === 'outlined',
            
            // Hover effects
            'hover:shadow-medium hover:-translate-y-1': hover && variant === 'default',
            'hover:shadow-strong hover:-translate-y-1': hover && variant === 'elevated',
            'hover:border-primary-300 hover:shadow-soft': hover && variant === 'outlined',
            
            // Interactive states
            'cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2': interactive,
            'active:scale-[0.98]': interactive,
          },
          className
        )}
        ref={ref}
        tabIndex={interactive ? 0 : undefined}
        role={interactive ? 'button' : undefined}
        {...props}
      >
        {children}
      </div>
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