'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { FileUpload } from '@/components/import/FileUpload'
import { ImportPreview } from '@/components/import/ImportPreview'
import { FieldMapping } from '@/components/import/FieldMapping'
import { ImportResults } from '@/components/import/ImportResults'
import { ImportProgress } from '@/components/import/ImportProgress'
import type { ImportStep, ParsedCSVData, FieldMappingConfig, ImportResult } from '@/types/import'

export default function ImportPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<ImportStep>('upload')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [entryType, setEntryType] = useState<'income' | 'expense'>('income')
  const [parsedData, setParsedData] = useState<ParsedCSVData | null>(null)
  const [fieldMapping, setFieldMapping] = useState<FieldMappingConfig>({})
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileSelect = (file: File, type: 'income' | 'expense') => {
    setSelectedFile(file)
    setEntryType(type)
    setCurrentStep('preview')
  }

  const handlePreviewConfirm = (data: ParsedCSVData) => {
    setParsedData(data)
    setCurrentStep('mapping')
  }

  const handleMappingConfirm = (mapping: FieldMappingConfig) => {
    setFieldMapping(mapping)
    setCurrentStep('processing')
    processImport(mapping)
  }

  const processImport = async (mapping: FieldMappingConfig) => {
    if (!parsedData || !selectedFile) return

    setIsProcessing(true)
    
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('entryType', entryType)
      formData.append('mapping', JSON.stringify(mapping))

      const response = await fetch('/api/import/execute', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Import failed')
      }

      const result = await response.json()
      setImportResult(result.data)
      setCurrentStep('results')
    } catch (error) {
      console.error('Import error:', error)
      // TODO: Show error toast
    } finally {
      setIsProcessing(false)
    }
  }

  const handleStartOver = () => {
    setCurrentStep('upload')
    setSelectedFile(null)
    setParsedData(null)
    setFieldMapping({})
    setImportResult(null)
    setIsProcessing(false)
  }

  const handleGoToDashboard = () => {
    router.push('/dashboard')
  }

  const handleGoToEntries = () => {
    router.push('/entries')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </Button>
          </div>
          
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Import Data
          </h1>
          <p className="text-neutral-600">
            Import your existing financial data from CSV files exported from Notion or other tools.
          </p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-4">
              {[
                { key: 'upload', label: 'Upload File', icon: '📁' },
                { key: 'preview', label: 'Preview Data', icon: '👀' },
                { key: 'mapping', label: 'Map Fields', icon: '🔗' },
                { key: 'processing', label: 'Processing', icon: '⚙️' },
                { key: 'results', label: 'Results', icon: '✅' },
              ].map((step, index) => (
                <div key={step.key} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium ${
                      currentStep === step.key
                        ? 'bg-primary-600 text-white'
                        : index < ['upload', 'preview', 'mapping', 'processing', 'results'].indexOf(currentStep)
                        ? 'bg-green-500 text-white'
                        : 'bg-neutral-200 text-neutral-600'
                    }`}
                  >
                    {step.icon}
                  </div>
                  <span className="ml-2 text-sm font-medium text-neutral-700">
                    {step.label}
                  </span>
                  {index < 4 && (
                    <div className="w-8 h-0.5 bg-neutral-200 mx-4" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Step Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-4xl mx-auto"
        >
          {currentStep === 'upload' && (
            <FileUpload onFileSelect={handleFileSelect} />
          )}

          {currentStep === 'preview' && selectedFile && (
            <ImportPreview
              file={selectedFile}
              entryType={entryType}
              onConfirm={handlePreviewConfirm}
              onBack={() => setCurrentStep('upload')}
            />
          )}

          {currentStep === 'mapping' && parsedData && (
            <FieldMapping
              parsedData={parsedData}
              entryType={entryType}
              onConfirm={handleMappingConfirm}
              onBack={() => setCurrentStep('preview')}
            />
          )}

          {currentStep === 'processing' && (
            <ImportProgress
              isProcessing={isProcessing}
              fileName={selectedFile?.name || ''}
            />
          )}

          {currentStep === 'results' && importResult && (
            <ImportResults
              result={importResult}
              onStartOver={handleStartOver}
              onGoToDashboard={handleGoToDashboard}
              onGoToEntries={handleGoToEntries}
            />
          )}
        </motion.div>
      </div>
    </div>
  )
}