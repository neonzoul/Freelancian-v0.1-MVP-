import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { entryRepository } from '@/lib/repositories/entry-repository'
import { CreateEntrySchema } from '@/lib/validations'
import { transformCreateRequestToPrisma } from '@/lib/transformers'
import { createSuccessResponse, handleGenericError } from '@/lib/api-errors'
import type { FieldMapping, ImportResult, ImportValidationError } from '@/types/import'

// Validation schema for import request
const ImportRequestSchema = z.object({
  file: z.instanceof(File),
  entryType: z.enum(['income', 'expense']),
  mapping: z.string().transform((str) => JSON.parse(str) as FieldMapping),
})

export async function POST(request: NextRequest) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const entryType = formData.get('entryType') as string
    const mappingStr = formData.get('mapping') as string

    // Validate request
    const validatedData = ImportRequestSchema.parse({
      file,
      entryType,
      mapping: mappingStr,
    })

    const { mapping } = validatedData

    // Parse CSV file
    const text = await file.text()
    const lines = text.split('\n').filter(line => line.trim())
    
    if (lines.length < 2) {
      throw new Error('CSV file must have at least a header row and one data row')
    }

    // Simple CSV parsing
    const parseCSVLine = (line: string): string[] => {
      const result = []
      let current = ''
      let inQuotes = false
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
      
      result.push(current.trim())
      return result
    }

    const rows = lines.map(parseCSVLine)
    const headers = rows[0]
    const dataRows = rows.slice(1)

    // Process each row
    const errors: ImportValidationError[] = []
    const createdEntries = []
    let successCount = 0
    let errorCount = 0
    let skippedCount = 0
    let totalIncome = 0
    let totalExpenses = 0

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i]
      const rowNumber = i + 2 // +2 because we skip header and arrays are 0-indexed

      // Map CSV row to entry data
      const entryData: any = {
        kind: entryType,
      }

      try {
        // Apply field mapping
        headers.forEach((header, index) => {
          const mappedField = mapping[header]
          if (mappedField && row[index]) {
            let value = row[index].trim()
            
            // Handle different data types
            if (mappedField.includes('Thb') || mappedField === 'priceGrossThb') {
              // Parse numeric values
              const numericValue = parseFloat(value.replace(/[^\d.-]/g, ''))
              if (!isNaN(numericValue)) {
                entryData[mappedField] = numericValue
              }
            } else if (mappedField.includes('Date')) {
              // Parse dates
              if (value) {
                const date = new Date(value)
                if (!isNaN(date.getTime())) {
                  entryData[mappedField] = date.toISOString()
                }
              }
            } else {
              // String values
              if (value) {
                entryData[mappedField] = value
              }
            }
          }
        })

        // Validate entry data
        const validatedEntry = CreateEntrySchema.parse(entryData)
        
        // Transform to Prisma format
        const prismaData = transformCreateRequestToPrisma(validatedEntry)
        
        // Create entry in database
        const createdEntry = await entryRepository.create(prismaData)
        createdEntries.push(createdEntry)
        successCount++

        // Track financial totals
        if (createdEntry.totalNetThb) {
          if (entryType === 'income') {
            totalIncome += Number(createdEntry.totalNetThb)
          } else {
            totalExpenses += Number(createdEntry.totalNetThb)
          }
        }

      } catch (error) {
        errorCount++
        
        if (error instanceof z.ZodError) {
          // Handle validation errors
          error.errors.forEach(err => {
            errors.push({
              row: rowNumber,
              field: err.path.join('.'),
              value: err.path.reduce((obj, path) => obj?.[path], entryData) || '',
              error: err.message,
            })
          })
        } else {
          // Handle other errors
          errors.push({
            row: rowNumber,
            field: 'general',
            value: row.join(', '),
            error: error instanceof Error ? error.message : 'Unknown error occurred',
          })
        }
      }
    }

    // Create import result
    const result: ImportResult = {
      success: errorCount === 0,
      imported: successCount,
      skipped: skippedCount,
      errors: errors.slice(0, 100).map(err => `Row ${err.row}: ${err.error}`), // Limit errors to first 100
      summary: {
        totalRows: dataRows.length,
        successfulImports: successCount,
        skippedRows: skippedCount,
        errorRows: errorCount,
        totalIncome: totalIncome > 0 ? totalIncome : undefined,
        totalExpenses: totalExpenses > 0 ? totalExpenses : undefined,
        duplicatesSkipped: skippedCount,
      },
    }

    const response = createSuccessResponse(
      result,
      `Import completed: ${successCount} successful, ${errorCount} errors`,
      requestId
    )

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    return handleGenericError(error, requestId)
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json({
    success: false,
    error: {
      type: 'method_not_allowed',
      title: 'Method Not Allowed',
      status: 405,
      detail: 'GET method is not supported for this endpoint',
      instance: '/api/import/execute',
    },
    timestamp: new Date().toISOString(),
    requestId: `req_${Date.now()}`,
  }, { status: 405 })
}