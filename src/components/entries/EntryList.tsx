'use client'

import { EntryResponse } from '@/types'
import { EntryCard } from './EntryCard'
import { Pagination } from '@/components/ui/Pagination'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { 
  DocumentTextIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline'

interface EntryListProps {
  entries: EntryResponse[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  isLoading: boolean
  error: Error | null
  onPageChange: (page: number) => void
  onEditEntry: (entry: EntryResponse) => void
  onDeleteEntry: (entry: EntryResponse) => void
}

export function EntryList({
  entries,
  pagination,
  isLoading,
  error,
  onPageChange,
  onEditEntry,
  onDeleteEntry,
}: EntryListProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200 p-8">
        <div className="flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200 p-8">
        <EmptyState
          icon={<ExclamationTriangleIcon className="w-12 h-12 text-error-500" />}
          title="Failed to load entries"
          description={error.message || 'Something went wrong while loading your entries.'}
          action={{
            label: 'Try again',
            onClick: () => window.location.reload(),
          }}
        />
      </div>
    )
  }

  if (!entries.length) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200 p-8">
        <EmptyState
          icon={<DocumentTextIcon className="w-12 h-12 text-neutral-400" />}
          title="No entries found"
          description="You haven't created any entries yet, or no entries match your current filters."
          action={{
            label: 'Create your first entry',
            href: '/entries/new',
          }}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Entry Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {entries.map((entry) => (
          <EntryCard
            key={entry.id}
            entry={entry}
            onEdit={() => onEditEntry(entry)}
            onDelete={() => onDeleteEntry(entry)}
          />
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={onPageChange}
            hasNext={pagination.hasNext}
            hasPrev={pagination.hasPrev}
            showPageNumbers={true}
            className="bg-white rounded-lg border border-neutral-200 p-2"
          />
        </div>
      )}

      {/* Results Summary */}
      {pagination && (
        <div className="text-center text-sm text-neutral-600">
          Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
          {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
          {pagination.total} entries
        </div>
      )}
    </div>
  )
}