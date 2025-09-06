'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { formatThb } from '@/lib/currency'
import { CreateEntryInput } from '@/lib/validations'

interface LivePreviewProps {
  formData: Partial<CreateEntryInput>
  totalNet: number
}

export function LivePreview({ formData, totalNet }: LivePreviewProps) {
  const isIncome = formData.kind === 'income'
  const hasData = formData.title || formData.priceGrossThb

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
        <h3 className="text-lg font-semibold text-neutral-900">Live Preview</h3>
      </div>

      <motion.div
        layout
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <Card className="p-6 border-2 border-dashed border-neutral-200 bg-neutral-50/50">
          {!hasData ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-neutral-200 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-neutral-500">Start filling the form to see preview</p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Entry Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <motion.h4
                    key={formData.title}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xl font-bold text-neutral-900 mb-2"
                  >
                    {formData.title || 'Untitled Entry'}
                  </motion.h4>
                  
                  <div className="flex items-center gap-2">
                    <motion.div
                      key={formData.kind}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        isIncome
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isIncome ? 'Income' : 'Expense'}
                    </motion.div>
                    
                    {formData.invoiceNo && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-sm text-neutral-500"
                      >
                        {formData.invoiceNo}
                      </motion.span>
                    )}
                  </div>
                </div>
              </div>

              {/* Client/Vendor Information */}
              {(formData.clientName || formData.vendorName) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-4 bg-white rounded-lg border border-neutral-200"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-sm font-medium text-neutral-700">
                      {isIncome ? 'Client' : 'Vendor'}
                    </span>
                  </div>
                  <p className="text-neutral-900 font-medium">
                    {formData.clientName || formData.vendorName}
                  </p>
                </motion.div>
              )}

              {/* Product/Service */}
              {formData.productService && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-4 bg-white rounded-lg border border-neutral-200"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span className="text-sm font-medium text-neutral-700">Product/Service</span>
                  </div>
                  <p className="text-neutral-900">{formData.productService}</p>
                </motion.div>
              )}

              {/* Financial Breakdown */}
              {formData.priceGrossThb && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-white rounded-lg border border-neutral-200"
                >
                  <h5 className="text-sm font-medium text-neutral-700 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Financial Breakdown
                  </h5>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-neutral-600">Gross Amount</span>
                      <motion.span
                        key={formData.priceGrossThb}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="font-medium text-neutral-900"
                      >
                        {formatThb(formData.priceGrossThb)}
                      </motion.span>
                    </div>
                    
                    {formData.vatThb && formData.vatThb > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-neutral-600">+ VAT (7%)</span>
                        <motion.span
                          key={formData.vatThb}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="font-medium text-emerald-600"
                        >
                          {formatThb(formData.vatThb)}
                        </motion.span>
                      </div>
                    )}
                    
                    {formData.withholdingThb && formData.withholdingThb > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-neutral-600">- Withholding (3%)</span>
                        <motion.span
                          key={formData.withholdingThb}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="font-medium text-red-600"
                        >
                          -{formatThb(formData.withholdingThb)}
                        </motion.span>
                      </div>
                    )}
                    
                    {formData.commissionThb && formData.commissionThb > 0 && isIncome && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-neutral-600">- Commission</span>
                        <motion.span
                          key={formData.commissionThb}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="font-medium text-red-600"
                        >
                          -{formatThb(formData.commissionThb)}
                        </motion.span>
                      </div>
                    )}
                    
                    <div className="border-t border-neutral-200 pt-2 mt-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-neutral-900">Net Total</span>
                        <motion.span
                          key={totalNet}
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className={`text-lg font-bold ${
                            totalNet >= 0 ? 'text-emerald-600' : 'text-red-600'
                          }`}
                        >
                          {formatThb(totalNet)}
                        </motion.span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Dates */}
              {(formData.docDate || formData.transferDate) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-4 bg-white rounded-lg border border-neutral-200"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-medium text-neutral-700">Important Dates</span>
                  </div>
                  
                  <div className="space-y-2">
                    {formData.docDate && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-neutral-600">Document Date</span>
                        <span className="text-sm font-medium text-neutral-900">
                          {new Date(formData.docDate).toLocaleDateString('th-TH')}
                        </span>
                      </div>
                    )}
                    
                    {formData.transferDate && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-neutral-600">Transfer Date</span>
                        <span className="text-sm font-medium text-neutral-900">
                          {new Date(formData.transferDate).toLocaleDateString('th-TH')}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Additional Details */}
              {(formData.project || formData.accountName || formData.remark) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-4 bg-neutral-50 rounded-lg border border-neutral-200"
                >
                  <div className="space-y-3">
                    {formData.project && (
                      <div>
                        <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Project</span>
                        <p className="text-sm text-neutral-900 mt-1">{formData.project}</p>
                      </div>
                    )}
                    
                    {formData.accountName && (
                      <div>
                        <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Account</span>
                        <p className="text-sm text-neutral-900 mt-1">{formData.accountName}</p>
                      </div>
                    )}
                    
                    {formData.remark && (
                      <div>
                        <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Remarks</span>
                        <p className="text-sm text-neutral-900 mt-1">{formData.remark}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </Card>
      </motion.div>
    </div>
  )
}