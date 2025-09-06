import type { Entry as PrismaEntry } from '@prisma/client'
import type { Entry, EntryResponse, CreateEntryRequest } from '@/types/entry'
import { ensureCurrencyPrecision, calculateTotalNet } from './calculations'

// Utility function to handle both Float (SQLite) and Decimal (PostgreSQL) types
function toNumber(value: number | any | null): number | undefined {
  if (value === null || value === undefined) return undefined
  return typeof value === 'number' ? value : Number(value)
}

// Transform Prisma Entry to API Entry Response
export function transformEntryToResponse(entry: PrismaEntry): EntryResponse {
  return {
    id: entry.id,
    kind: entry.kind as 'income' | 'expense',
    title: entry.title,
    docDate: entry.docDate?.toISOString(),
    transferDate: entry.transferDate?.toISOString(),
    clientName: entry.clientName || undefined,
    vendorName: entry.vendorName || undefined,
    productService: entry.productService || undefined,
    accountName: entry.accountName || undefined,
    priceGrossThb: toNumber(entry.priceGrossThb),
    vatThb: toNumber(entry.vatThb),
    withholdingThb: toNumber(entry.withholdingThb),
    commissionThb: toNumber(entry.commissionThb),
    totalNetThb: toNumber(entry.totalNetThb),
    project: entry.project || undefined,
    remark: entry.remark || undefined,
    invoiceNo: entry.invoiceNo || undefined,
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString(),
  }
}

// Transform multiple entries
export function transformEntriesToResponse(entries: PrismaEntry[]): EntryResponse[] {
  return entries.map(transformEntryToResponse)
}

// Transform API request to Prisma create data
export function transformCreateRequestToPrisma(request: CreateEntryRequest) {
  // Calculate total net amount
  const priceGross = request.priceGrossThb || 0
  const vat = request.vatThb || 0
  const withholding = request.withholdingThb || 0
  const commission = request.commissionThb || 0
  
  const totalNet = calculateTotalNet(request.kind, priceGross, vat, withholding, commission)

  return {
    kind: request.kind,
    title: request.title,
    docDate: request.docDate ? new Date(request.docDate) : null,
    transferDate: request.transferDate ? new Date(request.transferDate) : null,
    clientName: request.clientName || null,
    vendorName: request.vendorName || null,
    productService: request.productService || null,
    accountName: request.accountName || null,
    priceGrossThb: ensureCurrencyPrecision(request.priceGrossThb),
    vatThb: ensureCurrencyPrecision(request.vatThb),
    withholdingThb: ensureCurrencyPrecision(request.withholdingThb),
    commissionThb: ensureCurrencyPrecision(request.commissionThb),
    totalNetThb: ensureCurrencyPrecision(totalNet),
    project: request.project || null,
    remark: request.remark || null,
    invoiceNo: request.invoiceNo || null,
  }
}

// Transform API update request to Prisma update data
export function transformUpdateRequestToPrisma(request: Partial<CreateEntryRequest>) {
  const updateData: any = {}

  if (request.kind !== undefined) updateData.kind = request.kind
  if (request.title !== undefined) updateData.title = request.title
  if (request.docDate !== undefined) {
    updateData.docDate = request.docDate ? new Date(request.docDate) : null
  }
  if (request.transferDate !== undefined) {
    updateData.transferDate = request.transferDate ? new Date(request.transferDate) : null
  }
  if (request.clientName !== undefined) updateData.clientName = request.clientName || null
  if (request.vendorName !== undefined) updateData.vendorName = request.vendorName || null
  if (request.productService !== undefined) updateData.productService = request.productService || null
  if (request.accountName !== undefined) updateData.accountName = request.accountName || null
  if (request.priceGrossThb !== undefined) {
    updateData.priceGrossThb = ensureCurrencyPrecision(request.priceGrossThb)
  }
  if (request.vatThb !== undefined) {
    updateData.vatThb = ensureCurrencyPrecision(request.vatThb)
  }
  if (request.withholdingThb !== undefined) {
    updateData.withholdingThb = ensureCurrencyPrecision(request.withholdingThb)
  }
  if (request.commissionThb !== undefined) {
    updateData.commissionThb = ensureCurrencyPrecision(request.commissionThb)
  }
  if (request.project !== undefined) updateData.project = request.project || null
  if (request.remark !== undefined) updateData.remark = request.remark || null
  if (request.invoiceNo !== undefined) updateData.invoiceNo = request.invoiceNo || null

  // Recalculate total if any financial fields are being updated
  const hasFinancialUpdate = [
    'priceGrossThb', 'vatThb', 'withholdingThb', 'commissionThb', 'kind'
  ].some(field => request[field as keyof CreateEntryRequest] !== undefined)

  if (hasFinancialUpdate) {
    // We need the current entry data to calculate the total properly
    // For now, we'll let the database trigger handle this
    // In a real implementation, you'd fetch the current entry and merge the updates
    const priceGross = request.priceGrossThb || 0
    const vat = request.vatThb || 0
    const withholding = request.withholdingThb || 0
    const commission = request.commissionThb || 0
    const kind = request.kind || 'income' // Default fallback
    
    const totalNet = calculateTotalNet(kind, priceGross, vat, withholding, commission)
    updateData.totalNetThb = ensureCurrencyPrecision(totalNet)
  }

  return updateData
}

// Clean empty strings and convert to null for database
export function cleanRequestData<T extends Record<string, any>>(data: T): T {
  const cleaned = { ...data }
  
  Object.keys(cleaned).forEach(key => {
    if (cleaned[key] === '') {
      (cleaned as any)[key] = null
    }
  })
  
  return cleaned
}

// Validate and sanitize string inputs
export function sanitizeStringInput(input: string | undefined | null): string | null {
  if (!input || typeof input !== 'string') return null
  
  // Trim whitespace and return null if empty
  const trimmed = input.trim()
  return trimmed === '' ? null : trimmed
}

// Transform date strings to Date objects with validation
export function transformDateString(dateString: string | undefined): Date | null {
  if (!dateString) return null
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return null
    
    // Prevent future dates for doc_date
    const now = new Date()
    if (date > now) return null
    
    return date
  } catch {
    return null
  }
}