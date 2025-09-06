'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CreateEntryInput, GetEntriesQueryInput } from '@/lib/validations'
import { EntryResponse } from '@/types/entry'
import { ApiResponse, PaginatedResponse } from '@/types/api'

// API functions
async function createEntry(data: CreateEntryInput): Promise<EntryResponse> {
  const response = await fetch('/api/entries', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Failed to create entry')
  }

  const result: ApiResponse<EntryResponse> = await response.json()
  return result.data
}

async function fetchEntries(query: Partial<GetEntriesQueryInput> = {}): Promise<PaginatedResponse<EntryResponse>> {
  const searchParams = new URLSearchParams()
  
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value))
    }
  })

  const response = await fetch(`/api/entries?${searchParams.toString()}`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Failed to fetch entries')
  }

  return response.json()
}

async function fetchEntry(id: string): Promise<EntryResponse> {
  const response = await fetch(`/api/entries/${id}`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Failed to fetch entry')
  }

  const result: ApiResponse<EntryResponse> = await response.json()
  return result.data
}

async function updateEntry(id: string, data: Partial<CreateEntryInput>): Promise<EntryResponse> {
  const response = await fetch(`/api/entries/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ...data, id }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Failed to update entry')
  }

  const result: ApiResponse<EntryResponse> = await response.json()
  return result.data
}

async function deleteEntry(id: string): Promise<void> {
  const response = await fetch(`/api/entries/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Failed to delete entry')
  }
}

// React Query hooks
export function useCreateEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createEntry,
    onSuccess: (newEntry) => {
      // Invalidate and refetch entries list
      queryClient.invalidateQueries({ queryKey: ['entries'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      
      // Optimistically add the new entry to the cache
      queryClient.setQueryData(['entries'], (oldData: any) => {
        if (!oldData) return oldData
        
        return {
          ...oldData,
          data: [newEntry, ...oldData.data],
          pagination: {
            ...oldData.pagination,
            total: oldData.pagination.total + 1,
          },
        }
      })
    },
    onError: (error) => {
      console.error('Failed to create entry:', error)
    },
  })
}

export function useEntries(query: Partial<GetEntriesQueryInput> = {}) {
  return useQuery({
    queryKey: ['entries', query],
    queryFn: () => fetchEntries(query),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  })
}

export function useEntry(id: string) {
  return useQuery({
    queryKey: ['entries', id],
    queryFn: () => fetchEntry(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export function useUpdateEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateEntryInput> }) =>
      updateEntry(id, data),
    onSuccess: (updatedEntry) => {
      // Update the specific entry in cache
      queryClient.setQueryData(['entries', updatedEntry.id], updatedEntry)
      
      // Invalidate entries list to refetch
      queryClient.invalidateQueries({ queryKey: ['entries'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: (error) => {
      console.error('Failed to update entry:', error)
    },
  })
}

export function useDeleteEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteEntry,
    onSuccess: (_, deletedId) => {
      // Remove the entry from cache
      queryClient.removeQueries({ queryKey: ['entries', deletedId] })
      
      // Update entries list cache
      queryClient.setQueryData(['entries'], (oldData: any) => {
        if (!oldData) return oldData
        
        return {
          ...oldData,
          data: oldData.data.filter((entry: EntryResponse) => entry.id !== deletedId),
          pagination: {
            ...oldData.pagination,
            total: Math.max(0, oldData.pagination.total - 1),
          },
        }
      })
      
      // Invalidate dashboard to update metrics
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: (error) => {
      console.error('Failed to delete entry:', error)
    },
  })
}