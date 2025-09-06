'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CurrencyInput } from '@/components/ui/CurrencyInput'
import { 
  formatThb, 
  calculateVat, 
  calculateWithholding, 
  validateWithholdingTax,
  TAX_RATES,
  roundCurrency
} from '@/lib/currency'
import { calculateTotalNet } from '@/lib/calculations'
import type { EntryKind } from '@/types/entry'

interface FinancialCalculatorProps {
  kind: EntryKind
  onCalculationChange?: (calculation: {
    priceGross: number
    vat: number
    withholding: number
    commission: number
    totalNet: number
  }) => void
  initialValues?: {
    priceGross?: number
    vat?: number
    withholding?: number
    commission?: number
  }
}

export function FinancialCalculator({ 
  kind, 
  onCalculationChange, 
  initialValues = {} 
}: FinancialCalculatorProps) {
  const [priceGross, setPriceGross] = useState(initialValues.priceGross || 0)
  const [vat, setVat] = useState(initialValues.vat || 0)
  const [withholding, setWithholding] = useState(initialValues.withholding || 0)
  const [commission, setCommission] = useState(initialValues.commission || 0)
  const [autoCalculateVat, setAutoCalculateVat] = useState(false)
  const [autoCalculateWithholding, setAutoCalculateWithholding] = useState(false)
  
  const [withholdingError, setWithholdingError] = useState<string>()

  // Calculate total net amount
  const totalNet = calculateTotalNet(kind, priceGross, vat, withholding, commission)

  // Auto-calculate VAT when enabled
  useEffect(() => {
    if (autoCalculateVat && priceGross > 0) {
      const calculatedVat = calculateVat(priceGross)
      setVat(calculatedVat)
    } else if (!autoCalculateVat && priceGross === 0) {
      setVat(0)
    }
  }, [autoCalculateVat, priceGross])

  // Auto-calculate withholding when enabled
  useEffect(() => {
    if (autoCalculateWithholding && priceGross > 0) {
      const calculatedWithholding = calculateWithholding(priceGross)
      setWithholding(calculatedWithholding)
    } else if (!autoCalculateWithholding && priceGross === 0) {
      setWithholding(0)
    }
  }, [autoCalculateWithholding, priceGross])

  // Validate withholding tax
  useEffect(() => {
    if (priceGross > 0 && withholding > 0) {
      const validation = validateWithholdingTax(priceGross, withholding)
      setWithholdingError(validation.isValid ? undefined : validation.message)
    } else {
      setWithholdingError(undefined)
    }
  }, [priceGross, withholding])

  // Notify parent of calculation changes
  useEffect(() => {
    onCalculationChange?.({
      priceGross: roundCurrency(priceGross),
      vat: roundCurrency(vat),
      withholding: roundCurrency(withholding),
      commission: roundCurrency(commission),
      totalNet: roundCurrency(totalNet),
    })
  }, [priceGross, vat, withholding, commission, totalNet, onCalculationChange])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 bg-blue-500 rounded-full" />
        <h3 className="text-lg font-semibold text-neutral-900">Financial Calculator</h3>
        <div className={`px-2 py-1 rounded text-xs font-medium ${
          kind === 'income' 
            ? 'bg-emerald-100 text-emerald-800' 
            : 'bg-amber-100 text-amber-800'
        }`}>
          {kind === 'income' ? 'Income' : 'Expense'}
        </div>
      </div>

      {/* Gross Amount */}
      <CurrencyInput
        label="Gross Amount"
        value={priceGross}
        onChange={setPriceGross}
        helperText="The base amount before taxes and fees"
      />

      {/* Auto-calculation toggles */}
      <AnimatePresence>
        {priceGross > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3"
          >
            <h4 className="font-medium text-blue-900 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Auto-Calculate Taxes
            </h4>

            {/* VAT Toggle */}
            <div className="flex items-center justify-between p-3 bg-white rounded border">
              <div>
                <div className="font-medium text-neutral-900">
                  VAT ({(TAX_RATES.VAT * 100).toFixed(0)}%)
                </div>
                <div className="text-sm text-neutral-600">
                  {formatThb(calculateVat(priceGross))}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAutoCalculateVat(!autoCalculateVat)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  autoCalculateVat ? 'bg-blue-600' : 'bg-neutral-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    autoCalculateVat ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Withholding Toggle */}
            <div className="flex items-center justify-between p-3 bg-white rounded border">
              <div>
                <div className="font-medium text-neutral-900">
                  Withholding Tax ({(TAX_RATES.WITHHOLDING * 100).toFixed(0)}%)
                </div>
                <div className="text-sm text-neutral-600">
                  {formatThb(calculateWithholding(priceGross))}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAutoCalculateWithholding(!autoCalculateWithholding)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  autoCalculateWithholding ? 'bg-blue-600' : 'bg-neutral-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    autoCalculateWithholding ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manual Tax Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CurrencyInput
          label="VAT Amount"
          value={vat}
          onChange={setVat}
          disabled={autoCalculateVat}
          helperText={autoCalculateVat ? 'Auto-calculated' : 'Manual entry'}
        />

        <CurrencyInput
          label="Withholding Tax"
          value={withholding}
          onChange={setWithholding}
          disabled={autoCalculateWithholding}
          error={withholdingError}
          helperText={autoCalculateWithholding ? 'Auto-calculated' : 'Manual entry'}
        />
      </div>

      {/* Commission (Income only) */}
      {kind === 'income' && (
        <CurrencyInput
          label="Commission"
          value={commission}
          onChange={setCommission}
          helperText="Platform or service fees"
        />
      )}

      {/* Calculation Summary */}
      <motion.div
        layout
        className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg"
      >
        <h4 className="font-medium text-neutral-900 mb-3 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          Calculation Summary
        </h4>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-neutral-600">Gross Amount:</span>
            <span className="font-medium">{formatThb(priceGross)}</span>
          </div>

          {vat > 0 && (
            <div className="flex justify-between">
              <span className="text-neutral-600">+ VAT:</span>
              <span className="font-medium text-emerald-600">{formatThb(vat)}</span>
            </div>
          )}

          {withholding > 0 && (
            <div className="flex justify-between">
              <span className="text-neutral-600">- Withholding:</span>
              <span className="font-medium text-red-600">{formatThb(withholding)}</span>
            </div>
          )}

          {commission > 0 && kind === 'income' && (
            <div className="flex justify-between">
              <span className="text-neutral-600">- Commission:</span>
              <span className="font-medium text-red-600">{formatThb(commission)}</span>
            </div>
          )}

          <div className="border-t border-neutral-300 pt-2 mt-3">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-neutral-900">Net Total:</span>
              <motion.span
                key={totalNet}
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className={`text-lg font-bold ${
                  totalNet >= 0 ? 'text-emerald-600' : 'text-red-600'
                }`}
              >
                {formatThb(totalNet)}
              </motion.span>
            </div>
          </div>
        </div>

        {/* Calculation Formula */}
        <div className="mt-4 p-3 bg-white rounded border text-xs text-neutral-500">
          <div className="font-medium mb-1">Formula:</div>
          <div>
            {kind === 'income' 
              ? 'Net = Gross + VAT - Withholding - Commission'
              : 'Net = Gross + VAT - Withholding'
            }
          </div>
        </div>
      </motion.div>
    </div>
  )
}