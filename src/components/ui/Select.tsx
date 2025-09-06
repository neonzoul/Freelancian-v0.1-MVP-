'use client'

import { SelectHTMLAttributes, forwardRef, useState } from 'react'
import { clsx } from 'clsx'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { useId } from '@/lib/accessibility'

interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string
  error?: string
  helperText?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'filled'
  options: SelectOption[]
  placeholder?: string
  required?: boolean
  'aria-describedby'?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ 
    className, 
    label, 
    error, 
    helperText, 
    size = 'md', 
    variant = 'default',
    options,
    placeholder,
    disabled,
    required,
    id,
    ...props 
  }, ref) => {
    const [focused, setFocused] = useState(false)
    const generatedId = useId('select')
    const selectId = id || generatedId

    const selectClasses = clsx(
      'w-full rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1',
      'appearance-none bg-white cursor-pointer',
      {
        // Size variants
        'px-3 py-2 text-sm': size === 'sm',
        'px-4 py-2.5 text-sm': size === 'md',
        'px-4 py-3 text-base': size === 'lg',
        
        // Variant styles
        'border-neutral-300 hover:border-neutral-400 focus:border-primary-500 focus:ring-primary-500/20': 
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
          <label 
            htmlFor={selectId}
            className={clsx(
              'block text-sm font-medium mb-2 transition-colors duration-200',
              error ? 'text-error-700' : 'text-neutral-700',
              disabled && 'text-neutral-500'
            )}
          >
            {label}
            {required && (
              <span className="text-error-500 ml-1" aria-label="required">
                *
              </span>
            )}
          </label>
        )}
        
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={selectClasses}
            disabled={disabled}
            required={required}
            onFocus={(e) => {
              setFocused(true)
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              setFocused(false)
              props.onBlur?.(e)
            }}
            aria-invalid={error ? 'true' : 'false'}
            aria-required={required}
            aria-describedby={
              [
                error ? `${selectId}-error` : null,
                helperText ? `${selectId}-helper` : null,
                props['aria-describedby']
              ].filter(Boolean).join(' ') || undefined
            }
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          
          {/* Dropdown Arrow */}
          <div className={clsx(
            'absolute right-0 top-0 bottom-0 flex items-center justify-center pointer-events-none',
            {
              'w-10': size === 'sm',
              'w-11': size === 'md',
              'w-12': size === 'lg',
            }
          )}>
            <ChevronDownIcon 
              className={clsx(
                'transition-transform duration-200',
                focused ? 'rotate-180' : 'rotate-0',
                disabled ? 'text-neutral-400' : 'text-neutral-500',
                {
                  'w-4 h-4': size === 'sm',
                  'w-5 h-5': size === 'md' || size === 'lg',
                }
              )}
              aria-hidden="true"
            />
          </div>
        </div>
        
        {(error || helperText) && (
          <div className="mt-2">
            {error && (
              <p id={`${selectId}-error`} className="text-sm text-error-600 flex items-center gap-1" role="alert">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
            )}
            {!error && helperText && (
              <p id={`${selectId}-helper`} className="text-sm text-neutral-500">
                {helperText}
              </p>
            )}
          </div>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'