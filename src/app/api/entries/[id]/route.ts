import { NextRequest, NextResponse } from 'next/server'
import { entryRepository } from '@/lib/repositories/entry-repository'
import { UpdateEntrySchema } from '@/lib/validations'
import { transformEntryToResponse, transformUpdateRequestToPrisma } from '@/lib/transformers'
import {
  createSuccessResponse,
  createNotFoundError,
  handleZodError,
  handleDatabaseError,
  handleGenericError,
  createMethodNotAllowedError,
} from '@/lib/api-errors'

interface RouteParams {
  params: {
    id: string
  }
}

// GET /api/entries/[id] - Get single entry by ID
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  try {
    const { id } = params
    
    // Validate ID format (basic CUID validation)
    if (!id || typeof id !== 'string' || id.length < 10) {
      return createNotFoundError('Entry', id, requestId)
    }
    
    // Fetch entry from database
    const entry = await entryRepository.findById(id)
    
    if (!entry) {
      return createNotFoundError('Entry', id, requestId)
    }
    
    // Transform to API response format
    const responseEntry = transformEntryToResponse(entry)
    
    // Create success response
    const response = createSuccessResponse(
      responseEntry,
      undefined,
      requestId
    )

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    // Check if it's a database error
    if (error && typeof error === 'object' && 'code' in error) {
      return handleDatabaseError(error, requestId)
    }
    
    return handleGenericError(error, requestId)
  }
}

// PUT /api/entries/[id] - Update entire entry
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  try {
    const { id } = params
    
    // Validate ID format
    if (!id || typeof id !== 'string' || id.length < 10) {
      return createNotFoundError('Entry', id, requestId)
    }
    
    // Check if entry exists
    const existingEntry = await entryRepository.findById(id)
    if (!existingEntry) {
      return createNotFoundError('Entry', id, requestId)
    }
    
    const body = await request.json()
    
    // Add ID to body for validation
    const bodyWithId = { ...body, id }
    
    // Validate request body
    const validatedData = UpdateEntrySchema.parse(bodyWithId)
    
    // Remove ID from validated data (not needed for update)
    const { id: _, ...updateData } = validatedData
    
    // Transform to Prisma format
    const prismaData = transformUpdateRequestToPrisma(updateData)
    
    // Update entry in database
    const updatedEntry = await entryRepository.update(id, prismaData)
    
    // Transform to API response format
    const responseEntry = transformEntryToResponse(updatedEntry)
    
    // Create success response
    const response = createSuccessResponse(
      responseEntry,
      'Entry updated successfully',
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

// PATCH /api/entries/[id] - Partial update entry
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  try {
    const { id } = params
    
    // Validate ID format
    if (!id || typeof id !== 'string' || id.length < 10) {
      return createNotFoundError('Entry', id, requestId)
    }
    
    // Check if entry exists
    const existingEntry = await entryRepository.findById(id)
    if (!existingEntry) {
      return createNotFoundError('Entry', id, requestId)
    }
    
    const body = await request.json()
    
    // Add ID to body for validation
    const bodyWithId = { ...body, id }
    
    // Validate request body (partial update)
    const validatedData = UpdateEntrySchema.parse(bodyWithId)
    
    // Remove ID from validated data
    const { id: _, ...updateData } = validatedData
    
    // Transform to Prisma format
    const prismaData = transformUpdateRequestToPrisma(updateData)
    
    // Update entry in database
    const updatedEntry = await entryRepository.update(id, prismaData)
    
    // Transform to API response format
    const responseEntry = transformEntryToResponse(updatedEntry)
    
    // Create success response
    const response = createSuccessResponse(
      responseEntry,
      'Entry updated successfully',
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

// DELETE /api/entries/[id] - Delete entry
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  try {
    const { id } = params
    
    // Validate ID format
    if (!id || typeof id !== 'string' || id.length < 10) {
      return createNotFoundError('Entry', id, requestId)
    }
    
    // Check if entry exists
    const existingEntry = await entryRepository.findById(id)
    if (!existingEntry) {
      return createNotFoundError('Entry', id, requestId)
    }
    
    // Delete entry from database
    await entryRepository.delete(id)
    
    // Create success response with no content
    const response = createSuccessResponse(
      null,
      'Entry deleted successfully',
      requestId
    )

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    // Check if it's a database error
    if (error && typeof error === 'object' && 'code' in error) {
      return handleDatabaseError(error, requestId)
    }
    
    return handleGenericError(error, requestId)
  }
}

// Handle unsupported methods
export async function POST() {
  return createMethodNotAllowedError('POST', ['GET', 'PUT', 'PATCH', 'DELETE'])
}