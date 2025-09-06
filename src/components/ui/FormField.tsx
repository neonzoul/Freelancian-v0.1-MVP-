'use client'

import { forwardRef, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface FormFieldProps {
  label?: string
  error?: string
  hint?: string
  required?: boolean
  children: ReactNode
  className?: string
}

export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  ({ label, error, hint, required, children, className }, ref) => {
    return (
      <div ref={ref} className={cn('space-y-2', className)}>
        {label && (
          <label className="block text-sm font-medium text-neutral-700">
            {label}
            {required && (
              <span className="text-error-500 ml-1" aria-label="required">
                *
              </span>
            )}
          </label>
        )}
        
        <div className="relative">
          {children}
        </div>
        
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2 text-sm text-error-600"
              role="alert"
              aria-live="polite"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </motion.div>
          )}
          
          {!error && hint && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm text-neutral-500"
            >
              {hint}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }
)

FormField.displayName = 'FormField'

// Enhanced Input component with validation states
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  success?: boolean
  icon?: ReactNode
  rightElement?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, success, icon, rightElement, ...props }, ref) => {
    const hasError = !!error
    const hasSuccess = success && !hasError

    return (
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400">
            {icon}
          </div>
        )}
        
        <input
          ref={ref}
          className={cn(
            'w-full px-4 py-3 rounded-xl border transition-all duration-200',
            'placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-offset-1',
            icon && 'pl-10',
            rightElement && 'pr-10',
            hasError && 'border-error-300 focus:border-error-500 focus:ring-error-200',
            hasSuccess && 'border-success-300 focus:border-success-500 focus:ring-success-200',
            !hasError && !hasSuccess && 'border-neutral-200 focus:border-primary-500 focus:ring-primary-200',
            className
          )}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${props.id}-error` : undefined}
          {...props}
        />
        
        {rightElement && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {rightElement}
          </div>
        )}
        
        {/* Validation icons */}
        {(hasError || hasSuccess) && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn(
              'absolute right-3 top-1/2 transform -translate-y-1/2',
              rightElement && 'right-10'
            )}
          >
            {hasError && (
              <svg className="w-5 h-5 text-error-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {hasSuccess && (
              <svg className="w-5 h-5 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </motion.div>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

// Enhanced Select component
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string
  success?: boolean
  placeholder?: string
  options: Array<{ value: string; label: string; disabled?: boolean }>
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, success, placeholder, options, ...props }, ref) => {
    const hasError = !!error
    const hasSuccess = success && !hasError

    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            'w-full px-4 py-3 rounded-xl border transition-all duration-200 appearance-none bg-white',
            'focus:outline-none focus:ring-2 focus:ring-offset-1 pr-10',
            hasError && 'border-error-300 focus:border-error-500 focus:ring-error-200',
            hasSuccess && 'border-success-300 focus:border-success-500 focus:ring-success-200',
            !hasError && !hasSuccess && 'border-neutral-200 focus:border-primary-500 focus:ring-primary-200',
            className
          )}
          aria-invalid={hasError}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Dropdown arrow */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        
        {/* Validation icons */}
        {(hasError || hasSuccess) && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute right-10 top-1/2 transform -translate-y-1/2"
          >
            {hasError && (
              <svg className="w-5 h-5 text-error-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {hasSuccess && (
              <svg className="w-5 h-5 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </motion.div>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'

// Enhanced Textarea component
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
  success?: boolean
  resize?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, success, resize = true, ...props }, ref) => {
    const hasError = !!error
    const hasSuccess = success && !hasError

    return (
      <div className="relative">
        <textarea
          ref={ref}
          className={cn(
            'w-full px-4 py-3 rounded-xl border transition-all duration-200',
            'placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-offset-1',
            !resize && 'resize-none',
            hasError && 'border-error-300 focus:border-error-500 focus:ring-error-200',
            hasSuccess && 'border-success-300 focus:border-success-500 focus:ring-success-200',
            !hasError && !hasSuccess && 'border-neutral-200 focus:border-primary-500 focus:ring-primary-200',
            className
          )}
          aria-invalid={hasError}
          {...props}
        />
        
        {/* Validation icons */}
        {(hasError || hasSuccess) && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute right-3 top-3"
          >
            {hasError && (
              <svg className="w-5 h-5 text-error-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {hasSuccess && (
              <svg className="w-5 h-5 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </motion.div>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

// Form validation summary component
interface FormErrorSummaryProps {
  errors: Record<string, string>
  className?: string
}

export function FormErrorSummary({ errors, className }: FormErrorSummaryProps) {
  const errorEntries = Object.entries(errors).filter(([_, message]) => message)
  
  if (errorEntries.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'bg-error-50 border border-error-200 rounded-xl p-4',
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <svg className="w-5 h-5 text-error-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <h3 className="text-sm font-medium text-error-800 mb-2">
            Please fix the following errors:
          </h3>
          <ul className="text-sm text-error-700 space-y-1">
            {errorEntries.map(([field, message]) => (
              <li key={field} className="flex items-start gap-2">
                <span className="w-1 h-1 bg-error-600 rounded-full mt-2 flex-shrink-0" />
                <span>{message}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  )
}