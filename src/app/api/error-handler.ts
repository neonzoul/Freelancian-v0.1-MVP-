import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'
import { 
  createErrorResponse, 
  handleZodError, 
  handleDatabaseError, 
  handleGenericError,
  type ApiErrorResponse 
} from '@/lib/api-errors'

// Global API error handler wrapper
export function withErrorHandler<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args)
    } catch (error) {
      console.error('API Error:', error)
      
      // Generate request ID for tracking
      const requestId = generateRequestId()
      
      // Handle different types of errors
      if (error instanceof ZodError) {
        return handleZodError(error, requestId)
      }
      
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        return handleDatabaseError(error, requestId)
      }
      
      if (error instanceof Prisma.PrismaClientValidationError) {
        return NextResponse.json(
          createErrorResponse(
            400,
            'VALIDATION_ERROR',
            'Invalid data format',
            'The provided data does not match the expected format',
            undefined,
            requestId
          ),
          { status: 400 }
        )
      }
      
      if (error instanceof Prisma.PrismaClientInitializationError) {
        return NextResponse.json(
          createErrorResponse(
            503,
            'DATABASE_CONNECTION_ERROR',
            'Database Connection Failed',
            'Unable to connect to the database. Please try again later.',
            undefined,
            requestId
          ),
          { status: 503 }
        )
      }
      
      // Handle custom application errors
      if (error instanceof AppError) {
        return NextResponse.json(
          createErrorResponse(
            error.statusCode,
            error.code,
            error.title,
            error.message,
            error.details,
            requestId
          ),
          { status: error.statusCode }
        )
      }
      
      // Handle generic errors
      return handleGenericError(error, requestId)
    }
  }
}

// Custom application error class
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    public title: string,
    message: string,
    public details?: Record<string, string[]>
  ) {
    super(message)
    this.name = 'AppError'
  }
}

// Specific error types
export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, string[]>) {
    super(400, 'VALIDATION_ERROR', 'Validation Error', message, details)
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const message = id 
      ? `${resource} with ID '${id}' was not found`
      : `${resource} was not found`
    super(404, 'NOT_FOUND', 'Not Found', message)
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, 'CONFLICT', 'Conflict', message)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(401, 'UNAUTHORIZED', 'Unauthorized', message)
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Access denied') {
    super(403, 'FORBIDDEN', 'Forbidden', message)
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(429, 'RATE_LIMITED', 'Rate Limited', message)
  }
}

// Utility functions
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Middleware for request validation
export function validateRequest(schema: any) {
  return async (request: NextRequest) => {
    try {
      const body = await request.json()
      const validatedData = schema.parse(body)
      return validatedData
    } catch (error) {
      if (error instanceof ZodError) {
        throw error
      }
      throw new ValidationError('Invalid request format')
    }
  }
}

// Middleware for query parameter validation
export function validateQuery(schema: any, searchParams: URLSearchParams) {
  try {
    const queryObject = Object.fromEntries(searchParams.entries())
    return schema.parse(queryObject)
  } catch (error) {
    if (error instanceof ZodError) {
      throw error
    }
    throw new ValidationError('Invalid query parameters')
  }
}

// Database operation wrapper with error handling
export async function withDatabaseOperation<T>(
  operation: () => Promise<T>,
  context: string = 'database operation'
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle specific Prisma errors
      switch (error.code) {
        case 'P2002':
          throw new ConflictError('A record with this information already exists')
        case 'P2025':
          throw new NotFoundError('Record')
        case 'P2003':
          throw new ValidationError('Invalid reference to related record')
        case 'P2004':
          throw new ValidationError('Constraint violation in database')
        default:
          throw new AppError(500, 'DATABASE_ERROR', 'Database Error', `Database error during ${context}`)
      }
    }
    
    if (error instanceof Prisma.PrismaClientValidationError) {
      throw new ValidationError('Invalid data provided to database')
    }
    
    if (error instanceof Prisma.PrismaClientInitializationError) {
      throw new AppError(503, 'DATABASE_CONNECTION_ERROR', 'Database Connection Failed', 'Unable to connect to database')
    }
    
    // Re-throw if it's already an AppError
    if (error instanceof AppError) {
      throw error
    }
    
    // Generic database error
    throw new AppError(500, 'DATABASE_ERROR', 'Database Error', `Unexpected error during ${context}`)
  }
}

// Response helpers
export function successResponse<T>(data: T, message?: string): NextResponse {
  return NextResponse.json({
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  })
}

export function paginatedResponse<T>(
  data: T[],
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  },
  baseUrl: string
): NextResponse {
  const { page, limit, total, totalPages, hasNext, hasPrev } = pagination
  
  return NextResponse.json({
    success: true,
    data,
    pagination,
    links: {
      self: `${baseUrl}?page=${page}&limit=${limit}`,
      first: `${baseUrl}?page=1&limit=${limit}`,
      last: `${baseUrl}?page=${totalPages}&limit=${limit}`,
      next: hasNext ? `${baseUrl}?page=${page + 1}&limit=${limit}` : null,
      prev: hasPrev ? `${baseUrl}?page=${page - 1}&limit=${limit}` : null,
    },
    timestamp: new Date().toISOString(),
  })
}

// Health check response
export function healthCheckResponse(checks: Record<string, boolean>): NextResponse {
  const allHealthy = Object.values(checks).every(Boolean)
  const status = allHealthy ? 200 : 503
  
  return NextResponse.json({
    success: allHealthy,
    status: allHealthy ? 'healthy' : 'unhealthy',
    checks,
    timestamp: new Date().toISOString(),
  }, { status })
}