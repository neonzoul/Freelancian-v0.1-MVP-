'use client'

import { TextareaHTMLAttributes, forwardRef, useState } from 'react'
import { clsx } from 'clsx'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
  variant?: 'default' | 'filled'
  resize?: 'none' | 'vertical' | 'horizontal' | 'both'
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    className, 
    label, 
    error, 
    helperText, 
    variant = 'default',
    resize = 'vertical',
    disabled,
    rows = 4,
    ...props 
  }, ref) => {
    const [focused, setFocused] = useState(false)

    const textareaClasses = clsx(
      'w-full rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1',
      'px-4 py-3 text-sm',
      {
        // Resize options
        'resize-none': resize === 'none',
        'resize-y': resize === 'vertical',
        'resize-x': resize === 'horizontal',
        'resize': resize === 'both',
        
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
        
        <textarea
          ref={ref}
          rows={rows}
          className={textareaClasses}
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

Textarea.displayName = 'Textarea'