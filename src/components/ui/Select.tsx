import { SelectHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'

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
    ...props 
  }, ref) => {
    const selectClasses = clsx(
      'w-full rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 appearance-none bg-no-repeat bg-right',
      'bg-[url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3e%3c/svg%3e")]',
      {
        // Size variants
        'px-3 py-2 pr-8 text-sm bg-[length:16px_16px] bg-[right_8px_center]': size === 'sm',
        'px-4 py-2.5 pr-10 text-sm bg-[length:20px_20px] bg-[right_12px_center]': size === 'md',
        'px-4 py-3 pr-12 text-base bg-[length:20px_20px] bg-[right_16px_center]': size === 'lg',
        
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
        
        <select
          ref={ref}
          className={selectClasses}
          disabled={disabled}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined}
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

Select.displayName = 'Select'