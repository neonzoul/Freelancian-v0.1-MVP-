'use client'

import { useState } from 'react'
import { EntryResponse } from '@/types'
import { Button } from '@/components/ui/Button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { 
  PencilIcon, 
  TrashIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  UserIcon,
  BanknotesIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import { clsx } from 'clsx'

interface EntryCardProps {
  entry: EntryResponse
  onEdit: () => void
  onDelete: () => void
}

export function EntryCard({ entry, onEdit, onDelete }: EntryCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const isIncome = entry.kind === 'income'
  const amount = entry.totalNetThb || 0
  const displayDate = entry.docDate ? new Date(entry.docDate) : new Date(entry.createdAt)

  return (
    <div
      className={clsx(
        'bg-white rounded-xl border border-neutral-200 p-6 transition-all duration-200 cursor-pointer group',
        'hover:shadow-lg hover:border-neutral-300 hover:-translate-y-1',
        'focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={clsx(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                isIncome
                  ? 'bg-success-100 text-success-800'
                  : 'bg-error-100 text-error-800'
              )}
            >
              {isIncome ? 'Income' : 'Expense'}
            </span>
            {entry.invoiceNo && (
              <span className="text-xs text-neutral-500">#{entry.invoiceNo}</span>
            )}
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 truncate group-hover:text-primary-700 transition-colors">
            {entry.title}
          </h3>
        </div>

        {/* Quick Actions */}
        <div
          className={clsx(
            'flex items-center gap-1 transition-all duration-200',
            isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
          )}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
            className="p-2 hover:bg-primary-50 hover:text-primary-700"
            aria-label="Edit entry"
          >
            <PencilIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="p-2 hover:bg-error-50 hover:text-error-700"
            aria-label="Delete entry"
          >
            <TrashIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Amount */}
      <div className="mb-4">
        <div
          className={clsx(
            'text-2xl font-bold',
            isIncome ? 'text-success-600' : 'text-error-600'
          )}
        >
          {isIncome ? '+' : '-'}{formatCurrency(Math.abs(amount))}
        </div>
        {entry.priceGrossThb && entry.priceGrossThb !== amount && (
          <div className="text-sm text-neutral-500">
            Gross: {formatCurrency(entry.priceGrossThb)}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4">
        {entry.docDate && (
          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <CalendarIcon className="w-4 h-4 flex-shrink-0" />
            <span>{formatDate(displayDate)}</span>
          </div>
        )}

        {entry.clientName && (
          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <UserIcon className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{entry.clientName}</span>
          </div>
        )}

        {entry.vendorName && (
          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <BuildingOfficeIcon className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{entry.vendorName}</span>
          </div>
        )}

        {entry.productService && (
          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <DocumentTextIcon className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{entry.productService}</span>
          </div>
        )}
      </div>

      {/* Financial Breakdown */}
      {(entry.vatThb || entry.withholdingThb || entry.commissionThb) && (
        <div className="border-t border-neutral-100 pt-3 mt-3">
          <div className="text-xs text-neutral-500 space-y-1">
            {entry.vatThb && entry.vatThb > 0 && (
              <div className="flex justify-between">
                <span>VAT (7%):</span>
                <span>+{formatCurrency(entry.vatThb)}</span>
              </div>
            )}
            {entry.withholdingThb && entry.withholdingThb > 0 && (
              <div className="flex justify-between">
                <span>WHT (3%):</span>
                <span>-{formatCurrency(entry.withholdingThb)}</span>
              </div>
            )}
            {entry.commissionThb && entry.commissionThb > 0 && (
              <div className="flex justify-between">
                <span>Commission:</span>
                <span>-{formatCurrency(entry.commissionThb)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Project Tag */}
      {entry.project && (
        <div className="mt-3 pt-3 border-t border-neutral-100">
          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-neutral-100 text-neutral-700">
            {entry.project}
          </span>
        </div>
      )}

      {/* Remark */}
      {entry.remark && (
        <div className="mt-3 pt-3 border-t border-neutral-100">
          <p className="text-sm text-neutral-600 line-clamp-2">
            {entry.remark}
          </p>
        </div>
      )}
    </div>
  )
}