export type EntryKind = 'income' | 'expense'

export interface Entry {
  id: string
  kind: EntryKind
  title: string
  docDate?: Date
  transferDate?: Date
  clientName?: string
  vendorName?: string
  productService?: string
  accountName?: string
  priceGrossThb?: number | null
  vatThb?: number | null
  withholdingThb?: number | null
  commissionThb?: number | null
  totalNetThb?: number | null
  project?: string
  remark?: string
  invoiceNo?: string
  createdAt: Date
  updatedAt: Date
}

// For API requests/responses, we use numbers instead of Decimal
export interface EntryResponse {
  id: string
  kind: EntryKind
  title: string
  docDate?: string
  transferDate?: string
  clientName?: string
  vendorName?: string
  productService?: string
  accountName?: string
  priceGrossThb?: number
  vatThb?: number
  withholdingThb?: number
  commissionThb?: number
  totalNetThb?: number
  project?: string
  remark?: string
  invoiceNo?: string
  createdAt: string
  updatedAt: string
}

export interface CreateEntryRequest {
  kind: EntryKind
  title: string
  docDate?: string
  transferDate?: string
  clientName?: string
  vendorName?: string
  productService?: string
  accountName?: string
  priceGrossThb?: number
  vatThb?: number
  withholdingThb?: number
  commissionThb?: number
  project?: string
  remark?: string
  invoiceNo?: string
}

export interface UpdateEntryRequest extends Partial<CreateEntryRequest> {
  id: string
}

export interface DashboardMetrics {
  totalIncome: number
  totalExpenses: number
  netAmount: number
  entryCount: {
    income: number
    expense: number
    total: number
  }
}

export interface MonthlyTrend {
  month: string
  totalIncome: number
  totalExpenses: number
  netAmount: number
  entryCount: number
}// 
Query parameters for filtering entries
export interface GetEntriesQuery {
  page?: number
  limit?: number
  kind?: EntryKind
  month?: string // YYYY-MM format
  search?: string
  sortBy?: 'docDate' | 'totalNetThb' | 'title' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
  clientName?: string
  vendorName?: string
}

// Financial calculation utilities types
export interface FinancialCalculation {
  priceGross: number
  vat: number
  withholding: number
  commission?: number
  totalNet: number
}

export interface TaxCalculationOptions {
  enableVat?: boolean
  enableWithholding?: boolean
  vatRate?: number // Default 0.07 (7%)
  withholdingRate?: number // Default 0.03 (3%)
}