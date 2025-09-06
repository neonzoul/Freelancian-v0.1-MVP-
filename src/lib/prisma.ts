import { PrismaClient, Prisma } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Database connection utilities
export async function connectToDatabase() {
  try {
    await prisma.$connect()
    console.log('✅ Database connected successfully')
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    throw error
  }
}

export async function disconnectFromDatabase() {
  try {
    await prisma.$disconnect()
    console.log('✅ Database disconnected successfully')
  } catch (error) {
    console.error('❌ Database disconnection failed:', error)
    throw error
  }
}

// Database error handling utilities
export function handlePrismaError(error: unknown): {
  message: string
  code: string
  status: number
} {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return {
          message: 'A record with this information already exists',
          code: 'DUPLICATE_RECORD',
          status: 409,
        }
      case 'P2025':
        return {
          message: 'Record not found',
          code: 'NOT_FOUND',
          status: 404,
        }
      case 'P2003':
        return {
          message: 'Foreign key constraint failed',
          code: 'CONSTRAINT_FAILED',
          status: 400,
        }
      default:
        return {
          message: 'Database operation failed',
          code: 'DATABASE_ERROR',
          status: 500,
        }
    }
  }

  if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    return {
      message: 'Unknown database error occurred',
      code: 'UNKNOWN_DATABASE_ERROR',
      status: 500,
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return {
      message: 'Invalid data provided',
      code: 'VALIDATION_ERROR',
      status: 400,
    }
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return {
      message: 'Database connection failed',
      code: 'CONNECTION_ERROR',
      status: 503,
    }
  }

  return {
    message: 'An unexpected error occurred',
    code: 'INTERNAL_ERROR',
    status: 500,
  }
}

// Health check utility
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error('Database health check failed:', error)
    return false
  }
}