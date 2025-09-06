'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import type { DashboardMetrics } from '@/types'

interface MiniChartProps {
  metrics: DashboardMetrics
  isLoading?: boolean
}

interface BarProps {
  label: string
  value: number
  maxValue: number
  color: string
  delay: number
}

function AnimatedBar({ label, value, maxValue, color, delay }: BarProps) {
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0
  
  return (
    <div className="flex items-center gap-3">
      <div className="w-16 text-xs text-neutral-600 font-medium">
        {label}
      </div>
      
      <div className="flex-1 relative">
        <div className="h-6 bg-neutral-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ delay, duration: 1, ease: 'easeOut' }}
            className={`h-full rounded-full ${color} relative`}
          >
            {/* Shimmer effect */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ 
                delay: delay + 0.5, 
                duration: 1.5, 
                ease: 'easeInOut',
                repeat: Infinity,
                repeatDelay: 2
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />
          </motion.div>
        </div>
      </div>
      
      <div className="w-20 text-right text-sm font-semibold text-neutral-700">
        ฿{value.toLocaleString()}
      </div>
    </div>
  )
}

function MiniChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="w-32 h-5 bg-neutral-200 rounded animate-pulse" />
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="w-16 h-4 bg-neutral-200 rounded animate-pulse" />
            <div className="flex-1 h-6 bg-neutral-200 rounded-full animate-pulse" />
            <div className="w-20 h-4 bg-neutral-200 rounded animate-pulse" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export function MiniChart({ metrics, isLoading = false }: MiniChartProps) {
  if (isLoading) {
    return <MiniChartSkeleton />
  }
  
  const { totalIncome, totalExpenses, netAmount } = metrics
  const maxValue = Math.max(totalIncome, Math.abs(totalExpenses), Math.abs(netAmount))
  
  // If no data, show empty state
  if (maxValue === 0) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-neutral-900">
            Financial Overview
          </h3>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-3 bg-neutral-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-sm text-neutral-600">
              No financial data for this month
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <Card hover variant="elevated">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-neutral-900">
              Financial Overview
            </h3>
            <div className="text-xs text-neutral-500">
              Current Month
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <AnimatedBar
            label="Income"
            value={totalIncome}
            maxValue={maxValue}
            color="bg-gradient-to-r from-green-500 to-green-400"
            delay={0.2}
          />
          
          <AnimatedBar
            label="Expenses"
            value={Math.abs(totalExpenses)}
            maxValue={maxValue}
            color="bg-gradient-to-r from-red-500 to-red-400"
            delay={0.4}
          />
          
          <div className="pt-2 border-t border-neutral-200">
            <AnimatedBar
              label="Net"
              value={Math.abs(netAmount)}
              maxValue={maxValue}
              color={netAmount >= 0 
                ? "bg-gradient-to-r from-blue-500 to-blue-400" 
                : "bg-gradient-to-r from-orange-500 to-orange-400"
              }
              delay={0.6}
            />
          </div>
          
          {/* Summary stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="pt-3 border-t border-neutral-100"
          >
            <div className="flex justify-between items-center text-sm">
              <span className="text-neutral-600">
                {metrics.entryCount.total} entries this month
              </span>
              <span className={`font-semibold ${
                netAmount >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {netAmount >= 0 ? 'Profit' : 'Loss'}: ฿{Math.abs(netAmount).toLocaleString()}
              </span>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}