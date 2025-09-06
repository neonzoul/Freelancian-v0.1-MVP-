'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { formatThb } from '@/lib/calculations'

interface TaxCalculationHelpersProps {
  grossAmount?: number
  autoCalculateVat: boolean
  autoCalculateWht: boolean
  onVatToggle: (enabled: boolean) => void
  onWhtToggle: (enabled: boolean) => void
}

export function TaxCalculationHelpers({
  grossAmount,
  autoCalculateVat,
  autoCalculateWht,
  onVatToggle,
  onWhtToggle,
}: TaxCalculationHelpersProps) {
  const vatAmount = grossAmount ? grossAmount * 0.07 : 0
  const whtAmount = grossAmount ? grossAmount * 0.03 : 0

  return (
    <AnimatePresence>
      {grossAmount && grossAmount > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="p-4 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <h4 className="font-medium text-blue-900">Auto-Calculate Tax</h4>
          </div>
          
          <div className="space-y-3">
            {/* VAT Toggle */}
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-neutral-900">VAT (7%)</span>
                  <span className="text-sm text-neutral-500">
                    {formatThb(vatAmount)}
                  </span>
                </div>
                <p className="text-xs text-neutral-600 mt-1">
                  Automatically calculate 7% VAT from gross amount
                </p>
              </div>
              
              <motion.button
                type="button"
                onClick={() => onVatToggle(!autoCalculateVat)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  autoCalculateVat ? 'bg-blue-600' : 'bg-neutral-200'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <motion.span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    autoCalculateVat ? 'translate-x-6' : 'translate-x-1'
                  }`}
                  layout
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </motion.button>
            </div>

            {/* WHT Toggle */}
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-neutral-900">Withholding Tax (3%)</span>
                  <span className="text-sm text-neutral-500">
                    {formatThb(whtAmount)}
                  </span>
                </div>
                <p className="text-xs text-neutral-600 mt-1">
                  Automatically calculate 3% withholding tax from gross amount
                </p>
              </div>
              
              <motion.button
                type="button"
                onClick={() => onWhtToggle(!autoCalculateWht)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  autoCalculateWht ? 'bg-blue-600' : 'bg-neutral-200'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <motion.span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    autoCalculateWht ? 'translate-x-6' : 'translate-x-1'
                  }`}
                  layout
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </motion.button>
            </div>

            {/* Quick Summary */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-3 bg-blue-100 rounded-lg"
            >
              <div className="text-sm">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-blue-800">Gross Amount:</span>
                  <span className="font-medium text-blue-900">{formatThb(grossAmount)}</span>
                </div>
                
                {autoCalculateVat && (
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-blue-700">+ VAT (7%):</span>
                    <span className="font-medium text-emerald-700">{formatThb(vatAmount)}</span>
                  </div>
                )}
                
                {autoCalculateWht && (
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-blue-700">- WHT (3%):</span>
                    <span className="font-medium text-red-700">{formatThb(whtAmount)}</span>
                  </div>
                )}
                
                <div className="border-t border-blue-200 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-blue-900">Estimated Net:</span>
                    <span className="font-bold text-blue-900">
                      {formatThb(grossAmount + (autoCalculateVat ? vatAmount : 0) - (autoCalculateWht ? whtAmount : 0))}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}