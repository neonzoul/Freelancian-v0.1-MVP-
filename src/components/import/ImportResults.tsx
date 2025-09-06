'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { formatCurrency } from '@/lib/utils'
import type { ImportResult } from '@/types/import'

interface ImportResultsProps {
  result: ImportResult
  onStartOver: () => void
  onGoToDashboard: () => void
  onGoToEntries: () => void
}

export function ImportResults({ result, onStartOver, onGoToDashboard, onGoToEntries }: ImportResultsProps) {
  const successRate = result.summary.totalRows > 0 ? (result.summary.successfulImports / result.summary.totalRows) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Success/Failure Header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="p-8 text-center">
          <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
            result.success ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {result.success ? (
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">
            {result.success ? 'Import Completed!' : 'Import Completed with Issues'}
          </h2>
          
          <p className="text-neutral-600">
            {result.success 
              ? `Successfully imported ${result.imported} entries`
              : `Imported ${result.imported} entries with ${result.summary.errorRows} errors`
            }
          </p>
        </Card>
      </motion.div>

      {/* Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            Import Statistics
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-900">
                {result.summary.totalRows}
              </div>
              <div className="text-sm text-blue-700">Total Rows</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-900">
                {result.imported}
              </div>
              <div className="text-sm text-green-700">Successful</div>
            </div>
            
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-900">
                {result.summary.errorRows}
              </div>
              <div className="text-sm text-red-700">Errors</div>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-900">
                {result.skipped}
              </div>
              <div className="text-sm text-yellow-700">Skipped</div>
            </div>
          </div>

          {/* Success Rate */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-neutral-700">Success Rate</span>
              <span className="text-sm font-medium text-neutral-900">{successRate.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <motion.div
                className={`h-2 rounded-full ${
                  successRate >= 90 ? 'bg-green-500' :
                  successRate >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${successRate}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Financial Summary */}
      {result.summary && (result.summary.totalIncome || result.summary.totalExpenses) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">
              Financial Summary
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.summary.totalIncome && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-sm text-green-700 mb-1">Total Income Imported</div>
                  <div className="text-xl font-bold text-green-900">
                    {formatCurrency(result.summary.totalIncome)}
                  </div>
                </div>
              )}
              
              {result.summary.totalExpenses && (
                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="text-sm text-red-700 mb-1">Total Expenses Imported</div>
                  <div className="text-xl font-bold text-red-900">
                    {formatCurrency(result.summary.totalExpenses)}
                  </div>
                </div>
              )}
            </div>

            {result.summary.duplicatesSkipped && result.summary.duplicatesSkipped > 0 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-yellow-800 font-medium">
                    {result.summary.duplicatesSkipped} duplicate entries were skipped
                  </span>
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      )}

      {/* Errors */}
      {result.errors && result.errors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">
              Import Errors ({result.errors.length})
            </h3>
            
            <div className="max-h-64 overflow-y-auto space-y-2">
              {result.errors.slice(0, 10).map((error, index) => (
                <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-red-900">
                        {error}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {result.errors.length > 10 && (
                <div className="text-center py-2">
                  <span className="text-sm text-neutral-600">
                    ... and {result.errors.length - 10} more errors
                  </span>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col sm:flex-row gap-3 justify-center"
      >
        <Button variant="outline" onClick={onStartOver}>
          Import Another File
        </Button>
        <Button variant="outline" onClick={onGoToEntries}>
          View All Entries
        </Button>
        <Button variant="primary" onClick={onGoToDashboard}>
          Go to Dashboard
        </Button>
      </motion.div>
    </div>
  )
}