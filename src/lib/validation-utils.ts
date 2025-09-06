import { z } from 'zod'

// Common validation schemas
export const commonValidation = {
  // Required string with minimum length
  requiredString: (minLength = 1, message?: string) =>
    z.string()
      .min(minLength, message || `This field must be at least ${minLength} character${minLength > 1 ? 's' : ''} long`)
      .trim(),

  // Optional string
  optionalString: () => z.string().optional().or(z.literal('')),

  // Email validation
  email: () =>
    z.string()
      .email('Please enter a valid email address')
      .toLowerCase(),

  // Phone number validation (Thai format)
  phoneNumber: () =>
    z.string()
      .regex(/^(\+66|0)[0-9]{8,9}$/, 'Please enter a valid Thai phone number')
      .optional(),

  // Currency amount validation (Thai Baht)
  currency: (options?: { min?: number; max?: number; required?: boolean }) => {
    const { min = 0, max = 999999999.99, required = false } = options || {}
    
    let schema = z.number()
      .min(min, `Amount must be at least ฿${min.toLocaleString()}`)
      .max(max, `Amount cannot exceed ฿${max.toLocaleString()}`)
      .multipleOf(0.01, 'Amount can only have up to 2 decimal places')

    return required ? schema : schema.optional()
  },

  // Date validation
  date: (options?: { 
    min?: Date; 
    max?: Date; 
    required?: boolean;
    allowFuture?: boolean;
  }) => {
    const { min, max, required = false, allowFuture = true } = options || {}
    
    let schema = z.date()
    
    if (min) {
      schema = schema.min(min, `Date must be after ${min.toLocaleDateString()}`)
    }
    
    if (max) {
      schema = schema.max(max, `Date must be before ${max.toLocaleDateString()}`)
    }
    
    if (!allowFuture) {
      schema = schema.max(new Date(), 'Date cannot be in the future')
    }

    return required ? schema : schema.optional()
  },

  // Percentage validation
  percentage: (options?: { min?: number; max?: number; required?: boolean }) => {
    const { min = 0, max = 100, required = false } = options || {}
    
    let schema = z.number()
      .min(min, `Percentage must be at least ${min}%`)
      .max(max, `Percentage cannot exceed ${max}%`)
      .multipleOf(0.01, 'Percentage can only have up to 2 decimal places')

    return required ? schema : schema.optional()
  },

  // Invoice number validation
  invoiceNumber: () =>
    z.string()
      .regex(/^[A-Z0-9-]+$/, 'Invoice number can only contain uppercase letters, numbers, and hyphens')
      .min(1, 'Invoice number is required')
      .max(50, 'Invoice number cannot exceed 50 characters')
      .optional(),

  // Entry kind validation
  entryKind: () =>
    z.enum(['income', 'expense'], {
      errorMap: () => ({ message: 'Please select either Income or Expense' })
    }),
}

// Entry form validation schema
export const entryFormSchema = z.object({
  kind: commonValidation.entryKind(),
  title: commonValidation.requiredString(1, 'Title is required'),
  docDate: commonValidation.date({ allowFuture: false }),
  transferDate: commonValidation.date({ allowFuture: false }),
  clientName: commonValidation.optionalString(),
  vendorName: commonValidation.optionalString(),
  productService: commonValidation.optionalString(),
  accountName: commonValidation.optionalString(),
  priceGrossThb: commonValidation.currency({ min: 0, required: false }),
  vatThb: commonValidation.currency({ min: 0, required: false }),
  withholdingThb: commonValidation.currency({ min: 0, required: false }),
  commissionThb: commonValidation.currency({ min: 0, required: false }),
  project: commonValidation.optionalString(),
  remark: commonValidation.optionalString(),
  invoiceNo: commonValidation.invoiceNumber(),
}).refine((data) => {
  // Business rule: withholding cannot exceed 3% of gross amount
  if (data.priceGrossThb && data.withholdingThb) {
    return data.withholdingThb <= data.priceGrossThb * 0.03
  }
  return true
}, {
  message: 'Withholding tax cannot exceed 3% of gross amount',
  path: ['withholdingThb'],
}).refine((data) => {
  // Business rule: VAT should not exceed 10% of gross amount (reasonable check)
  if (data.priceGrossThb && data.vatThb) {
    return data.vatThb <= data.priceGrossThb * 0.10
  }
  return true
}, {
  message: 'VAT amount seems unusually high (over 10% of gross amount)',
  path: ['vatThb'],
}).refine((data) => {
  // Business rule: At least one amount field should be filled
  const hasAmount = data.priceGrossThb || data.vatThb || data.withholdingThb || data.commissionThb
  return hasAmount
}, {
  message: 'Please enter at least one amount',
  path: ['priceGrossThb'],
})

