export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  timestamp: string
  requestId: string
}

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

export interface ApiErrorResponse {
  success: false
  error: {
    type: string
    title: string
    status: number
    detail: string
    instance: string
    errors?: Record<string, string[]>
  }
  timestamp: string
  requestId: string
}