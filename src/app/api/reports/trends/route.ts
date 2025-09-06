import { NextRequest, NextResponse } from 'next/server'
import { entryRepository } from '@/lib/repositories/entry-repository'
import { calculatePercentageChange } from '@/lib/calculations'
import type { ApiResponse, MonthlyTrend, TrendsResponse } from '@/types'
import { handlePrismaError } from '@/lib/prisma'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID()
  const timestamp = new Date().toISOString()

  try {
    const { searchParams } = new URL(request.url)
    const monthsParam = searchParams.get('months')
    const includePercentageChange = searchParams.get('includePercentageChange') === 'true'
    
    // Default to 6 months, max 24 months for performance
    let months = 6
    if (monthsParam) {
      const parsedMonths = parseInt(monthsParam, 10)
      if (isNaN(parsedMonths) || parsedMonths < 1 || parsedMonths > 24) {
        return NextResponse.json({
          success: false,
          error: {
            type: 'validation_error',
            title: 'Invalid months parameter',
            status: 400,
            detail: 'Months must be a number between 1 and 24',
            instance: `/api/reports/trends?months=${monthsParam}`,
          },
          timestamp,
          requestId,
        }, { status: 400 })
      }
      months = parsedMonths
    }

    // Get trend data from repository using optimized aggregation
    const trendData = await entryRepository.getMonthlyAggregates(months)

    // Add percentage changes if requested
    let enhancedTrendData = trendData
    if (includePercentageChange && trendData.length > 1) {
      enhancedTrendData = trendData.map((current, index) => {
        if (index === 0) {
          return {
            ...current,
            percentageChanges: {
              income: 0,
              expenses: 0,
              net: 0,
            },
          }
        }

        const previous = trendData[index - 1]
        return {
          ...current,
          percentageChanges: {
            income: calculatePercentageChange(current.totalIncome, previous.totalIncome),
            expenses: calculatePercentageChange(current.totalExpenses, previous.totalExpenses),
            net: calculatePercentageChange(current.netAmount, previous.netAmount),
          },
        }
      })
    }

    // Calculate summary statistics
    const summary = {
      totalMonths: trendData.length,
      averageIncome: trendData.length > 0 
        ? Math.round((trendData.reduce((sum, month) => sum + month.totalIncome, 0) / trendData.length) * 100) / 100
        : 0,
      averageExpenses: trendData.length > 0
        ? Math.round((trendData.reduce((sum, month) => sum + month.totalExpenses, 0) / trendData.length) * 100) / 100
        : 0,
      averageNet: trendData.length > 0
        ? Math.round((trendData.reduce((sum, month) => sum + month.netAmount, 0) / trendData.length) * 100) / 100
        : 0,
      totalEntries: trendData.reduce((sum, month) => sum + month.entryCount, 0),
    }

    const response: ApiResponse<TrendsResponse> = {
      success: true,
      data: {
        trends: enhancedTrendData,
        summary,
      },
      message: `Trend data for the last ${months} months`,
      timestamp,
      requestId,
    }

    // Add caching headers for performance optimization
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200', // 10 minutes cache, 20 minutes stale
    })

    return new NextResponse(JSON.stringify(response), {
      status: 200,
      headers,
    })

  } catch (error) {
    console.error('Trends API error:', error)
    
    const { message, code, status } = handlePrismaError(error)

    const errorResponse = {
      success: false,
      error: {
        type: 'server_error',
        title: 'Trend data retrieval failed',
        status,
        detail: message,
        instance: '/api/reports/trends',
      },
      timestamp,
      requestId,
    }

    return NextResponse.json(errorResponse, { status })
  }
}