// Import form validation schema
export const importFormSchema = z.object({
  file: z.instanceof(File, { message: 'Please select a CSV file' })
    .refine((file) => file.size > 0, 'File cannot be empty')
    .refine((file) => file.size <= 5 * 1024 * 1024, 'File size cannot exceed 5MB')
    .refine((file) => file.type === 'text/csv' || file.name.endsWith('.csv'), 'Please select a CSV file'),
  kind: commonValidation.entryKind(),
})

// Search/filter form validation schema
export const searchFilterSchema = z.object({
  search: commonValidation.optionalString(),
  kind: z.enum(['all', 'income', 'expense']).optional(),
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Invalid month format').optional(),
  clientName: commonValidation.optionalString(),
  vendorName: commonValidation.optionalString(),
  sortBy: z.enum(['date', 'amount', 'title']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
})

// Utility functions for form validation
export function getFieldError(
  errors: Record<string, any>,
  fieldName: string
): string | undefined {
  const error = errors[fieldName]
  if (error?.message) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return undefined
}

export function hasFieldError(
  errors: Record<string, any>,
  fieldName: string
): boolean {
  return !!getFieldError(errors, fieldName)
}

export function getFormErrorSummary(
  errors: Record<string, any>
): Record<string, string> {
  const summary: Record<string, string> = {}
  
  Object.entries(errors).forEach(([field, error]) => {
    if (error?.message) {
      summary[field] = error.message
    } else if (typeof error === 'string') {
      summary[field] = error
    }
  })
  
  return summary
}

// Validation helpers for specific business rules
export const businessRules = {
  // Validate Thai tax withholding (max 3% of gross)
  validateWithholding: (gross: number, withholding: number): boolean => {
    return withholding <= gross * 0.03
  },

  // Validate VAT amount (typically 7% in Thailand)
  validateVAT: (gross: number, vat: number): boolean => {
    // Allow some flexibility, but warn if over 10%
    return vat <= gross * 0.10
  },

  // Calculate suggested VAT (7%)
  calculateVAT: (gross: number): number => {
    return Math.round(gross * 0.07 * 100) / 100
  },

  // Calculate suggested withholding (3%)
  calculateWithholding: (gross: number): number => {
    return Math.round(gross * 0.03 * 100) / 100
  },

  // Validate date is not in the future
  validateDateNotFuture: (date: Date): boolean => {
    return date <= new Date()
  },

  // Validate required fields based on entry type
  validateRequiredFields: (data: any, kind: 'income' | 'expense'): string[] => {
    const errors: string[] = []
    
    if (!data.title?.trim()) {
      errors.push('Title is required')
    }
    
    if (kind === 'income' && !data.clientName?.trim()) {
      errors.push('Client name is required for income entries')
    }
    
    if (kind === 'expense' && !data.vendorName?.trim()) {
      errors.push('Vendor name is required for expense entries')
    }
    
    const hasAmount = data.priceGrossThb || data.vatThb || data.withholdingThb || data.commissionThb
    if (!hasAmount) {
      errors.push('At least one amount field is required')
    }
    
    return errors
  }
}

// Form field validation states
export type ValidationState = 'idle' | 'validating' | 'valid' | 'invalid'

export function getValidationState(
  value: any,
  error: string | undefined,
  isValidating: boolean = false
): ValidationState {
  if (isValidating) return 'validating'
  if (error) return 'invalid'
  if (value !== undefined && value !== null && value !== '') return 'valid'
  return 'idle'
}