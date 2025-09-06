import { InputHTMLAttributes, forwardRef, useState } from 'react'
import { clsx } from 'clsx'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  helperText?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'filled'
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    label, 
    error, 
    helperText, 
    size = 'md', 
    variant = 'default',
    leftIcon,
    rightIcon,
    type = 'text',
    disabled,
    ...props 
  }, ref) => {
    const [focused, setFocused] = useState(false)

    const inputClasses = clsx(
      'w-full rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1',
      {
        // Size variants
        'px-3 py-2 text-sm': size === 'sm',
        'px-4 py-2.5 text-sm': size === 'md',
        'px-4 py-3 text-base': size === 'lg',
        
        // Icon padding adjustments
        'pl-10': leftIcon && size === 'sm',
        'pl-11': leftIcon && size === 'md',
        'pl-12': leftIcon && size === 'lg',
        'pr-10': rightIcon && size === 'sm',
        'pr-11': rightIcon && size === 'md',
        'pr-12': rightIcon && size === 'lg',
        
        // Variant styles
        'border-neutral-300 bg-white hover:border-neutral-400 focus:border-primary-500 focus:ring-primary-500/20': 
          variant === 'default' && !error && !disabled,
        'border-neutral-200 bg-neutral-50 hover:bg-white hover:border-neutral-300 focus:bg-white focus:border-primary-500 focus:ring-primary-500/20': 
          variant === 'filled' && !error && !disabled,
        
        // Error state
        'border-error-500 focus:border-error-500 focus:ring-error-500/20': error,
        
        // Disabled state
        'border-neutral-200 bg-neutral-100 text-neutral-500 cursor-not-allowed': disabled,
      },
      className
    )

    return (
      <div className="w-full">
        {label && (
          <label className={clsx(
            'block text-sm font-medium mb-2 transition-colors duration-200',
            error ? 'text-error-700' : 'text-neutral-700',
            disabled && 'text-neutral-500'
          )}>
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className={clsx(
              'absolute left-0 top-0 bottom-0 flex items-center justify-center text-neutral-400',
              {
                'w-10': size === 'sm',
                'w-11': size === 'md',
                'w-12': size === 'lg',
              }
            )}>
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            type={type}
            className={inputClasses}
            disabled={disabled}
            onFocus={(e) => {
              setFocused(true)
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              setFocused(false)
              props.onBlur?.(e)
            }}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined}
            {...props}
          />
          
          {rightIcon && (
            <div className={clsx(
              'absolute right-0 top-0 bottom-0 flex items-center justify-center text-neutral-400',
              {
                'w-10': size === 'sm',
                'w-11': size === 'md',
                'w-12': size === 'lg',
              }
            )}>
              {rightIcon}
            </div>
          )}
        </div>
        
        {(error || helperText) && (
          <div className="mt-2">
            {error && (
              <p id={`${props.id}-error`} className="text-sm text-error-600 flex items-center gap-1">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
            )}
            {!error && helperText && (
              <p id={`${props.id}-helper`} className="text-sm text-neutral-500">
                {helperText}
              </p>
            )}
          </div>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

// Number Input Component
interface NumberInputProps extends Omit<InputProps, 'type'> {
  min?: number
  max?: number
  step?: number
  currency?: boolean
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  ({ currency, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        type="number"
        leftIcon={currency ? (
          <span className="text-neutral-600 font-medium">฿</span>
        ) : undefined}
        {...props}
      />
    )
  }
)

NumberInput.displayName = 'NumberInput'

// Date Input Component
interface DateInputProps extends Omit<InputProps, 'type'> {}

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  (props, ref) => {
    return (
      <Input
        ref={ref}
        type="date"
        rightIcon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        }
        {...props}
      />
    )
  }
)

DateInput.displayName = 'DateInput'