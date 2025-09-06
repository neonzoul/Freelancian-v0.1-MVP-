'use client'

import { forwardRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  formatThbNumber, 
  parseThb, 
  stringToCurrency, 
  getCurrencyInputProps,
  isValidCurrencyAmount 
} from '@/lib/currency'

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value?: number
  onChange?: (value: number) => void
  label?: string
  error?: string
  helperText?: string
  showSymbol?: boolean
  allowNegative?: boolean
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ 
    value, 
    onChange, 
    label, 
    error, 
    helperText, 
    showSymbol = true,
    allowNegative = false,
    className = '',
    disabled,
    ...props 
  }, ref) => {
    const [displayValue, setDisplayValue] = useState('')
    const [isFocused, setIsFocused] = useState(false)

    // Update display value when prop value changes
    useEffect(() => {
      if (value !== undefined && !isFocused) {
        setDisplayValue(value === 0 ? '' : formatThbNumber(value))
      }
    }, [value, isFocused])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value
      setDisplayValue(inputValue)

      // Parse and validate the input
      const numericValue = stringToCurrency(inputValue)
      
      // Validate the amount
      if (isValidCurrencyAmount(numericValue) || (allowNegative && numericValue < 0)) {
        onChange?.(numericValue)
      } else if (inputValue === '') {
        onChange?.(0)
      }
    }

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true)
      props.onFocus?.(e)
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      
      // Format the display value on blur
      const numericValue = stringToCurrency(displayValue)
      if (numericValue > 0) {
        setDisplayValue(formatThbNumber(numericValue))
      } else {
        setDisplayValue('')
      }
      
      props.onBlur?.(e)
    }

    const inputClasses = `
      w-full px-4 py-3 text-base border rounded-lg transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
      disabled:bg-neutral-100 disabled:cursor-not-allowed
      ${showSymbol ? 'pl-8' : ''}
      ${error 
        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
        : 'border-neutral-300 hover:border-neutral-400'
      }
      ${className}
    `.trim()

    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-neutral-700">
            {label}
          </label>
        )}
        
        <div className="relative">
          {showSymbol && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-neutral-500 text-base">฿</span>
            </div>
          )}
          
          <input
            ref={ref}
            type="text"
            value={displayValue}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={inputClasses}
            disabled={disabled}
            {...getCurrencyInputProps()}
            {...props}
          />
        </div>

        {/* Error message */}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-red-600 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </motion.p>
        )}

        {/* Helper text */}
        {helperText && !error && (
          <p className="text-sm text-neutral-500">{helperText}</p>
        )}
      </div>
    )
  }
)

CurrencyInput.displayName = 'CurrencyInput'