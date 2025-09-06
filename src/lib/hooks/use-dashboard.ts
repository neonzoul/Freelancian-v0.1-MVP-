'use client'

import { useQuery } from '@tanstack/react-query'
import type { ApiResponse, DashboardMetrics, PaginatedResponse, EntryResponse } from '@/types'

// Fetch dashboard metrics
async function fetchDashboardMetrics(month?: string): Promise<DashboardMetrics> {
  const url = month 
    ? `/api/reports/dashboard?month=${month}`
    : '/api/reports/dashboard'
  
  const response = await fetch(url)
  
  if (!response.ok) {
    throw new Error(`Failed to fetch dashboard metrics: ${response.statusText}`)
  }
  
  const data: ApiResponse<DashboardMetrics> = await response.json()
  
  if (!data.success) {
    throw new Error('Failed to fetch dashboard metrics')
  }
  
  return data.data
}

// Fetch recent entries for dashboard
async function fetchRecentEntries(limit: number = 10): Promise<EntryResponse[]> {
  const response = await fetch(`/api/entries?limit=${limit}&sortBy=createdAt&sortOrder=desc`)
  
  if (!response.ok) {
    throw new Error(`Failed to fetch recent entries: ${response.statusText}`)
  }
  
  const data: PaginatedResponse<EntryResponse> = await response.json()
  
  if (!data.success) {
    throw new Error('Failed to fetch recent entries')
  }
  
  return data.data
}

// Hook for dashboard metrics
export function useDashboardMetrics(month?: string) {
  return useQuery({
    queryKey: ['dashboard', 'metrics', month],
    queryFn: () => fetchDashboardMetrics(month),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  })
}

// Hook for recent entries
export function useRecentEntries(limit: number = 10) {
  return useQuery({
    queryKey: ['dashboard', 'recent-entries', limit],
    queryFn: () => fetchRecentEntries(limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  })
}