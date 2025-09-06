'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface PeriodSelectorProps {
  selectedPeriod: number
  onPeriodChange: (period: number) => void
}

const periodOptions = [
  { value: 3, label: '3 Months', description: 'Last quarter' },
  { value: 6, label: '6 Months', description: 'Half year' },
  { value: 12, label: '12 Months', description: 'Full year' },
  { value: 24, label: '24 Months', description: 'Two years' },
]

export function PeriodSelector({ selectedPeriod, onPeriodChange }: PeriodSelectorProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-1">
              Time Period
            </h3>
            <p className="text-sm text-neutral-600">
              Select the time range for your financial analysis
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {periodOptions.map((option, index) => (
              <motion.div
                key={option.value}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                <Button
                  variant={selectedPeriod === option.value ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => onPeriodChange(option.value)}
                  className="relative group"
                >
                  <span className="font-medium">{option.label}</span>
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-neutral-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                    {option.description}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-neutral-900"></div>
                  </div>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}