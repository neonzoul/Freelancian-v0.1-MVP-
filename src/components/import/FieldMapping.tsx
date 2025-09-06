'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Select } from '@/components/ui/Select'
import type { ParsedCSVData, FieldMappingConfig } from '@/types/import'
import { NOTION_FIELD_MAPPINGS, ENTRY_FIELD_LABELS, REQUIRED_FIELDS, RECOMMENDED_FIELDS } from '@/types/import'

interface FieldMappingProps {
  parsedData: ParsedCSVData
  entryType: 'income' | 'expense'
  onConfirm: (mapping: FieldMappingConfig) => void
  onBack: () => void
}

export function FieldMapping({ parsedData, entryType, onConfirm, onBack }: FieldMappingProps) {
  const [mapping, setMapping] = useState<FieldMappingConfig>({})
  const [autoMappingApplied, setAutoMappingApplied] = useState(false)

  // Available entry fields based on type
  const availableFields = {
    income: [
      'title', 'docDate', 'transferDate', 'clientName', 'productService',
      'accountName', 'priceGrossThb', 'vatThb', 'withholdingThb', 'commissionThb',
      'project', 'remark', 'invoiceNo'
    ],
    expense: [
      'title', 'docDate', 'transferDate', 'vendorName', 'productService',
      'accountName', 'priceGrossThb', 'vatThb', 'withholdingThb',
      'project', 'remark', 'invoiceNo'
    ]
  }

  useEffect(() => {
    applyAutoMapping()
  }, [parsedData, entryType]) // applyAutoMapping is defined inside the component and doesn't need to be in deps

  const applyAutoMapping = () => {
    const autoMapping: FieldMappingConfig = {}
    const notionMappings = NOTION_FIELD_MAPPINGS[entryType] as Record<string, string>

    parsedData.headers.forEach(header => {
      // Try exact match first
      if (notionMappings[header]) {
        autoMapping[header] = notionMappings[header]
        return
      }

      // Try case-insensitive match
      const lowerHeader = header.toLowerCase()
      const matchingKey = Object.keys(notionMappings).find(
        key => key.toLowerCase() === lowerHeader
      )
      
      if (matchingKey) {
        autoMapping[header] = notionMappings[matchingKey]
        return
      }

      // Try partial match
      const partialMatch = Object.keys(notionMappings).find(
        key => key.toLowerCase().includes(lowerHeader) || lowerHeader.includes(key.toLowerCase())
      )
      
      if (partialMatch) {
        autoMapping[header] = notionMappings[partialMatch]
        return
      }

      // Default to null (unmapped)
      autoMapping[header] = null
    })

    setMapping(autoMapping)
    setAutoMappingApplied(true)
  }

  const handleMappingChange = (csvField: string, entryField: string | null) => {
    setMapping(prev => ({
      ...prev,
      [csvField]: entryField
    }))
  }

  const getMappedFields = () => {
    return Object.values(mapping).filter(field => field !== null)
  }

  const getUnmappedRequiredFields = () => {
    const mappedFields = getMappedFields()
    return REQUIRED_FIELDS[entryType].filter(field => !mappedFields.includes(field))
  }

  const getUnmappedRecommendedFields = () => {
    const mappedFields = getMappedFields()
    return RECOMMENDED_FIELDS[entryType].filter(field => !mappedFields.includes(field))
  }

  const canProceed = () => {
    return getUnmappedRequiredFields().length === 0
  }

  const handleConfirm = () => {
    if (canProceed()) {
      onConfirm(mapping)
    }
  }

  const getFieldOptions = (csvField: string) => {
    const usedFields = Object.entries(mapping)
      .filter(([key, value]) => key !== csvField && value !== null)
      .map(([, value]) => value)

    return [
      { value: '', label: '-- Do not import --' },
      ...availableFields[entryType]
        .filter(field => !usedFields.includes(field))
        .map(field => ({
          value: field,
          label: ENTRY_FIELD_LABELS[field as keyof typeof ENTRY_FIELD_LABELS] || field
        }))
    ]
  }

  const getFieldPriority = (entryField: string | null) => {
    if (!entryField) return 'unmapped'
    if (REQUIRED_FIELDS[entryType].includes(entryField)) return 'required'
    if (RECOMMENDED_FIELDS[entryType].includes(entryField)) return 'recommended'
    return 'optional'
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'required': return 'border-red-200 bg-red-50'
      case 'recommended': return 'border-yellow-200 bg-yellow-50'
      case 'optional': return 'border-green-200 bg-green-50'
      default: return 'border-neutral-200 bg-neutral-50'
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'required':
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">Required</span>
      case 'recommended':
        return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">Recommended</span>
      case 'optional':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">Optional</span>
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-neutral-100 text-neutral-600 rounded">Unmapped</span>
    }
  }

  return (
    <div className="space-y-6">
      {/* Auto-mapping Status */}
      {autoMappingApplied && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-blue-800 font-medium">
              Auto-mapping applied based on common field names
            </span>
          </div>
          <p className="text-blue-700 text-sm mt-1">
            Review and adjust the mappings below as needed.
          </p>
        </motion.div>
      )}

      {/* Field Mapping */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          Map CSV Fields to Entry Fields
        </h3>
        
        <div className="space-y-4">
          {parsedData.headers.map((csvField, index) => {
            const mappedField = mapping[csvField]
            const priority = getFieldPriority(mappedField)
            const sampleData = parsedData.previewRows[0]?.[index] || ''
            
            return (
              <motion.div
                key={csvField}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 rounded-lg border ${getPriorityColor(priority)}`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-neutral-900 truncate">
                        {csvField}
                      </h4>
                      {getPriorityBadge(priority)}
                    </div>
                    
                    {sampleData && (
                      <p className="text-sm text-neutral-600 truncate" title={sampleData}>
                        Sample: {sampleData}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex-shrink-0 w-64">
                    <Select
                      value={mappedField || ''}
                      onChange={(e) => handleMappingChange(csvField, e.target.value || null)}
                      options={getFieldOptions(csvField)}
                      placeholder="Select field..."
                    />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </Card>

      {/* Mapping Summary */}
      <Card className="p-6">
        <h4 className="font-semibold text-neutral-900 mb-4">
          Mapping Summary
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="text-lg font-bold text-green-900">
              {getMappedFields().length}
            </div>
            <div className="text-sm text-green-700">Fields Mapped</div>
          </div>
          
          <div className="p-4 bg-red-50 rounded-lg">
            <div className="text-lg font-bold text-red-900">
              {getUnmappedRequiredFields().length}
            </div>
            <div className="text-sm text-red-700">Required Missing</div>
          </div>
          
          <div className="p-4 bg-yellow-50 rounded-lg">
            <div className="text-lg font-bold text-yellow-900">
              {getUnmappedRecommendedFields().length}
            </div>
            <div className="text-sm text-yellow-700">Recommended Missing</div>
          </div>
        </div>

        {/* Missing Required Fields Warning */}
        {getUnmappedRequiredFields().length > 0 && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium text-red-800">Required Fields Missing</span>
            </div>
            <p className="text-red-700 text-sm">
              Please map the following required fields: {getUnmappedRequiredFields().join(', ')}
            </p>
          </div>
        )}

        {/* Missing Recommended Fields Info */}
        {getUnmappedRecommendedFields().length > 0 && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium text-yellow-800">Recommended Fields</span>
            </div>
            <p className="text-yellow-700 text-sm">
              Consider mapping these fields for better data quality: {getUnmappedRecommendedFields().join(', ')}
            </p>
          </div>
        )}
      </Card>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button 
          variant="primary" 
          onClick={handleConfirm}
          disabled={!canProceed()}
        >
          Start Import
        </Button>
      </div>
    </div>
  )
}