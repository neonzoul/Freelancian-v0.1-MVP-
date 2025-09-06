'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/Card'

interface ImportProgressProps {
  isProcessing: boolean
  fileName: string
}

export function ImportProgress({ isProcessing, fileName }: ImportProgressProps) {
  return (
    <Card className="p-8">
      <div className="text-center">
        {/* Processing Animation */}
        <motion.div
          className="w-20 h-20 mx-auto mb-6"
          animate={{ rotate: isProcessing ? 360 : 0 }}
          transition={{ duration: 2, repeat: isProcessing ? Infinity : 0, ease: 'linear' }}
        >
          <div className="w-full h-full border-4 border-primary-200 border-t-primary-600 rounded-full"></div>
        </motion.div>

        {/* Status Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-xl font-semibold text-neutral-900 mb-2">
            {isProcessing ? 'Processing Import...' : 'Import Complete'}
          </h3>
          <p className="text-neutral-600 mb-6">
            {isProcessing 
              ? `Importing data from ${fileName}. This may take a few moments.`
              : `Successfully processed ${fileName}`
            }
          </p>
        </motion.div>

        {/* Progress Steps */}
        <div className="space-y-4">
          {[
            { label: 'Parsing CSV data', completed: true },
            { label: 'Validating entries', completed: isProcessing },
            { label: 'Creating database entries', completed: !isProcessing },
            { label: 'Generating summary', completed: !isProcessing },
          ].map((step, index) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 + 0.3 }}
              className="flex items-center gap-3 text-left max-w-md mx-auto"
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                step.completed 
                  ? 'bg-green-500 text-white' 
                  : 'bg-neutral-200 text-neutral-600'
              }`}>
                {step.completed ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <div className="w-2 h-2 bg-current rounded-full"></div>
                )}
              </div>
              <span className={`text-sm ${
                step.completed ? 'text-neutral-900' : 'text-neutral-600'
              }`}>
                {step.label}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Processing Tips */}
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-8 p-4 bg-blue-50 rounded-lg"
          >
            <h4 className="font-medium text-blue-900 mb-2">
              💡 Processing Tips
            </h4>
            <ul className="text-sm text-blue-800 space-y-1 text-left max-w-md mx-auto">
              <li>• Large files may take several minutes to process</li>
              <li>• Invalid entries will be skipped with detailed error reports</li>
              <li>• Duplicate entries are automatically detected</li>
              <li>• You can safely close this tab - import will continue</li>
            </ul>
          </motion.div>
        )}
      </div>
    </Card>
  )
}