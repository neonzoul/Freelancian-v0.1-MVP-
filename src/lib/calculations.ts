import type { EntryKind, FinancialCalculation, TaxCalculationOptions } from '@/types/entry'

// Thai Baht formatting
export function formatThb(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '฿0.00'
  
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

// For SQLite compatibility, we work directly with numbers
// but ensure proper precision for currency calculations
export function ensureCurrencyPrecision(num: number | undefined): number | undefined {
  if (num === undefined) return undefined
  return Math.round(num * 100) / 100 // Round to 2 decimal places
}

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
    vatRate = 0.07, // 7%
    withholdingRate = 0.03, // 3%
  } = options

  const vat = enableVat ? priceGross * vatRate : 0
  const withholding = enableWithholding ? priceGross * withholdingRate : 0
  const commission = 0 // Default to 0, can be set manually

  return {
    priceGross,
    vat: Math.round(vat * 100) / 100, // Round to 2 decimal places
    withholding: Math.round(withholding * 100) / 100,
    commission,
    totalNet: calculateTotalNet('income', priceGross, vat, withholding, commission),
  }
}

// Validate withholding tax doesn't exceed 3% of gross
export function validateWithholdingTax(priceGross: number, withholding: number): boolean {
  if (priceGross <= 0) return true
  return withholding <= priceGross * 0.03
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

// Round to 2 decimal places for currency
export function roundCurrency(amount: number): number {
  return Math.round(amount * 100) / 100
}

// Validate financial amounts
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