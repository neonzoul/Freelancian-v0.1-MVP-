import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { handlePrismaError } from './prisma'

// RFC 7807 Problem Details for HTTP APIs
export interface ApiErrorResponse {
  success: false
  error: {
    type: string           // URI identifying the problem type
    title: string          // Human-readable summary
    status: number         // HTTP status code
    detail: string         // Human-readable explanation
    instance: string       // URI identifying specific occurrence
    errors?: Record<string, string[]> // Validation errors
  }
  timestamp: string
  requestId: string
}

// Standard API Response envelope
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  timestamp: string
  requestId: string
}

// Paginated response
export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  links: {
    self: string
    first: string
    last: string
    next?: string
    prev?: string
  }
  timestamp: string
  requestId: string
}

// Generate unique request ID
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Create success response
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  requestId?: string
): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
    requestId: requestId || generateRequestId(),
  }
}

// Create paginated response
export function createPaginatedResponse<T>(
  data: T[],
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  },
  baseUrl: string,
  requestId?: string
): PaginatedResponse<T> {
  const { page, limit, totalPages } = pagination
  
  return {
    success: true,
    data,
    pagination,
    links: {
      self: `${baseUrl}?page=${page}&limit=${limit}`,
      first: `${baseUrl}?page=1&limit=${limit}`,
      last: `${baseUrl}?page=${totalPages}&limit=${limit}`,
      next: pagination.hasNext ? `${baseUrl}?page=${page + 1}&limit=${limit}` : undefined,
      prev: pagination.hasPrev ? `${baseUrl}?page=${page - 1}&limit=${limit}` : undefined,
    },
    timestamp: new Date().toISOString(),
    requestId: requestId || generateRequestId(),
  }
}

// Create error response
export function createErrorResponse(
  status: number,
  title: string,
  detail: string,
  type: string = 'about:blank',
  instance: string = '',
  errors?: Record<string, string[]>,
  requestId?: string
): ApiErrorResponse {
  return {
    success: false,
    error: {
      type,
      title,
      status,
      detail,
      instance,
      errors,
    },
    timestamp: new Date().toISOString(),
    requestId: requestId || generateRequestId(),
  }
}

// Handle Zod validation errors
export function handleZodError(error: ZodError, requestId?: string): NextResponse<ApiErrorResponse> {
  const errors: Record<string, string[]> = {}
  
  error.issues.forEach((issue) => {
    const path = issue.path.join('.')
    if (!errors[path]) {
      errors[path] = []
    }
    errors[path].push(issue.message)
  })

  const errorResponse = createErrorResponse(
    400,
    'Validation Error',
    'The request contains invalid data',
    'https://freelancian.com/errors/validation-error',
    '',
    errors,
    requestId
  )

  return NextResponse.json(errorResponse, { status: 400 })
}

// Handle database errors
export function handleDatabaseError(error: unknown, requestId?: string): NextResponse<ApiErrorResponse> {
  const { message, code, status } = handlePrismaError(error)
  
  const errorResponse = createErrorResponse(
    status,
    'Database Error',
    message,
    `https://freelancian.com/errors/${code.toLowerCase().replace('_', '-')}`,
    '',
    undefined,
    requestId
  )

  return NextResponse.json(errorResponse, { status })
}

// Handle generic errors
export function handleGenericError(
  error: unknown,
  requestId?: string
): NextResponse<ApiErrorResponse> {
  console.error('Unhandled API error:', error)
  
  const errorResponse = createErrorResponse(
    500,
    'Internal Server Error',
    'An unexpected error occurred',
    'https://freelancian.com/errors/internal-server-error',
    '',
    undefined,
    requestId
  )

  return NextResponse.json(errorResponse, { status: 500 })
}

// Not found error
export function createNotFoundError(
  resource: string,
  id?: string,
  requestId?: string
): NextResponse<ApiErrorResponse> {
  const detail = id 
    ? `${resource} with ID '${id}' was not found`
    : `${resource} not found`
    
  const errorResponse = createErrorResponse(
    404,
    'Not Found',
    detail,
    'https://freelancian.com/errors/not-found',
    '',
    undefined,
    requestId
  )

  return NextResponse.json(errorResponse, { status: 404 })
}

// Method not allowed error
export function createMethodNotAllowedError(
  method: string,
  allowed: string[],
  requestId?: string
): NextResponse<ApiErrorResponse> {
  const errorResponse = createErrorResponse(
    405,
    'Method Not Allowed',
    `HTTP method ${method} is not allowed for this endpoint`,
    'https://freelancian.com/errors/method-not-allowed',
    '',
    undefined,
    requestId
  )

  const response = NextResponse.json(errorResponse, { status: 405 })
  response.headers.set('Allow', allowed.join(', '))
  return response
}

// Rate limit error
export function createRateLimitError(requestId?: string): NextResponse<ApiErrorResponse> {
  const errorResponse = createErrorResponse(
    429,
    'Too Many Requests',
    'Rate limit exceeded. Please try again later.',
    'https://freelancian.com/errors/rate-limit-exceeded',
    '',
    undefined,
    requestId
  )

  return NextResponse.json(errorResponse, { status: 429 })
}

// Middleware to catch and handle errors
export function withErrorHandling<T extends any[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R | NextResponse<ApiErrorResponse>> => {
    const requestId = generateRequestId()
    
    try {
      return await handler(...args)
    } catch (error) {
      if (error instanceof ZodError) {
        return handleZodError(error, requestId)
      }
      
      // Check if it's a Prisma error
      if (error && typeof error === 'object' && 'code' in error) {
        return handleDatabaseError(error, requestId)
      }
      
      return handleGenericError(error, requestId)
    }
  }
}