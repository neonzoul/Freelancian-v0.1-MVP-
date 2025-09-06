import { z } from 'zod'

// Entry validation schemas
export const EntryKindSchema = z.enum(['income', 'expense'])

export const CreateEntrySchema = z.object({
  kind: EntryKindSchema,
  title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters'),
  docDate: z.string().datetime().optional().or(z.literal('')),
  transferDate: z.string().datetime().optional().or(z.literal('')),
  clientName: z.string().max(255).optional().or(z.literal('')),
  vendorName: z.string().max(255).optional().or(z.literal('')),
  productService: z.string().max(255).optional().or(z.literal('')),
  accountName: z.string().max(255).optional().or(z.literal('')),
  priceGrossThb: z.number().nonnegative('Amount must be non-negative').optional(),
  vatThb: z.number().nonnegative('VAT must be non-negative').optional(),
  withholdingThb: z.number().nonnegative('Withholding must be non-negative').optional(),
  commissionThb: z.number().nonnegative('Commission must be non-negative').optional(),
  project: z.string().max(255).optional().or(z.literal('')),
  remark: z.string().max(1000).optional().or(z.literal('')),
  invoiceNo: z.string().max(100).optional().or(z.literal('')),
}).refine((data) => {
  // Business rule: withholding cannot exceed 3% of gross amount
  if (data.priceGrossThb && data.withholdingThb) {
    return data.withholdingThb <= data.priceGrossThb * 0.03
  }
  return true
}, {
  message: 'Withholding cannot exceed 3% of gross amount',
  path: ['withholdingThb'],
}).refine((data) => {
  // Business rule: VAT should not exceed 10% of gross amount (reasonable check)
  if (data.priceGrossThb && data.vatThb) {
    return data.vatThb <= data.priceGrossThb * 0.10
  }
  return true
}, {
  message: 'VAT amount seems unusually high',
  path: ['vatThb'],
})

export const UpdateEntrySchema = z.object({
  id: z.string().cuid('Invalid entry ID'),
  kind: EntryKindSchema.optional(),
  title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters').optional(),
  docDate: z.string().datetime().optional().or(z.literal('')).optional(),
  transferDate: z.string().datetime().optional().or(z.literal('')).optional(),
  clientName: z.string().max(255).optional().or(z.literal('')).optional(),
  vendorName: z.string().max(255).optional().or(z.literal('')).optional(),
  productService: z.string().max(255).optional().or(z.literal('')).optional(),
  accountName: z.string().max(255).optional().or(z.literal('')).optional(),
  priceGrossThb: z.number().nonnegative('Amount must be non-negative').optional(),
  vatThb: z.number().nonnegative('VAT must be non-negative').optional(),
  withholdingThb: z.number().nonnegative('Withholding must be non-negative').optional(),
  commissionThb: z.number().nonnegative('Commission must be non-negative').optional(),
  project: z.string().max(255).optional().or(z.literal('')).optional(),
  remark: z.string().max(1000).optional().or(z.literal('')).optional(),
  invoiceNo: z.string().max(100).optional().or(z.literal('')).optional(),
}).refine((data) => {
  // Business rule: withholding cannot exceed 3% of gross amount
  if (data.priceGrossThb && data.withholdingThb) {
    return data.withholdingThb <= data.priceGrossThb * 0.03
  }
  return true
}, {
  message: 'Withholding cannot exceed 3% of gross amount',
  path: ['withholdingThb'],
}).refine((data) => {
  // Business rule: VAT should not exceed 10% of gross amount (reasonable check)
  if (data.priceGrossThb && data.vatThb) {
    return data.vatThb <= data.priceGrossThb * 0.10
  }
  return true
}, {
  message: 'VAT amount seems unusually high',
  path: ['vatThb'],
})

// Query parameter validation
export const GetEntriesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50).optional(),
  kind: EntryKindSchema.optional(),
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format').optional(),
  search: z.string().max(255).optional(),
  sortBy: z.enum(['docDate', 'totalNetThb', 'title', 'createdAt']).default('docDate').optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),
  clientName: z.string().max(255).optional(),
  vendorName: z.string().max(255).optional(),
}).transform((data) => ({
  page: data.page ?? 1,
  limit: data.limit ?? 50,
  sortBy: data.sortBy ?? 'docDate',
  sortOrder: data.sortOrder ?? 'desc',
  ...data,
}))

// Financial calculation validation
export const FinancialCalculationSchema = z.object({
  priceGross: z.number().nonnegative('Gross price must be non-negative'),
  vatRate: z.number().min(0).max(1).default(0.07), // 7%
  withholdingRate: z.number().min(0).max(1).default(0.03), // 3%
  commissionRate: z.number().min(0).max(1).default(0), // Optional commission
  enableVat: z.boolean().default(true),
  enableWithholding: z.boolean().default(true),
})

// Date validation helpers
export const DateRangeSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
}).refine((data) => {
  return new Date(data.startDate) <= new Date(data.endDate)
}, {
  message: 'Start date must be before or equal to end date',
  path: ['endDate'],
})

// Export types inferred from schemas
export type CreateEntryInput = z.infer<typeof CreateEntrySchema>
export type UpdateEntryInput = z.infer<typeof UpdateEntrySchema>
export type GetEntriesQueryInput = z.infer<typeof GetEntriesQuerySchema>
export type FinancialCalculationInput = z.infer<typeof FinancialCalculationSchema>
export type DateRangeInput = z.infer<typeof DateRangeSchema>