import { NextRequest, NextResponse } from 'next/server'
import { entryRepository } from '@/lib/repositories/entry-repository'
import { calculateMonthlyTotals } from '@/lib/calculations'
import type { ApiResponse, DashboardMetrics } from '@/types'
import { handlePrismaError } from '@/lib/prisma'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID()
  const timestamp = new Date().toISOString()

  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') // Optional YYYY-MM format
    
    let dashboardData: DashboardMetrics

    if (month) {
      // Get specific month data
      const [year, monthNum] = month.split('-').map(Number)
      if (!year || !monthNum || monthNum < 1 || monthNum > 12) {
        return NextResponse.json({
          success: false,
          error: {
            type: 'validation_error',
            title: 'Invalid month format',
            status: 400,
            detail: 'Month must be in YYYY-MM format',
            instance: `/api/reports/dashboard?month=${month}`,
          },
          timestamp,
          requestId,
        }, { status: 400 })
      }

      // Use date range for specific month
      const startDate = new Date(year, monthNum - 1, 1)
      const endDate = new Date(year, monthNum, 0)
      dashboardData = await entryRepository.getDashboardMetrics(startDate, endDate)
    } else {
      // Get current month data using optimized method
      dashboardData = await entryRepository.getCurrentMonthDashboard()
    }

    const response: ApiResponse<DashboardMetrics> = {
      success: true,
      data: dashboardData,
      message: month ? `Dashboard metrics for ${month}` : 'Current month dashboard metrics',
      timestamp,
      requestId,
    }

    // Add caching headers for performance optimization
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600', // 5 minutes cache, 10 minutes stale
    })

    return new NextResponse(JSON.stringify(response), {
      status: 200,
      headers,
    })

  } catch (error) {
    console.error('Dashboard API error:', error)
    
    const { message, code, status } = handlePrismaError(error)

    const errorResponse = {
      success: false,
      error: {
        type: 'server_error',
        title: 'Dashboard data retrieval failed',
        status,
        detail: message,
        instance: '/api/reports/dashboard',
      },
      timestamp,
      requestId,
    }

    return NextResponse.json(errorResponse, { status })
  }
}