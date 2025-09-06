import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createSuccessResponse, handleGenericError } from '@/lib/api-errors'
import type { ParsedCSVData } from '@/types/import'

// Validation schema for preview request
const PreviewRequestSchema = z.object({
  file: z.instanceof(File),
  entryType: z.enum(['income', 'expense']),
})

export async function POST(request: NextRequest) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const entryType = formData.get('entryType') as string

    // Validate request
    const validatedData = PreviewRequestSchema.parse({
      file,
      entryType,
    })

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      return NextResponse.json({
        success: false,
        error: {
          type: 'validation_error',
          title: 'Invalid File Type',
          status: 400,
          detail: 'Only CSV files are supported',
          instance: `/api/import/preview`,
        },
        timestamp: new Date().toISOString(),
        requestId,
      }, { status: 400 })
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({
        success: false,
        error: {
          type: 'validation_error',
          title: 'File Too Large',
          status: 400,
          detail: 'File size must be less than 10MB',
          instance: `/api/import/preview`,
        },
        timestamp: new Date().toISOString(),
        requestId,
      }, { status: 400 })
    }

    // Parse CSV file
    const text = await file.text()
    const lines = text.split('\n').filter(line => line.trim())
    
    if (lines.length < 2) {
      return NextResponse.json({
        success: false,
        error: {
          type: 'validation_error',
          title: 'Invalid CSV Format',
          status: 400,
          detail: 'CSV file must have at least a header row and one data row',
          instance: `/api/import/preview`,
        },
        timestamp: new Date().toISOString(),
        requestId,
      }, { status: 400 })
    }

    // Simple CSV parsing (handles basic CSV format)
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
    
    const parsedData: ParsedCSVData = {
      headers,
      rows: dataRows,
      totalRows: dataRows.length,
      previewRows: dataRows.slice(0, 5), // First 5 rows for preview
    }

    const response = createSuccessResponse(
      parsedData,
      'CSV file parsed successfully',
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
      instance: '/api/import/preview',
    },
    timestamp: new Date().toISOString(),
    requestId: `req_${Date.now()}`,
  }, { status: 405 })
}