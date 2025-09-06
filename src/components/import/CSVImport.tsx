'use client'

import { useState } from 'react'
import { FileUpload } from './FileUpload'
import { ImportPreview } from './ImportPreview'
import { FieldMapping } from './FieldMapping'
import { ImportProgress } from './ImportProgress'
import { ImportResults } from './ImportResults'
import type { ParsedCSVData, FieldMapping as FieldMappingType, ImportResult } from '@/types/import'

type ImportStep = 'upload' | 'preview' | 'mapping' | 'importing' | 'results'

export default function CSVImport() {
  const [currentStep, setCurrentStep] = useState<ImportStep>('upload')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [entryType, setEntryType] = useState<'income' | 'expense'>('income')
  const [parsedData, setParsedData] = useState<ParsedCSVData | null>(null)
  const [fieldMapping, setFieldMapping] = useState<FieldMappingType | null>(null)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)

  const handleFileSelect = (file: File, type: 'income' | 'expense') => {
    setSelectedFile(file)
    setEntryType(type)
    setCurrentStep('preview')
  }

  const handlePreviewConfirm = (data: ParsedCSVData) => {
    setParsedData(data)
    setCurrentStep('mapping')
  }

  const handleMappingConfirm = async (mapping: FieldMappingType) => {
    setFieldMapping(mapping)
    setCurrentStep('importing')
    
    // Simulate import process
    try {
      const response = await fetch('/api/import/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: parsedData,
          mapping,
          entryType,
        }),
      })

      const result = await response.json()
      setImportResult(result)
      setCurrentStep('results')
    } catch (error) {
      setImportResult({
        success: false,
        imported: 0,
        skipped: 0,
        errors: ['Failed to import data. Please try again.'],
        summary: {
          totalRows: parsedData?.totalRows || 0,
          successfulImports: 0,
          skippedRows: 0,
          errorRows: parsedData?.totalRows || 0,
        }
      })
      setCurrentStep('results')
    }
  }

  const handleStartOver = () => {
    setCurrentStep('upload')
    setSelectedFile(null)
    setParsedData(null)
    setFieldMapping(null)
    setImportResult(null)
  }

  const handleBack = () => {
    switch (currentStep) {
      case 'preview':
        setCurrentStep('upload')
        break
      case 'mapping':
        setCurrentStep('preview')
        break
      case 'results':
        setCurrentStep('upload')
        break
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[
            { key: 'upload', label: 'Upload File', icon: '📁' },
            { key: 'preview', label: 'Preview Data', icon: '👀' },
            { key: 'mapping', label: 'Map Fields', icon: '🔗' },
            { key: 'importing', label: 'Importing', icon: '⚡' },
            { key: 'results', label: 'Results', icon: '✅' },
          ].map((step, index) => {
            const isActive = currentStep === step.key
            const isCompleted = ['upload', 'preview', 'mapping', 'importing'].indexOf(currentStep) > 
                              ['upload', 'preview', 'mapping', 'importing'].indexOf(step.key)
            
            return (
              <div key={step.key} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium ${
                  isCompleted 
                    ? 'bg-green-500 text-white' 
                    : isActive 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-neutral-200 text-neutral-600'
                }`}>
                  {isCompleted ? '✓' : step.icon}
                </div>
                <div className="ml-3 hidden sm:block">
                  <div className={`text-sm font-medium ${
                    isActive ? 'text-primary-600' : isCompleted ? 'text-green-600' : 'text-neutral-500'
                  }`}>
                    {step.label}
                  </div>
                </div>
                {index < 4 && (
                  <div className={`w-8 h-0.5 mx-4 ${
                    isCompleted ? 'bg-green-500' : 'bg-neutral-200'
                  }`} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Step Content */}
      {currentStep === 'upload' && (
        <FileUpload onFileSelect={handleFileSelect} />
      )}

      {currentStep === 'preview' && selectedFile && (
        <ImportPreview
          file={selectedFile}
          entryType={entryType}
          onConfirm={handlePreviewConfirm}
          onBack={handleBack}
        />
      )}

      {currentStep === 'mapping' && parsedData && (
        <FieldMapping
          parsedData={parsedData}
          entryType={entryType}
          onConfirm={handleMappingConfirm}
          onBack={handleBack}
        />
      )}

      {currentStep === 'importing' && (
        <ImportProgress 
          isProcessing={true}
          fileName={selectedFile?.name || 'Unknown file'}
        />
      )}

      {currentStep === 'results' && importResult && (
        <ImportResults
          result={importResult}
          onStartOver={handleStartOver}
          onGoToDashboard={() => window.location.href = '/dashboard'}
          onGoToEntries={() => window.location.href = '/entries'}
        />
      )}
    </div>
  )
}