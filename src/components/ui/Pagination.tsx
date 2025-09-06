'use client'

import { Button } from './Button'
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  EllipsisHorizontalIcon 
} from '@heroicons/react/24/outline'
import { clsx } from 'clsx'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  hasNext: boolean
  hasPrev: boolean
  showPageNumbers?: boolean
  maxVisiblePages?: number
  className?: string
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  hasNext,
  hasPrev,
  showPageNumbers = true,
  maxVisiblePages = 7,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null

  const getVisiblePages = () => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    const halfVisible = Math.floor(maxVisiblePages / 2)
    let start = Math.max(1, currentPage - halfVisible)
    let end = Math.min(totalPages, start + maxVisiblePages - 1)

    // Adjust start if we're near the end
    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1)
    }

    const pages = []
    
    // Add first page and ellipsis if needed
    if (start > 1) {
      pages.push(1)
      if (start > 2) {
        pages.push('ellipsis-start')
      }
    }

    // Add visible pages
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    // Add ellipsis and last page if needed
    if (end < totalPages) {
      if (end < totalPages - 1) {
        pages.push('ellipsis-end')
      }
      pages.push(totalPages)
    }

    return pages
  }

  const visiblePages = showPageNumbers ? getVisiblePages() : []

  return (
    <nav className={clsx('flex items-center justify-center gap-1', className)}>
      {/* Previous Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrev}
        className="flex items-center gap-1 px-3"
        aria-label="Go to previous page"
      >
        <ChevronLeftIcon className="w-4 h-4" />
        <span className="hidden sm:inline">Previous</span>
      </Button>

      {/* Page Numbers */}
      {showPageNumbers && (
        <div className="flex items-center gap-1 mx-2">
          {visiblePages.map((page, index) => {
            if (typeof page === 'string') {
              return (
                <div
                  key={page}
                  className="flex items-center justify-center w-8 h-8"
                  aria-hidden="true"
                >
                  <EllipsisHorizontalIcon className="w-5 h-5 text-neutral-400" />
                </div>
              )
            }

            const isCurrentPage = page === currentPage

            return (
              <Button
                key={page}
                variant={isCurrentPage ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => onPageChange(page)}
                className={clsx(
                  'w-8 h-8 p-0 text-sm font-medium',
                  isCurrentPage
                    ? 'bg-primary-600 text-white hover:bg-primary-700'
                    : 'text-neutral-700 hover:bg-neutral-100'
                )}
                aria-label={`Go to page ${page}`}
                aria-current={isCurrentPage ? 'page' : undefined}
              >
                {page}
              </Button>
            )
          })}
        </div>
      )}

      {/* Next Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNext}
        className="flex items-center gap-1 px-3"
        aria-label="Go to next page"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRightIcon className="w-4 h-4" />
      </Button>

      {/* Page Info (Mobile) */}
      <div className="sm:hidden ml-4 text-sm text-neutral-600">
        {currentPage} of {totalPages}
      </div>
    </nav>
  )
}