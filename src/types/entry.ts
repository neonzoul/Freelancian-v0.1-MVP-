export interface Entry {
  id: string
  kind: 'income' | 'expense'
  title: string
  docDate?: Date
  transferDate?: Date
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
  createdAt: Date
  updatedAt: Date
}

export interface CreateEntryRequest {
  kind: 'income' | 'expense'
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
}