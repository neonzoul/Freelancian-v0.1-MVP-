'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { EntryResponse, CreateEntryRequest } from '@/types'
import { CreateEntrySchema } from '@/lib/validations'
import { useUpdateEntry } from '@/lib/hooks/use-entries'
import { Button } from '@/components/ui/Button'
import { Input, NumberInput, DateInput } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { TaxCalculationHelpers } from './TaxCalculationHelpers'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { clsx } from 'clsx'
import { toast } from 'sonner'

interface EditEntryPanelProps {
  entry: EntryResponse
  isOpen: boolean
  onClose: () => void
}

export function EditEntryPanel({ entry, isOpen, onClose }: EditEntryPanelProps) {
  const [isClosing, setIsClosing] = useState(false)
  const [autoCalculateVat, setAutoCalculateVat] = useState(false)
  const [autoCalculateWht, setAutoCalculateWht] = useState(false)
  const updateEntryMutation = useUpdateEntry()

  const form = useForm<CreateEntryRequest>({
    resolver: zodResolver(CreateEntrySchema),
    defaultValues: {
      kind: entry.kind,
      title: entry.title,
      docDate: entry.docDate ? entry.docDate.split('T')[0] : undefined,
      transferDate: entry.transferDate ? entry.transferDate.split('T')[0] : undefined,
      clientName: entry.clientName || undefined,
      vendorName: entry.vendorName || undefined,
      productService: entry.productService || undefined,
      accountName: entry.accountName || undefined,
      priceGrossThb: entry.priceGrossThb || undefined,
      vatThb: entry.vatThb || undefined,
      withholdingThb: entry.withholdingThb || undefined,
      commissionThb: entry.commissionThb || undefined,
      project: entry.project || undefined,
      remark: entry.remark || undefined,
      invoiceNo: entry.invoiceNo || undefined,
    },
  })

  const { watch, setValue, handleSubmit, formState: { errors, isDirty } } = form
  const watchedValues = watch()

  // Reset form when entry changes
  useEffect(() => {
    if (entry) {
      form.reset({
        kind: entry.kind,
        title: entry.title,
        docDate: entry.docDate ? entry.docDate.split('T')[0] : undefined,
        transferDate: entry.transferDate ? entry.transferDate.split('T')[0] : undefined,
        clientName: entry.clientName || undefined,
        vendorName: entry.vendorName || undefined,
        productService: entry.productService || undefined,
        accountName: entry.accountName || undefined,
        priceGrossThb: entry.priceGrossThb || undefined,
        vatThb: entry.vatThb || undefined,
        withholdingThb: entry.withholdingThb || undefined,
        commissionThb: entry.commissionThb || undefined,
        project: entry.project || undefined,
        remark: entry.remark || undefined,
        invoiceNo: entry.invoiceNo || undefined,
      })
    }
  }, [entry, form])

  const handleClose = () => {
    if (isDirty) {
      const confirmClose = window.confirm(
        'You have unsaved changes. Are you sure you want to close?'
      )
      if (!confirmClose) return
    }
    
    setIsClosing(true)
    setTimeout(() => {
      onClose()
      setIsClosing(false)
    }, 200)
  }

  const onSubmit = async (data: CreateEntryRequest) => {
    try {
      await updateEntryMutation.mutateAsync({
        id: entry.id,
        data,
      })
      
      toast.success('Entry updated successfully')
      onClose()
    } catch (error) {
      toast.error('Failed to update entry')
      console.error('Failed to update entry:', error)
    }
  }

  const entryTypeOptions = [
    { value: 'income', label: 'Income' },
    { value: 'expense', label: 'Expense' },
  ]

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className={clsx(
          'fixed inset-0 bg-black/50 z-40 transition-opacity duration-300',
          isOpen && !isClosing ? 'opacity-100' : 'opacity-0'
        )}
        onClick={handleClose}
      />

      {/* Panel */}
      <div
        className={clsx(
          'fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50',
          'transform transition-transform duration-300 ease-in-out',
          isOpen && !isClosing ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-neutral-200">
            <div>
              <h2 className="text-xl font-semibold text-neutral-900">
                Edit Entry
              </h2>
              <p className="text-sm text-neutral-600 mt-1">
                Update your {entry.kind} entry details
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="p-2"
              aria-label="Close panel"
            >
              <XMarkIcon className="w-5 h-5" />
            </Button>
          </div>

          {/* Form */}
          <div className="flex-1 overflow-y-auto">
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              {/* Entry Type */}
              <Select
                label="Entry Type"
                value={watchedValues.kind}
                onChange={(e) => setValue('kind', e.target.value as any)}
                options={entryTypeOptions}
                error={errors.kind?.message}
                required
              />

              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-neutral-900">
                  Basic Information
                </h3>
                
                <Input
                  label="Title"
                  {...form.register('title')}
                  error={errors.title?.message}
                  placeholder="Enter entry title..."
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <DateInput
                    label="Document Date"
                    {...form.register('docDate')}
                    error={errors.docDate?.message}
                  />
                  
                  <DateInput
                    label="Transfer Date"
                    {...form.register('transferDate')}
                    error={errors.transferDate?.message}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Client Name"
                    {...form.register('clientName')}
                    error={errors.clientName?.message}
                    placeholder="Enter client name..."
                  />
                  
                  <Input
                    label="Vendor Name"
                    {...form.register('vendorName')}
                    error={errors.vendorName?.message}
                    placeholder="Enter vendor name..."
                  />
                </div>

                <Input
                  label="Product/Service"
                  {...form.register('productService')}
                  error={errors.productService?.message}
                  placeholder="Describe the product or service..."
                />

                <Input
                  label="Account Name"
                  {...form.register('accountName')}
                  error={errors.accountName?.message}
                  placeholder="Enter account name..."
                />
              </div>

              {/* Financial Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-neutral-900">
                  Financial Details
                </h3>

                <NumberInput
                  label="Gross Amount (฿)"
                  name="priceGrossThb"
                  onChange={form.register('priceGrossThb', { valueAsNumber: true }).onChange}
                  onBlur={form.register('priceGrossThb', { valueAsNumber: true }).onBlur}
                  ref={form.register('priceGrossThb', { valueAsNumber: true }).ref}
                  error={errors.priceGrossThb?.message}
                  placeholder="0.00"
                  currency
                  min={0}
                  step={0.01}
                />

                {/* Tax Calculation Helpers */}
                <TaxCalculationHelpers
                  grossAmount={watchedValues.priceGrossThb || 0}
                  autoCalculateVat={autoCalculateVat}
                  autoCalculateWht={autoCalculateWht}
                  onVatToggle={(enabled) => {
                    setAutoCalculateVat(enabled)
                    if (enabled && watchedValues.priceGrossThb) {
                      setValue('vatThb', watchedValues.priceGrossThb * 0.07)
                    }
                  }}
                  onWhtToggle={(enabled) => {
                    setAutoCalculateWht(enabled)
                    if (enabled && watchedValues.priceGrossThb) {
                      setValue('withholdingThb', watchedValues.priceGrossThb * 0.03)
                    }
                  }}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <NumberInput
                    label="VAT Amount (฿)"
                    name="vatThb"
                    onChange={form.register('vatThb', { valueAsNumber: true }).onChange}
                    onBlur={form.register('vatThb', { valueAsNumber: true }).onBlur}
                    ref={form.register('vatThb', { valueAsNumber: true }).ref}
                    error={errors.vatThb?.message}
                    placeholder="0.00"
                    currency
                    min={0}
                    step={0.01}
                  />
                  
                  <NumberInput
                    label="Withholding Tax (฿)"
                    name="withholdingThb"
                    onChange={form.register('withholdingThb', { valueAsNumber: true }).onChange}
                    onBlur={form.register('withholdingThb', { valueAsNumber: true }).onBlur}
                    ref={form.register('withholdingThb', { valueAsNumber: true }).ref}
                    error={errors.withholdingThb?.message}
                    placeholder="0.00"
                    currency
                    min={0}
                    step={0.01}
                  />
                </div>

                {watchedValues.kind === 'income' && (
                  <NumberInput
                    label="Commission (฿)"
                    name="commissionThb"
                    onChange={form.register('commissionThb', { valueAsNumber: true }).onChange}
                    onBlur={form.register('commissionThb', { valueAsNumber: true }).onBlur}
                    ref={form.register('commissionThb', { valueAsNumber: true }).ref}
                    error={errors.commissionThb?.message}
                    placeholder="0.00"
                    currency
                    min={0}
                    step={0.01}
                  />
                )}
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-neutral-900">
                  Additional Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Project"
                    {...form.register('project')}
                    error={errors.project?.message}
                    placeholder="Enter project name..."
                  />
                  
                  <Input
                    label="Invoice Number"
                    {...form.register('invoiceNo')}
                    error={errors.invoiceNo?.message}
                    placeholder="Enter invoice number..."
                  />
                </div>

                <Textarea
                  label="Remarks"
                  {...form.register('remark')}
                  error={errors.remark?.message}
                  placeholder="Add any additional notes..."
                  rows={3}
                />
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="border-t border-neutral-200 p-6">
            <div className="flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={updateEntryMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit(onSubmit)}
                loading={updateEntryMutation.isPending}
                disabled={!isDirty}
              >
                Update Entry
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}