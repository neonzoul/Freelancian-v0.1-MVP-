'use client'

import { useState } from 'react'
import { EntryList } from '@/components/entries/EntryList'
import { SearchFilter } from '@/components/entries/SearchFilter'
import { EditEntryPanel } from '@/components/entries/EditEntryPanel'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Button } from '@/components/ui/Button'
import { useEntries, useDeleteEntry } from '@/lib/hooks/use-entries'
import { GetEntriesQuery, EntryResponse } from '@/types'
import { PlusIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function EntriesPage() {
  const [filters, setFilters] = useState<GetEntriesQuery>({
    page: 1,
    limit: 50,
    sortBy: 'docDate',
    sortOrder: 'desc',
  })
  
  const [editingEntry, setEditingEntry] = useState<EntryResponse | null>(null)
  const [deletingEntry, setDeletingEntry] = useState<EntryResponse | null>(null)
  
  const { data: entriesData, isLoading, error } = useEntries(filters)
  const deleteEntryMutation = useDeleteEntry()

  const handleFilterChange = (newFilters: Partial<GetEntriesQuery>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1, // Reset to first page when filters change
    }))
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const handleEditEntry = (entry: EntryResponse) => {
    setEditingEntry(entry)
  }

  const handleDeleteEntry = (entry: EntryResponse) => {
    setDeletingEntry(entry)
  }

  const confirmDelete = async () => {
    if (!deletingEntry) return
    
    try {
      await deleteEntryMutation.mutateAsync(deletingEntry.id)
      setDeletingEntry(null)
    } catch (error) {
      console.error('Failed to delete entry:', error)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">All Entries</h1>
              <p className="text-sm text-neutral-600 mt-1">
                Manage your income and expense entries
              </p>
            </div>
            <Link href="/entries/new">
              <Button className="flex items-center gap-2">
                <PlusIcon className="w-4 h-4" />
                Add Entry
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Search and Filters */}
          <SearchFilter
            filters={filters}
            onFilterChange={handleFilterChange}
            totalEntries={entriesData?.pagination.total || 0}
          />

          {/* Entry List */}
          <EntryList
            entries={entriesData?.data || []}
            pagination={entriesData?.pagination}
            isLoading={isLoading}
            error={error}
            onPageChange={handlePageChange}
            onEditEntry={handleEditEntry}
            onDeleteEntry={handleDeleteEntry}
          />
        </div>
      </div>

      {/* Edit Panel */}
      {editingEntry && (
        <EditEntryPanel
          entry={editingEntry}
          isOpen={!!editingEntry}
          onClose={() => setEditingEntry(null)}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingEntry}
        onClose={() => setDeletingEntry(null)}
        onConfirm={confirmDelete}
        title="Delete Entry"
        message={`Are you sure you want to delete "${deletingEntry?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="danger"
        isLoading={deleteEntryMutation.isPending}
      />
    </div>
  )
}