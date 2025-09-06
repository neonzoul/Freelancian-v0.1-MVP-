'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import type { EntryResponse } from '@/types'
import { clsx } from 'clsx'

interface RecentEntriesProps {
  entries: EntryResponse[]
  isLoading?: boolean
  onEditEntry?: (entryId: string) => void
  onDeleteEntry?: (entryId: string) => void
}

interface EntryCardProps {
  entry: EntryResponse
  index: number
  onEdit?: (entryId: string) => void
  onDelete?: (entryId: string) => void
}

// Format Thai Baht currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Format date for display
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

// Entry card component
function EntryCard({ entry, index, onEdit, onDelete }: EntryCardProps) {
  const isIncome = entry.kind === 'income'
  const amount = entry.totalNetThb || 0
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      className="group"
    >
      <Card 
        hover 
        interactive
        className="relative overflow-hidden transition-all duration-200 hover:shadow-lg"
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              {/* Entry type indicator */}
              <div className="flex items-center gap-2 mb-2">
                <div className={clsx(
                  'w-2 h-2 rounded-full',
                  isIncome ? 'bg-green-500' : 'bg-red-500'
                )} />
                <span className={clsx(
                  'text-xs font-medium uppercase tracking-wide',
                  isIncome ? 'text-green-600' : 'text-red-600'
                )}>
                  {entry.kind}
                </span>
              </div>
              
              {/* Entry title */}
              <h3 className="font-semibold text-neutral-900 truncate mb-1">
                {entry.title}
              </h3>
              
              {/* Client/Vendor info */}
              {(entry.clientName || entry.vendorName) && (
                <p className="text-sm text-neutral-600 truncate mb-2">
                  {entry.clientName || entry.vendorName}
                </p>
              )}
              
              {/* Date */}
              <p className="text-xs text-neutral-500">
                {entry.docDate ? formatDate(entry.docDate) : formatDate(entry.createdAt)}
              </p>
            </div>
            
            {/* Amount */}
            <div className="text-right ml-4">
              <div className={clsx(
                'text-lg font-bold',
                isIncome ? 'text-green-600' : 'text-red-600'
              )}>
                {isIncome ? '+' : '-'}{formatCurrency(Math.abs(amount))}
              </div>
            </div>
          </div>
          
          {/* Quick action buttons - shown on hover */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 0, y: 10 }}
            whileHover={{ opacity: 1, y: 0 }}
            className="flex gap-2 mt-3 pt-3 border-t border-neutral-100 group-hover:opacity-100 opacity-0 transition-opacity duration-200"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onEdit?.(entry.id)
              }}
              className="flex-1 text-xs"
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onDelete?.(entry.id)
              }}
              className="flex-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Delete
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Loading skeleton for entry cards
function EntryCardSkeleton({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
    >
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-neutral-200 rounded-full animate-pulse" />
                <div className="w-16 h-3 bg-neutral-200 rounded animate-pulse" />
              </div>
              <div className="w-3/4 h-5 bg-neutral-200 rounded animate-pulse mb-1" />
              <div className="w-1/2 h-4 bg-neutral-200 rounded animate-pulse mb-2" />
              <div className="w-1/3 h-3 bg-neutral-200 rounded animate-pulse" />
            </div>
            <div className="w-20 h-6 bg-neutral-200 rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function RecentEntries({ 
  entries, 
  isLoading = false, 
  onEditEntry, 
  onDeleteEntry 
}: RecentEntriesProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-neutral-900">
          Recent Entries
        </h2>
        <Button variant="ghost" size="sm" className="text-primary-600">
          View All
        </Button>
      </div>
      
      <div className="space-y-3">
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 5 }).map((_, index) => (
            <EntryCardSkeleton key={index} index={index} />
          ))
        ) : entries.length > 0 ? (
          // Entry cards
          entries.map((entry, index) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              index={index}
              onEdit={onEditEntry}
              onDelete={onDeleteEntry}
            />
          ))
        ) : (
          // Empty state
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-neutral-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-neutral-900 mb-2">
              No entries yet
            </h3>
            <p className="text-neutral-600 mb-4">
              Start tracking your income and expenses by creating your first entry.
            </p>
            <Button variant="primary">
              Add Entry
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  )
}