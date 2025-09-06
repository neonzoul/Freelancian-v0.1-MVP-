'use client'

import { useState, useEffect, useMemo } from 'react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { GetEntriesQuery, EntryKind } from '@/types'
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  XMarkIcon,
  AdjustmentsHorizontalIcon 
} from '@heroicons/react/24/outline'
import { useDebounce } from '@/lib/hooks/use-debounce'

interface SearchFilterProps {
  filters: GetEntriesQuery
  onFilterChange: (filters: Partial<GetEntriesQuery>) => void
  totalEntries: number
}

export function SearchFilter({ filters, onFilterChange, totalEntries }: SearchFilterProps) {
  const [searchValue, setSearchValue] = useState(filters.search || '')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  
  // Debounce search input to avoid too many API calls
  const debouncedSearch = useDebounce(searchValue, 300)

  // Update filters when debounced search changes
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      onFilterChange({ search: debouncedSearch || undefined })
    }
  }, [debouncedSearch, filters.search, onFilterChange])

  // Generate month options for the last 12 months
  const monthOptions = useMemo(() => {
    const options = [{ value: '', label: 'All months' }]
    const now = new Date()
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const value = date.toISOString().slice(0, 7) // YYYY-MM format
      const label = date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      })
      options.push({ value, label })
    }
    
    return options
  }, [])

  const sortOptions = [
    { value: 'docDate', label: 'Document Date' },
    { value: 'createdAt', label: 'Created Date' },
    { value: 'totalNetThb', label: 'Amount' },
    { value: 'title', label: 'Title' },
  ]

  const sortOrderOptions = [
    { value: 'desc', label: 'Newest First' },
    { value: 'asc', label: 'Oldest First' },
  ]

  const entryTypeOptions = [
    { value: '', label: 'All types' },
    { value: 'income', label: 'Income' },
    { value: 'expense', label: 'Expense' },
  ]

  const hasActiveFilters = !!(
    filters.search ||
    filters.kind ||
    filters.month ||
    filters.clientName ||
    filters.vendorName
  )

  const clearAllFilters = () => {
    setSearchValue('')
    onFilterChange({
      search: undefined,
      kind: undefined,
      month: undefined,
      clientName: undefined,
      vendorName: undefined,
    })
  }

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4">
      {/* Search and Quick Filters Row */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1">
          <Input
            placeholder="Search by title, client, or vendor..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            leftIcon={<MagnifyingGlassIcon className="w-5 h-5" />}
            className="w-full"
          />
        </div>

        {/* Quick Filters */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <Select
            value={filters.kind || ''}
            onChange={(e) => onFilterChange({ kind: e.target.value as EntryKind || undefined })}
            options={entryTypeOptions}
            className="w-full sm:w-40"
          />
          
          <Select
            value={filters.month || ''}
            onChange={(e) => onFilterChange({ month: e.target.value || undefined })}
            options={monthOptions}
            className="w-full sm:w-48"
          />

          <Button
            variant="outline"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <AdjustmentsHorizontalIcon className="w-4 h-4" />
            More Filters
          </Button>
        </div>
      </div>

      {/* Advanced Filters (Collapsible) */}
      {showAdvancedFilters && (
        <div className="border-t border-neutral-200 pt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              label="Client Name"
              placeholder="Filter by client..."
              value={filters.clientName || ''}
              onChange={(e) => onFilterChange({ clientName: e.target.value || undefined })}
            />
            
            <Input
              label="Vendor Name"
              placeholder="Filter by vendor..."
              value={filters.vendorName || ''}
              onChange={(e) => onFilterChange({ vendorName: e.target.value || undefined })}
            />
            
            <Select
              label="Sort By"
              value={filters.sortBy || 'docDate'}
              onChange={(e) => onFilterChange({ sortBy: e.target.value as any })}
              options={sortOptions}
            />
            
            <Select
              label="Sort Order"
              value={filters.sortOrder || 'desc'}
              onChange={(e) => onFilterChange({ sortOrder: e.target.value as any })}
              options={sortOrderOptions}
            />
          </div>
        </div>
      )}

      {/* Filter Summary and Clear */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-neutral-100">
        <div className="text-sm text-neutral-600">
          {totalEntries > 0 ? (
            <>
              Showing <span className="font-medium">{totalEntries}</span> {totalEntries === 1 ? 'entry' : 'entries'}
              {hasActiveFilters && ' (filtered)'}
            </>
          ) : (
            'No entries found'
          )}
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900"
          >
            <XMarkIcon className="w-4 h-4" />
            Clear all filters
          </Button>
        )}
      </div>
    </div>
  )
}