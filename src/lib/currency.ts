/**
 * Thai Baht Currency Utilities
 * 
 * This module provides comprehensive utilities for handling Thai Baht currency
 * formatting, validation, and calculations specific to Thai tax requirements.
 */

// Thai Baht currency symbol
export const THB_SYMBOL = '฿'
export const THB_CODE = 'THB'

// Thai tax rates
export const TAX_RATES = {
  VAT: 0.07,        // 7% VAT
  WITHHOLDING: 0.03, // 3% Withholding Tax
} as const

/**
 * Format a number as Thai Baht currency
 * Uses Thai locale for proper number formatting
 */
export function formatThb(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '฿0.00'
  }
  
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format Thai Baht without currency symbol (for input fields)
 */
export function formatThbNumber(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '0.00'
  }
  
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Parse a Thai Baht formatted string to number
 * Handles both with and without currency symbol
 */
export function parseThb(value: string): number {
  if (!value || typeof value !== 'string') return 0
  
  // Remove currency symbol, spaces, and commas
  const cleanValue = value
    .replace(/[฿,\s]/g, '')
    .replace(/[^\d.-]/g, '')
  
  const parsed = parseFloat(cleanValue)
  return isNaN(parsed) ? 0 : parsed
}

/**
 * Ensure proper currency precision (2 decimal places)
 * Rounds to avoid floating point precision issues
 */
export function ensureCurrencyPrecision(amount: number | undefined): number | undefined {
  if (amount === undefined || isNaN(amount)) return undefined
  return Math.round(amount * 100) / 100
}

/**
 * Round currency amount to 2 decimal places
 */
export function roundCurrency(amount: number): number {
  return Math.round(amount * 100) / 100
}

/**
 * Validate if an amount is a valid currency value
 */
export function isValidCurrencyAmount(amount: number): boolean {
  return !isNaN(amount) && isFinite(amount) && amount >= 0
}

/**
 * Calculate VAT amount from gross amount
 */
export function calculateVat(grossAmount: number, rate: number = TAX_RATES.VAT): number {
  if (!isValidCurrencyAmount(grossAmount)) return 0
  return roundCurrency(grossAmount * rate)
}

/**
 * Calculate withholding tax amount from gross amount
 */
export function calculateWithholding(grossAmount: number, rate: number = TAX_RATES.WITHHOLDING): number {
  if (!isValidCurrencyAmount(grossAmount)) return 0
  return roundCurrency(grossAmount * rate)
}

/**
 * Validate withholding tax doesn't exceed maximum allowed percentage
 */
export function validateWithholdingTax(grossAmount: number, withholdingAmount: number): {
  isValid: boolean
  maxAllowed: number
  message?: string
} {
  if (!isValidCurrencyAmount(grossAmount) || grossAmount === 0) {
    return { isValid: true, maxAllowed: 0 }
  }
  
  const maxAllowed = roundCurrency(grossAmount * TAX_RATES.WITHHOLDING)
  const isValid = withholdingAmount <= maxAllowed
  
  return {
    isValid,
    maxAllowed,
    message: isValid ? undefined : `Withholding tax cannot exceed ${formatThb(maxAllowed)} (3% of gross amount)`
  }
}

/**
 * Format currency for display in tables/lists (compact format)
 */
export function formatThbCompact(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '฿0'
  }
  
  // For amounts over 1M, show in millions
  if (Math.abs(amount) >= 1000000) {
    return `฿${(amount / 1000000).toFixed(1)}M`
  }
  
  // For amounts over 1K, show in thousands
  if (Math.abs(amount) >= 1000) {
    return `฿${(amount / 1000).toFixed(1)}K`
  }
  
  // For smaller amounts, show full amount without decimals if whole number
  return amount % 1 === 0 ? `฿${amount.toFixed(0)}` : formatThb(amount)
}

/**
 * Get currency input props for form fields
 */
export function getCurrencyInputProps() {
  return {
    type: 'number',
    step: '0.01',
    min: '0',
    placeholder: '0.00',
  }
}

/**
 * Format percentage with proper Thai locale
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100)
}

/**
 * Calculate percentage change between two amounts
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return roundCurrency(((current - previous) / previous) * 100)
}

/**
 * Format percentage change with color indication
 */
export function formatPercentageChange(percentage: number): {
  formatted: string
  isPositive: boolean
  isNeutral: boolean
  colorClass: string
} {
  const isPositive = percentage > 0
  const isNeutral = percentage === 0
  const sign = isPositive ? '+' : ''
  
  return {
    formatted: `${sign}${percentage}%`,
    isPositive,
    isNeutral,
    colorClass: isNeutral ? 'text-neutral-500' : isPositive ? 'text-emerald-600' : 'text-red-600'
  }
}

/**
 * Convert string input to currency number (for form handling)
 */
export function stringToCurrency(value: string | number): number {
  if (typeof value === 'number') return ensureCurrencyPrecision(value) || 0
  if (!value || typeof value !== 'string') return 0
  
  const parsed = parseThb(value)
  return ensureCurrencyPrecision(parsed) || 0
}

/**
 * Thai Baht currency configuration for Intl.NumberFormat
 */
export const THB_FORMAT_CONFIG = {
  style: 'currency' as const,
  currency: 'THB',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
}

/**
 * Thai number format configuration (without currency)
 */
export const TH_NUMBER_FORMAT_CONFIG = {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
}