'use client'

import { motion } from 'framer-motion'
import { EntryResponse } from '@/types'
import { EntryCard } from './EntryCard'
import { Pagination } from '@/components/ui/Pagination'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { StaggerContainer } from '@/components/ui/PageTransition'
import { staggerContainer, fadeInUp } from '@/lib/animations'
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
      <motion.div 
        className="bg-white rounded-xl border border-neutral-200 p-8"
        variants={fadeInUp}
        initial="initial"
        animate="animate"
      >
        <div className="flex items-center justify-center">
          <LoadingSpinner size="lg" variant="dots" />
        </div>
      </motion.div>
    )
  }

  if (error) {
    return (
      <motion.div 
        className="bg-white rounded-xl border border-neutral-200 p-8"
        variants={fadeInUp}
        initial="initial"
        animate="animate"
      >
        <EmptyState
          icon={<ExclamationTriangleIcon className="w-12 h-12 text-error-500" />}
          title="Failed to load entries"
          description={error.message || 'Something went wrong while loading your entries.'}
          action={{
            label: 'Try again',
            onClick: () => window.location.reload(),
          }}
        />
      </motion.div>
    )
  }

  if (!entries.length) {
    return (
      <motion.div 
        className="bg-white rounded-xl border border-neutral-200 p-8"
        variants={fadeInUp}
        initial="initial"
        animate="animate"
      >
        <EmptyState
          icon={<DocumentTextIcon className="w-12 h-12 text-neutral-400" />}
          title="No entries found"
          description="You haven't created any entries yet, or no entries match your current filters."
          action={{
            label: 'Create your first entry',
            href: '/entries/new',
          }}
        />
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Entry Cards Grid */}
      <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {entries.map((entry) => (
          <EntryCard
            key={entry.id}
            entry={entry}
            onEdit={() => onEditEntry(entry)}
            onDelete={() => onDeleteEntry(entry)}
          />
        ))}
      </StaggerContainer>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <motion.div 
          className="flex justify-center"
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.3 }}
        >
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={onPageChange}
            hasNext={pagination.hasNext}
            hasPrev={pagination.hasPrev}
            showPageNumbers={true}
            className="bg-white rounded-lg border border-neutral-200 p-2"
          />
        </motion.div>
      )}

      {/* Results Summary */}
      {pagination && (
        <motion.div 
          className="text-center text-sm text-neutral-600"
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.4 }}
        >
          Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
          {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
          {pagination.total} entries
        </motion.div>
      )}
    </div>
  )
}