'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { ParsedCSVData } from '@/types/import'

interface ImportPreviewProps {
  file: File
  entryType: 'income' | 'expense'
  onConfirm: (data: ParsedCSVData) => void
  onBack: () => void
}

export function ImportPreview({ file, entryType, onConfirm, onBack }: ImportPreviewProps) {
  const [parsedData, setParsedData] = useState<ParsedCSVData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    parseCSVFile()
  }, [file]) // parseCSVFile is defined inside the component and doesn't need to be in deps

  const parseCSVFile = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const text = await file.text()
      const lines = text.split('\n').filter(line => line.trim())
      
      if (lines.length < 2) {
        throw new Error('CSV file must have at least a header row and one data row')
      }

      // Parse CSV (simple implementation - handles basic CSV format)
      const rows = lines.map(line => {
        const result = []
        let current = ''
        let inQuotes = false
        
        for (let i = 0; i < line.length; i++) {
          const char = line[i]
          
          if (char === '"') {
            inQuotes = !inQuotes
          } else if (char === ',' && !inQuotes) {
            result.push(current.trim())
            current = ''
          } else {
            current += char
          }
        }
        
        result.push(current.trim())
        return result
      })

      const headers = rows[0]
      const dataRows = rows.slice(1)
      
      const data: ParsedCSVData = {
        headers,
        rows: dataRows,
        totalRows: dataRows.length,
        previewRows: dataRows.slice(0, 5), // First 5 rows for preview
      }

      setParsedData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse CSV file')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirm = () => {
    if (parsedData) {
      onConfirm(parsedData)
    }
  }

  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-neutral-600">Parsing CSV file...</p>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">
            Failed to Parse CSV
          </h3>
          <p className="text-neutral-600 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={onBack}>
              Try Another File
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  if (!parsedData) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* File Info */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">
              File Preview
            </h3>
            <p className="text-neutral-600">
              {file.name} • {parsedData.totalRows} rows • {entryType} entries
            </p>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            entryType === 'income' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {entryType.charAt(0).toUpperCase() + entryType.slice(1)}
          </div>
        </div>
      </Card>

      {/* Data Preview */}
      <Card className="p-6">
        <h4 className="font-semibold text-neutral-900 mb-4">
          Data Preview (First 5 rows)
        </h4>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-neutral-200">
                {parsedData.headers.map((header, index) => (
                  <th
                    key={index}
                    className="text-left py-3 px-4 font-medium text-neutral-900 bg-neutral-50"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {parsedData.previewRows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b border-neutral-100">
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="py-3 px-4 text-neutral-700 max-w-xs truncate"
                      title={cell}
                    >
                      {cell || <span className="text-neutral-400 italic">empty</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {parsedData.totalRows > 5 && (
          <p className="text-sm text-neutral-600 mt-4">
            ... and {parsedData.totalRows - 5} more rows
          </p>
        )}
      </Card>

      {/* Summary Stats */}
      <Card className="p-6">
        <h4 className="font-semibold text-neutral-900 mb-4">
          Import Summary
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-900">
              {parsedData.totalRows}
            </div>
            <div className="text-sm text-blue-700">Total Rows</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-900">
              {parsedData.headers.length}
            </div>
            <div className="text-sm text-green-700">Columns</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-900">
              {entryType === 'income' ? '💰' : '💸'}
            </div>
            <div className="text-sm text-purple-700">Entry Type</div>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button variant="primary" onClick={handleConfirm}>
          Continue to Field Mapping
        </Button>
      </div>
    </div>
  )
}