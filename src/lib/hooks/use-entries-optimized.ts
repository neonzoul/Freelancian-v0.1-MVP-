'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/components/ui/Toast'
import type { 
  EntryResponse, 
  CreateEntryRequest, 
  UpdateEntryRequest,
  PaginatedResponse,
  ApiResponse 
} from '@/types'

// API functions
async function createEntry(data: CreateEntryRequest): Promise<EntryResponse> {
  const response = await fetch('/api/entries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  
  if (!response.ok) {
    throw new Error(`Failed to create entry: ${response.statusText}`)
  }
  
  const result: ApiResponse<EntryResponse> = await response.json()
  if (!result.success) {
    throw new Error('Failed to create entry')
  }
  
  return result.data
}

async function updateEntry(data: UpdateEntryRequest): Promise<EntryResponse> {
  const response = await fetch(`/api/entries/${data.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  
  if (!response.ok) {
    throw new Error(`Failed to update entry: ${response.statusText}`)
  }
  
  const result: ApiResponse<EntryResponse> = await response.json()
  if (!result.success) {
    throw new Error('Failed to update entry')
  }
  
  return result.data
}

async function deleteEntry(id: string): Promise<void> {
  const response = await fetch(`/api/entries/${id}`, {
    method: 'DELETE',
  })
  
  if (!response.ok) {
    throw new Error(`Failed to delete entry: ${response.statusText}`)
  }
}

// Optimistic create entry hook
export function useCreateEntryOptimistic() {
  const queryClient = useQueryClient()
  const { success, error } = useToast()
  
  return useMutation({
    mutationFn: createEntry,
    
    // Optimistic update
    onMutate: async (newEntry) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['entries'] })
      await queryClient.cancelQueries({ queryKey: ['dashboard'] })
      
      // Snapshot previous values
      const previousEntries = queryClient.getQueryData(['entries'])
      const previousDashboard = queryClient.getQueryData(['dashboard'])
      
      // Create optimistic entry
      const optimisticEntry: EntryResponse = {
        id: `temp-${Date.now()}`,
        ...newEntry,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        totalNetThb: calculateTotalNet(newEntry),
      }
      
      // Optimistically update entries list
      queryClient.setQueryData(['entries'], (old: any) => {
        if (!old) return { data: [optimisticEntry], pagination: { total: 1 } }
        return {
          ...old,
          data: [optimisticEntry, ...old.data],
          pagination: {
            ...old.pagination,
            total: old.pagination.total + 1,
          },
        }
      })
      
      // Optimistically update dashboard metrics
      queryClient.setQueryData(['dashboard', 'metrics'], (old: any) => {
        if (!old) return old
        
        const isIncome = newEntry.kind === 'income'
        const amount = optimisticEntry.totalNetThb || 0
        
        return {
          ...old,
          totalIncome: isIncome ? old.totalIncome + amount : old.totalIncome,
          totalExpenses: !isIncome ? old.totalExpenses + Math.abs(amount) : old.totalExpenses,
          netAmount: old.netAmount + (isIncome ? amount : -Math.abs(amount)),
          entryCount: {
            ...old.entryCount,
            [newEntry.kind]: old.entryCount[newEntry.kind] + 1,
            total: old.entryCount.total + 1,
          },
        }
      })
      
      // Optimistically update recent entries
      queryClient.setQueryData(['dashboard', 'recent-entries'], (old: any) => {
        if (!old) return [optimisticEntry]
        return [optimisticEntry, ...old.slice(0, 9)] // Keep only 10 recent entries
      })
      
      return { previousEntries, previousDashboard, optimisticEntry }
    },
    
    // On success, replace optimistic data with real data
    onSuccess: (data, variables, context) => {
      // Replace optimistic entry with real entry
      queryClient.setQueryData(['entries'], (old: any) => {
        if (!old) return old
        return {
          ...old,
          data: old.data.map((entry: EntryResponse) =>
            entry.id === context?.optimisticEntry.id ? data : entry
          ),
        }
      })
      
      // Invalidate to get fresh data
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      
      success('Entry created successfully')
    },
    
    // On error, rollback optimistic updates
    onError: (err, variables, context) => {
      if (context?.previousEntries) {
        queryClient.setQueryData(['entries'], context.previousEntries)
      }
      if (context?.previousDashboard) {
        queryClient.setQueryData(['dashboard'], context.previousDashboard)
      }
      
      error('Failed to create entry. Please try again.')
    },
    
    // Always refetch after mutation
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['entries'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

// Optimistic update entry hook
export function useUpdateEntryOptimistic() {
  const queryClient = useQueryClient()
  const { success, error } = useToast()
  
  return useMutation({
    mutationFn: updateEntry,
    
    onMutate: async (updatedEntry) => {
      await queryClient.cancelQueries({ queryKey: ['entries'] })
      await queryClient.cancelQueries({ queryKey: ['dashboard'] })
      
      const previousEntries = queryClient.getQueryData(['entries'])
      const previousDashboard = queryClient.getQueryData(['dashboard'])
      
      // Optimistically update entries list
      queryClient.setQueryData(['entries'], (old: any) => {
        if (!old) return old
        return {
          ...old,
          data: old.data.map((entry: EntryResponse) =>
            entry.id === updatedEntry.id 
              ? { ...entry, ...updatedEntry, updatedAt: new Date().toISOString() }
              : entry
          ),
        }
      })
      
      return { previousEntries, previousDashboard }
    },
    
    onSuccess: () => {
      success('Entry updated successfully')
    },
    
    onError: (err, variables, context) => {
      if (context?.previousEntries) {
        queryClient.setQueryData(['entries'], context.previousEntries)
      }
      if (context?.previousDashboard) {
        queryClient.setQueryData(['dashboard'], context.previousDashboard)
      }
      
      error('Failed to update entry. Please try again.')
    },
    
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['entries'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

// Optimistic delete entry hook
export function useDeleteEntryOptimistic() {
  const queryClient = useQueryClient()
  const { success, error } = useToast()
  
  return useMutation({
    mutationFn: deleteEntry,
    
    onMutate: async (entryId) => {
      await queryClient.cancelQueries({ queryKey: ['entries'] })
      await queryClient.cancelQueries({ queryKey: ['dashboard'] })
      
      const previousEntries = queryClient.getQueryData(['entries'])
      const previousDashboard = queryClient.getQueryData(['dashboard'])
      
      // Find the entry being deleted for dashboard calculations
      let deletedEntry: EntryResponse | null = null
      
      // Optimistically remove from entries list
      queryClient.setQueryData(['entries'], (old: any) => {
        if (!old) return old
        
        const filteredData = old.data.filter((entry: EntryResponse) => {
          if (entry.id === entryId) {
            deletedEntry = entry
            return false
          }
          return true
        })
        
        return {
          ...old,
          data: filteredData,
          pagination: {
            ...old.pagination,
            total: old.pagination.total - 1,
          },
        }
      })
      
      // Optimistically update dashboard metrics
      if (deletedEntry) {
        queryClient.setQueryData(['dashboard', 'metrics'], (old: any) => {
          if (!old) return old
          
          const isIncome = deletedEntry!.kind === 'income'
          const amount = deletedEntry!.totalNetThb || 0
          
          return {
            ...old,
            totalIncome: isIncome ? old.totalIncome - amount : old.totalIncome,
            totalExpenses: !isIncome ? old.totalExpenses - Math.abs(amount) : old.totalExpenses,
            netAmount: old.netAmount - (isIncome ? amount : -Math.abs(amount)),
            entryCount: {
              ...old.entryCount,
              [deletedEntry!.kind]: old.entryCount[deletedEntry!.kind] - 1,
              total: old.entryCount.total - 1,
            },
          }
        })
        
        // Remove from recent entries
        queryClient.setQueryData(['dashboard', 'recent-entries'], (old: any) => {
          if (!old) return old
          return old.filter((entry: EntryResponse) => entry.id !== entryId)
        })
      }
      
      return { previousEntries, previousDashboard, deletedEntry }
    },
    
    onSuccess: () => {
      success('Entry deleted successfully')
    },
    
    onError: (err, variables, context) => {
      if (context?.previousEntries) {
        queryClient.setQueryData(['entries'], context.previousEntries)
      }
      if (context?.previousDashboard) {
        queryClient.setQueryData(['dashboard'], context.previousDashboard)
      }
      
      error('Failed to delete entry. Please try again.')
    },
    
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['entries'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

// Helper function to calculate total net amount
function calculateTotalNet(entry: CreateEntryRequest): number {
  const gross = entry.priceGrossThb || 0
  const vat = entry.vatThb || 0
  const withholding = entry.withholdingThb || 0
  const commission = entry.commissionThb || 0
  
  if (entry.kind === 'income') {
    return gross + vat - withholding - commission
  } else {
    return gross + vat - withholding
  }
}

// Background sync hook for offline support
export function useBackgroundSync() {
  const queryClient = useQueryClient()
  
  return {
    syncWhenOnline: () => {
      // Refetch all queries when coming back online
      queryClient.refetchQueries({ type: 'active' })
    },
    
    prefetchCriticalData: () => {
      // Prefetch critical data for offline use
      queryClient.prefetchQuery({
        queryKey: ['dashboard', 'metrics'],
        staleTime: 10 * 60 * 1000, // 10 minutes
      })
      
      queryClient.prefetchQuery({
        queryKey: ['dashboard', 'recent-entries', 10],
        staleTime: 5 * 60 * 1000, // 5 minutes
      })
    },
  }
}