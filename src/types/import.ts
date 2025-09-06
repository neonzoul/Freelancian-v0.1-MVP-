export type ImportStep = 'upload' | 'preview' | 'mapping' | 'processing' | 'results'

export interface ParsedCSVData {
  headers: string[]
  rows: string[][]
  totalRows: number
  previewRows: string[][] // First 5 rows for preview
}

export interface FieldMapping {
  [csvField: string]: string | null // Maps CSV field to our Entry field
}

export interface ImportValidationError {
  row: number
  field: string
  value: string
  error: string
}

export interface ImportResult {
  success: boolean
  imported: number
  skipped: number
  errors: string[]
  summary: {
    totalRows: number
    successfulImports: number
    skippedRows: number
    errorRows: number
    totalIncome?: number
    totalExpenses?: number
    duplicatesSkipped?: number
  }
}

export interface CSVImportRequest {
  file: File
  entryType: 'income' | 'expense'
  mapping: FieldMapping
}

// Notion CSV field mappings (common field names from Notion exports)
export const NOTION_FIELD_MAPPINGS = {
  income: {
    'Title': 'title',
    'Name': 'title',
    'Project': 'title',
    'Client': 'clientName',
    'Client Name': 'clientName',
    'Company': 'clientName',
    'Date': 'docDate',
    'Doc Date': 'docDate',
    'Invoice Date': 'docDate',
    'Transfer Date': 'transferDate',
    'Payment Date': 'transferDate',
    'Amount': 'priceGrossThb',
    'Gross Amount': 'priceGrossThb',
    'Price': 'priceGrossThb',
    'VAT': 'vatThb',
    'VAT Amount': 'vatThb',
    'Withholding': 'withholdingThb',
    'WHT': 'withholdingThb',
    'Withholding Tax': 'withholdingThb',
    'Commission': 'commissionThb',
    'Fee': 'commissionThb',
    'Service': 'productService',
    'Product/Service': 'productService',
    'Description': 'productService',
    'Account': 'accountName',
    'Bank Account': 'accountName',
    'Project Name': 'project',
    'Notes': 'remark',
    'Remark': 'remark',
    'Comments': 'remark',
    'Invoice No': 'invoiceNo',
    'Invoice Number': 'invoiceNo',
    'Reference': 'invoiceNo',
  },
  expense: {
    'Title': 'title',
    'Name': 'title',
    'Expense': 'title',
    'Vendor': 'vendorName',
    'Vendor Name': 'vendorName',
    'Supplier': 'vendorName',
    'Company': 'vendorName',
    'Date': 'docDate',
    'Doc Date': 'docDate',
    'Purchase Date': 'docDate',
    'Transfer Date': 'transferDate',
    'Payment Date': 'transferDate',
    'Amount': 'priceGrossThb',
    'Gross Amount': 'priceGrossThb',
    'Price': 'priceGrossThb',
    'Cost': 'priceGrossThb',
    'VAT': 'vatThb',
    'VAT Amount': 'vatThb',
    'Withholding': 'withholdingThb',
    'WHT': 'withholdingThb',
    'Withholding Tax': 'withholdingThb',
    'Service': 'productService',
    'Product/Service': 'productService',
    'Description': 'productService',
    'Category': 'productService',
    'Account': 'accountName',
    'Bank Account': 'accountName',
    'Project Name': 'project',
    'Project': 'project',
    'Notes': 'remark',
    'Remark': 'remark',
    'Comments': 'remark',
    'Invoice No': 'invoiceNo',
    'Invoice Number': 'invoiceNo',
    'Receipt No': 'invoiceNo',
    'Reference': 'invoiceNo',
  }
}

// Entry field labels for UI
export const ENTRY_FIELD_LABELS = {
  title: 'Title',
  docDate: 'Document Date',
  transferDate: 'Transfer Date',
  clientName: 'Client Name',
  vendorName: 'Vendor Name',
  productService: 'Product/Service',
  accountName: 'Account Name',
  priceGrossThb: 'Gross Amount (THB)',
  vatThb: 'VAT Amount (THB)',
  withholdingThb: 'Withholding Tax (THB)',
  commissionThb: 'Commission (THB)',
  project: 'Project',
  remark: 'Remark',
  invoiceNo: 'Invoice Number',
}

// Required fields for validation
export const REQUIRED_FIELDS = {
  income: ['title'],
  expense: ['title'],
}

// Optional but recommended fields
export const RECOMMENDED_FIELDS = {
  income: ['docDate', 'clientName', 'priceGrossThb'],
  expense: ['docDate', 'vendorName', 'priceGrossThb'],
}