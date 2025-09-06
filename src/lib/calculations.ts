import type { EntryKind, FinancialCalculation, TaxCalculationOptions } from '@/types/entry'
import { 
  formatThb, 
  ensureCurrencyPrecision, 
  roundCurrency, 
  calculateVat, 
  calculateWithholding,
  validateWithholdingTax as validateWithholdingAmount,
  TAX_RATES
} from './currency'

// Re-export currency utilities for backward compatibility
export { formatThb, ensureCurrencyPrecision, roundCurrency }

// Calculate financial totals based on entry kind
export function calculateTotalNet(
  kind: EntryKind,
  priceGross: number = 0,
  vat: number = 0,
  withholding: number = 0,
  commission: number = 0
): number {
  switch (kind) {
    case 'income':
      // Income: price_gross + vat - withholding - commission
      return priceGross + vat - withholding - commission
    case 'expense':
      // Expense: price_gross + vat - withholding
      return priceGross + vat - withholding
    default:
      return 0
  }
}

// Auto-calculate VAT and withholding tax
export function calculateTaxes(
  priceGross: number,
  options: TaxCalculationOptions = {}
): FinancialCalculation {
  const {
    enableVat = true,
    enableWithholding = true,
    vatRate = TAX_RATES.VAT, // 7%
    withholdingRate = TAX_RATES.WITHHOLDING, // 3%
  } = options

  const vat = enableVat ? calculateVat(priceGross, vatRate) : 0
  const withholding = enableWithholding ? calculateWithholding(priceGross, withholdingRate) : 0
  const commission = 0 // Default to 0, can be set manually

  return {
    priceGross,
    vat,
    withholding,
    commission,
    totalNet: calculateTotalNet('income', priceGross, vat, withholding, commission),
  }
}

// Validate withholding tax doesn't exceed 3% of gross
export function validateWithholdingTax(priceGross: number, withholding: number): boolean {
  const validation = validateWithholdingAmount(priceGross, withholding)
  return validation.isValid
}

// Enhanced withholding validation with detailed feedback
export function validateWithholdingTaxDetailed(priceGross: number, withholding: number) {
  return validateWithholdingAmount(priceGross, withholding)
}

// Calculate percentage change for trends
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100 * 100) / 100
}

// Format percentage with proper sign and color indication
export function formatPercentageChange(percentage: number): {
  formatted: string
  isPositive: boolean
  isNeutral: boolean
} {
  const isPositive = percentage > 0
  const isNeutral = percentage === 0
  const sign = isPositive ? '+' : ''
  
  return {
    formatted: `${sign}${percentage}%`,
    isPositive,
    isNeutral,
  }
}

// Validate financial amounts (re-exported from currency utilities)
export function validateFinancialAmount(amount: number): boolean {
  return !isNaN(amount) && isFinite(amount) && amount >= 0
}

// Calculate monthly totals from entries
export function calculateMonthlyTotals(entries: Array<{
  kind: EntryKind
  totalNetThb: number | null
}>): {
  totalIncome: number
  totalExpenses: number
  netAmount: number
  entryCount: { income: number; expense: number; total: number }
} {
  let totalIncome = 0
  let totalExpenses = 0
  let incomeCount = 0
  let expenseCount = 0

  entries.forEach(entry => {
    const amount = entry.totalNetThb || 0
    
    if (entry.kind === 'income') {
      totalIncome += amount
      incomeCount++
    } else if (entry.kind === 'expense') {
      totalExpenses += Math.abs(amount) // Ensure expenses are positive for display
      expenseCount++
    }
  })

  return {
    totalIncome: roundCurrency(totalIncome),
    totalExpenses: roundCurrency(totalExpenses),
    netAmount: roundCurrency(totalIncome - totalExpenses),
    entryCount: {
      income: incomeCount,
      expense: expenseCount,
      total: incomeCount + expenseCount,
    },
  }
}