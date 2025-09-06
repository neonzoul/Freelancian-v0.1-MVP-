import { ButtonHTMLAttributes, forwardRef } from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { clsx } from 'clsx'
import { buttonPress, accessibleButtonPress } from '@/lib/animations'
import { useAccessibility } from '@/components/providers/AccessibilityProvider'

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 
  'onDrag' | 'onDragEnd' | 'onDragStart' | 'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration'
> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  'aria-describedby'?: string
  'aria-expanded'?: boolean
  'aria-haspopup'?: boolean | 'false' | 'true' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    const { prefersReducedMotion } = useAccessibility()
    const buttonVariants = accessibleButtonPress(prefersReducedMotion)
    
    return (
      <motion.button
        variants={buttonVariants}
        initial="initial"
        whileHover={disabled || loading ? undefined : "hover"}
        whileTap={disabled || loading ? undefined : "tap"}
        className={clsx(
          'inline-flex items-center justify-center rounded-lg font-medium transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 touch-manipulation',
          'relative', // For loading state positioning
          {
            'bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white focus:ring-primary-500': variant === 'primary',
            'bg-neutral-200 hover:bg-neutral-300 active:bg-neutral-400 text-neutral-900 focus:ring-neutral-500': variant === 'secondary',
            'border border-neutral-300 bg-white hover:bg-neutral-50 active:bg-neutral-100 text-neutral-900 focus:ring-primary-500': variant === 'outline',
            'hover:bg-neutral-100 active:bg-neutral-200 text-neutral-700 focus:ring-neutral-500': variant === 'ghost',
            'px-3 py-2 text-sm min-h-[44px]': size === 'sm', // Increased min-height for accessibility
            'px-4 py-2.5 text-sm min-h-[44px]': size === 'md', // Increased min-height for accessibility
            'px-6 py-3 text-base min-h-[48px]': size === 'lg', // Increased min-height for accessibility
            'opacity-50 cursor-not-allowed': disabled || loading,
          },
          className
        )}
        disabled={disabled || loading}
        ref={ref}
        aria-busy={loading}
        aria-disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <>
            <motion.svg 
              className="-ml-1 mr-2 h-4 w-4" 
              fill="none" 
              viewBox="0 0 24 24"
              animate={prefersReducedMotion ? {} : { rotate: 360 }}
              transition={prefersReducedMotion ? {} : { duration: 1, repeat: Infinity, ease: 'linear' }}
              aria-hidden="true"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </motion.svg>
            <span className="sr-only">Loading...</span>
          </>
        )}
        {children}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'