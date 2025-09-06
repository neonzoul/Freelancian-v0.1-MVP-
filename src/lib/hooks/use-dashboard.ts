'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
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

// Hook for dashboard metrics with optimized caching
export function useDashboardMetrics(month?: string) {
  return useQuery({
    queryKey: ['dashboard', 'metrics', month],
    queryFn: () => fetchDashboardMetrics(month),
    staleTime: month ? 30 * 60 * 1000 : 5 * 60 * 1000, // Historical data: 30 min, current: 5 min
    gcTime: month ? 60 * 60 * 1000 : 10 * 60 * 1000, // Historical data: 1 hour, current: 10 min
    refetchOnWindowFocus: false,
    // Enable background refetching for current month only
    refetchInterval: !month ? 5 * 60 * 1000 : false, // Refresh current month every 5 minutes
    refetchIntervalInBackground: false,
    // Prefetch related data
    select: (data) => {
      // Transform data if needed
      return data
    },
  })
}

// Hook for recent entries with intelligent caching
export function useRecentEntries(limit: number = 10) {
  return useQuery({
    queryKey: ['dashboard', 'recent-entries', limit],
    queryFn: () => fetchRecentEntries(limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    // Keep previous data while fetching new data
    placeholderData: (previousData) => previousData,
    // Transform and optimize data
    select: (data) => {
      // Sort by date to ensure consistency
      return data.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    },
  })
}

// Prefetch function for dashboard data
export function usePrefetchDashboard() {
  const queryClient = useQueryClient()
  
  return {
    prefetchMetrics: (month?: string) => {
      queryClient.prefetchQuery({
        queryKey: ['dashboard', 'metrics', month],
        queryFn: () => fetchDashboardMetrics(month),
        staleTime: 5 * 60 * 1000,
      })
    },
    prefetchRecentEntries: (limit: number = 10) => {
      queryClient.prefetchQuery({
        queryKey: ['dashboard', 'recent-entries', limit],
        queryFn: () => fetchRecentEntries(limit),
        staleTime: 2 * 60 * 1000,
      })
    },
  }
}

// Invalidate dashboard data when entries change
export function useInvalidateDashboard() {
  const queryClient = useQueryClient()
  
  return {
    invalidateMetrics: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'metrics'] })
    },
    invalidateRecentEntries: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'recent-entries'] })
    },
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  }
}