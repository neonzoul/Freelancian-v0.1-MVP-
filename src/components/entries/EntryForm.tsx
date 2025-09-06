'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { CreateEntrySchema, type CreateEntryInput } from '@/lib/validations'
import { calculateTaxes, calculateTotalNet } from '@/lib/calculations'
import { Input, DateInput } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { LivePreview } from './LivePreview'
import { TaxCalculationHelpers } from './TaxCalculationHelpers'
import { SuccessAnimation } from '@/components/ui/PageTransition'
import { useCreateEntry } from '@/lib/hooks/use-entries'
import { useRouter } from 'next/navigation'

export function EntryForm() {
  const router = useRouter()
  const [autoCalculateVat, setAutoCalculateVat] = useState(false)
  const [autoCalculateWht, setAutoCalculateWht] = useState(false)
  
  const createEntryMutation = useCreateEntry()

  const form = useForm<CreateEntryInput>({
    resolver: zodResolver(CreateEntrySchema),
    defaultValues: {
      kind: 'income',
      title: '',
      docDate: '',
      transferDate: '',
      clientName: '',
      vendorName: '',
      productService: '',
      accountName: '',
      priceGrossThb: undefined,
      vatThb: undefined,
      withholdingThb: undefined,
      commissionThb: undefined,
      project: '',
      remark: '',
      invoiceNo: '',
    },
    mode: 'onChange',
  })

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = form
  const watchedValues = watch()

  // Auto-calculate taxes when gross amount changes
  const handleGrossAmountChange = (value: number | undefined) => {
    if (!value || value <= 0) {
      if (autoCalculateVat) setValue('vatThb', undefined)
      if (autoCalculateWht) setValue('withholdingThb', undefined)
      return
    }

    const calculations = calculateTaxes(value, {
      enableVat: autoCalculateVat,
      enableWithholding: autoCalculateWht,
    })

    if (autoCalculateVat) {
      setValue('vatThb', calculations.vat)
    }
    if (autoCalculateWht) {
      setValue('withholdingThb', calculations.withholding)
    }
  }

  // Handle auto-calculation toggle changes
  const handleVatToggle = (enabled: boolean) => {
    setAutoCalculateVat(enabled)
    if (enabled && watchedValues.priceGrossThb) {
      const calculations = calculateTaxes(watchedValues.priceGrossThb)
      setValue('vatThb', calculations.vat)
    } else if (!enabled) {
      setValue('vatThb', undefined)
    }
  }

  const handleWhtToggle = (enabled: boolean) => {
    setAutoCalculateWht(enabled)
    if (enabled && watchedValues.priceGrossThb) {
      const calculations = calculateTaxes(watchedValues.priceGrossThb)
      setValue('withholdingThb', calculations.withholding)
    } else if (!enabled) {
      setValue('withholdingThb', undefined)
    }
  }

  const [showSuccess, setShowSuccess] = useState(false)

  const onSubmit = async (data: CreateEntryInput) => {
    try {
      await createEntryMutation.mutateAsync(data)
      setShowSuccess(true)
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    } catch (error) {
      // Error handling is done in the mutation
      console.error('Failed to create entry:', error)
    }
  }

  const entryTypeOptions = [
    { value: 'income', label: 'Income' },
    { value: 'expense', label: 'Expense' },
  ]

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
      {/* Form Section */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <Card className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Entry Type Toggle */}
            <div className="space-y-4">
              <Select
                {...register('kind')}
                label="Entry Type"
                options={entryTypeOptions}
                error={errors.kind?.message}
                size="lg"
              />
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={watchedValues.kind}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="p-4 rounded-lg border-2 border-dashed"
                  style={{
                    borderColor: watchedValues.kind === 'income' ? '#10b981' : '#f59e0b',
                    backgroundColor: watchedValues.kind === 'income' ? '#ecfdf5' : '#fffbeb',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: watchedValues.kind === 'income' ? '#10b981' : '#f59e0b',
                      }}
                    />
                    <span className="font-medium text-neutral-700">
                      {watchedValues.kind === 'income' ? 'Income Entry' : 'Expense Entry'}
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-neutral-900">Basic Information</h3>
              
              <Input
                {...register('title')}
                label="Title"
                placeholder="Enter entry title..."
                error={errors.title?.message}
                size="lg"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DateInput
                  {...register('docDate')}
                  label="Document Date"
                  error={errors.docDate?.message}
                />
                
                <DateInput
                  {...register('transferDate')}
                  label="Transfer Date"
                  error={errors.transferDate?.message}
                />
              </div>

              <AnimatePresence>
                {watchedValues.kind === 'income' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Input
                      {...register('clientName')}
                      label="Client Name"
                      placeholder="Enter client name..."
                      error={errors.clientName?.message}
                    />
                  </motion.div>
                )}
                
                {watchedValues.kind === 'expense' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Input
                      {...register('vendorName')}
                      label="Vendor Name"
                      placeholder="Enter vendor name..."
                      error={errors.vendorName?.message}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  {...register('productService')}
                  label="Product/Service"
                  placeholder="What was provided..."
                  error={errors.productService?.message}
                />
                
                <Input
                  {...register('accountName')}
                  label="Account Name"
                  placeholder="Bank account..."
                  error={errors.accountName?.message}
                />
              </div>
            </div>

            {/* Financial Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-neutral-900">Financial Details</h3>
              
              <Input
                {...register('priceGrossThb', {
                  valueAsNumber: true,
                  onChange: (e) => handleGrossAmountChange(e.target.valueAsNumber || undefined)
                })}
                type="number"
                label="Gross Amount"
                placeholder="0.00"
                error={errors.priceGrossThb?.message}
                size="lg"
                min={0}
                step={0.01}
                leftIcon={<span className="text-neutral-600 font-medium">฿</span>}
              />

              {/* Tax Calculation Helpers */}
              <TaxCalculationHelpers
                grossAmount={watchedValues.priceGrossThb}
                autoCalculateVat={autoCalculateVat}
                autoCalculateWht={autoCalculateWht}
                onVatToggle={handleVatToggle}
                onWhtToggle={handleWhtToggle}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  {...register('vatThb', { valueAsNumber: true })}
                  type="number"
                  label="VAT Amount"
                  placeholder="0.00"
                  error={errors.vatThb?.message}
                  disabled={autoCalculateVat}
                  min={0}
                  step={0.01}
                  leftIcon={<span className="text-neutral-600 font-medium">฿</span>}
                />
                
                <Input
                  {...register('withholdingThb', { valueAsNumber: true })}
                  type="number"
                  label="Withholding Tax"
                  placeholder="0.00"
                  error={errors.withholdingThb?.message}
                  disabled={autoCalculateWht}
                  min={0}
                  step={0.01}
                  leftIcon={<span className="text-neutral-600 font-medium">฿</span>}
                />
              </div>

              <AnimatePresence>
                {watchedValues.kind === 'income' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Input
                      {...register('commissionThb', { valueAsNumber: true })}
                      type="number"
                      label="Commission"
                      placeholder="0.00"
                      error={errors.commissionThb?.message}
                      min={0}
                      step={0.01}
                      leftIcon={<span className="text-neutral-600 font-medium">฿</span>}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-neutral-900">Additional Details</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  {...register('project')}
                  label="Project"
                  placeholder="Project name..."
                  error={errors.project?.message}
                />
                
                <Input
                  {...register('invoiceNo')}
                  label="Invoice Number"
                  placeholder="INV-001..."
                  error={errors.invoiceNo?.message}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Remarks
                </label>
                <textarea
                  {...register('remark')}
                  rows={3}
                  className="w-full px-4 py-2.5 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200"
                  placeholder="Additional notes..."
                />
                {errors.remark && (
                  <p className="mt-2 text-sm text-error-600">{errors.remark.message}</p>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-neutral-200">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => router.back()}
                className="flex-1"
              >
                Cancel
              </Button>
              
              <Button
                type="submit"
                size="lg"
                loading={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'Creating Entry...' : 'Create Entry'}
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>

      {/* Live Preview Section */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="lg:sticky lg:top-8 lg:h-fit order-first lg:order-last"
      >
        <LivePreview
          formData={watchedValues}
          totalNet={calculateTotalNet(
            watchedValues.kind || 'income',
            watchedValues.priceGrossThb || 0,
            watchedValues.vatThb || 0,
            watchedValues.withholdingThb || 0,
            watchedValues.commissionThb || 0
          )}
        />
      </motion.div>

      {/* Success Animation */}
      <SuccessAnimation 
        isVisible={showSuccess} 
        onComplete={() => setShowSuccess(false)}
      />
    </div>
  )
}