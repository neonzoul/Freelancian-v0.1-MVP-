'use client'

import { useQuery } from '@tanstack/react-query'
import type { ApiResponse, TrendsResponse } from '@/types'

// Fetch trends data from API
async function fetchTrendsData(months: number, includePercentageChange: boolean = true): Promise<TrendsResponse> {
  const params = new URLSearchParams({
    months: months.toString(),
    includePercentageChange: includePercentageChange.toString(),
  })

  const response = await fetch(`/api/reports/trends?${params}`)
  
  if (!response.ok) {
    throw new Error(`Failed to fetch trends data: ${response.status} ${response.statusText}`)
  }

  const result: ApiResponse<TrendsResponse> = await response.json()
  
  if (!result.success) {
    throw new Error(result.message || 'Failed to fetch trends data')
  }

  return result.data
}

// Hook for fetching trends data with React Query
export function useTrendsData(months: number = 6, includePercentageChange: boolean = true) {
  return useQuery<TrendsResponse>({
    queryKey: ['trends', months, includePercentageChange],
    queryFn: () => fetchTrendsData(months, includePercentageChange),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  })
}