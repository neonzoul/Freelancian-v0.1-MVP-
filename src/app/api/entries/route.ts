import { NextRequest, NextResponse } from 'next/server'
import { entryRepository } from '@/lib/repositories/entry-repository'
import { GetEntriesQuerySchema, CreateEntrySchema } from '@/lib/validations'
import { transformEntryToResponse, transformCreateRequestToPrisma } from '@/lib/transformers'
import {
  createSuccessResponse,
  createPaginatedResponse,
  handleZodError,
  handleDatabaseError,
  handleGenericError,
  createMethodNotAllowedError,
} from '@/lib/api-errors'

// GET /api/entries - List entries with filtering and pagination
export async function GET(request: NextRequest) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse and validate query parameters
    const queryParams = {
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      kind: searchParams.get('kind'),
      month: searchParams.get('month'),
      search: searchParams.get('search'),
      sortBy: searchParams.get('sortBy'),
      sortOrder: searchParams.get('sortOrder'),
      clientName: searchParams.get('clientName'),
      vendorName: searchParams.get('vendorName'),
    }

    // Remove null values
    const cleanParams = Object.fromEntries(
      Object.entries(queryParams).filter(([_, value]) => value !== null)
    )

    const validatedQuery = GetEntriesQuerySchema.parse(cleanParams)
    
    // Fetch entries from repository
    const result = await entryRepository.findMany(validatedQuery)
    
    // Transform entries to API response format
    const transformedEntries = result.entries.map(transformEntryToResponse)
    
    // Create paginated response
    const baseUrl = new URL(request.url).origin + '/api/entries'
    const response = createPaginatedResponse(
      transformedEntries,
      {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
        hasNext: result.hasMore,
        hasPrev: result.page > 1,
      },
      baseUrl,
      requestId
    )

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return handleZodError(error as any, requestId)
    }
    
    // Check if it's a database error
    if (error && typeof error === 'object' && 'code' in error) {
      return handleDatabaseError(error, requestId)
    }
    
    return handleGenericError(error, requestId)
  }
}

// POST /api/entries - Create new entry
export async function POST(request: NextRequest) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  try {
    const body = await request.json()
    
    // Validate request body
    const validatedData = CreateEntrySchema.parse(body)
    
    // Transform to Prisma format
    const prismaData = transformCreateRequestToPrisma(validatedData)
    
    // Create entry in database
    const createdEntry = await entryRepository.create(prismaData)
    
    // Transform to API response format
    const responseEntry = transformEntryToResponse(createdEntry)
    
    // Create success response
    const response = createSuccessResponse(
      responseEntry,
      'Entry created successfully',
      requestId
    )

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return handleZodError(error as any, requestId)
    }
    
    // Check if it's a database error
    if (error && typeof error === 'object' && 'code' in error) {
      return handleDatabaseError(error, requestId)
    }
    
    return handleGenericError(error, requestId)
  }
}

// Handle unsupported methods
export async function PUT() {
  return createMethodNotAllowedError('PUT', ['GET', 'POST'])
}

export async function DELETE() {
  return createMethodNotAllowedError('DELETE', ['GET', 'POST'])
}

export async function PATCH() {
  return createMethodNotAllowedError('PATCH', ['GET', 'POST'])
}