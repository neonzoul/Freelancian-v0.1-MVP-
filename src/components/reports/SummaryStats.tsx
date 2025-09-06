'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import type { TrendSummary, MonthlyTrend } from '@/types'
import { clsx } from 'clsx'

interface SummaryStatsProps {
  summary?: TrendSummary
  trends?: MonthlyTrend[]
  isLoading?: boolean
  selectedPeriod: number
}

interface StatCardProps {
  title: string
  value: number
  trend?: number
  format: 'currency' | 'number'
  icon: React.ReactNode
  delay: number
}

function StatCard({ title, value, trend, format, icon, delay }: StatCardProps) {
  const formatValue = (val: number) => {
    if (format === 'currency') {
      return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(val)
    }
    return val.toLocaleString()
  }

  const getTrendColor = (trendValue?: number) => {
    if (!trendValue) return 'text-neutral-500'
    return trendValue > 0 ? 'text-green-600' : 'text-red-600'
  }

  const getTrendIcon = (trendValue?: number) => {
    if (!trendValue) return null
    
    if (trendValue > 0) {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
        </svg>
      )
    }
    
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10h10" />
      </svg>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: 'easeOut' }}
    >
      <Card hover variant="elevated" className="h-full">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-neutral-600 mb-2">
                {title}
              </p>
              
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: delay + 0.2, duration: 0.3 }}
                className="text-2xl font-bold text-neutral-900 mb-2"
              >
                {formatValue(value)}
              </motion.div>
              
              {trend !== undefined && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: delay + 0.4, duration: 0.3 }}
                  className={clsx(
                    'flex items-center gap-1 text-sm font-medium',
                    getTrendColor(trend)
                  )}
                >
                  {getTrendIcon(trend)}
                  <span>
                    {Math.abs(trend).toFixed(1)}% vs last period
                  </span>
                </motion.div>
              )}
            </div>
            
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: delay + 0.3, duration: 0.5, type: 'spring' }}
              className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600"
            >
              <div className="w-6 h-6">
                {icon}
              </div>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function SummaryStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="w-24 h-4 bg-neutral-200 rounded animate-pulse mb-2" />
                <div className="w-32 h-8 bg-neutral-200 rounded animate-pulse mb-2" />
                <div className="w-28 h-4 bg-neutral-200 rounded animate-pulse" />
              </div>
              <div className="w-12 h-12 bg-neutral-200 rounded-full animate-pulse" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function SummaryStats({ summary, trends, isLoading, selectedPeriod }: SummaryStatsProps) {
  if (isLoading) {
    return <SummaryStatsSkeleton />
  }

  if (!summary || !trends) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-neutral-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">
            No Data Available
          </h3>
          <p className="text-neutral-600">
            No financial data found for the selected period.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Calculate trends from the most recent vs previous period
  const latestTrend = trends.length > 1 ? trends[trends.length - 1] : null
  const previousTrend = trends.length > 1 ? trends[trends.length - 2] : null
  
  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / Math.abs(previous)) * 100
  }

  const incomeTrend = latestTrend && previousTrend 
    ? calculateTrend(latestTrend.totalIncome, previousTrend.totalIncome)
    : undefined

  const expenseTrend = latestTrend && previousTrend
    ? calculateTrend(latestTrend.totalExpenses, previousTrend.totalExpenses)
    : undefined

  const netTrend = latestTrend && previousTrend
    ? calculateTrend(latestTrend.netAmount, previousTrend.netAmount)
    : undefined

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <h2 className="text-xl font-semibold text-neutral-900 mb-2">
          Summary Statistics
        </h2>
        <p className="text-neutral-600">
          Average performance over the last {selectedPeriod} months
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Average Income"
          value={summary.averageIncome}
          trend={incomeTrend}
          format="currency"
          delay={0}
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          }
        />

        <StatCard
          title="Average Expenses"
          value={summary.averageExpenses}
          trend={expenseTrend}
          format="currency"
          delay={0.1}
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 0h10a2 2 0 002-2v-2a2 2 0 00-2-2H9a2 2 0 00-2 2v2a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />

        <StatCard
          title="Average Net"
          value={summary.averageNet}
          trend={netTrend}
          format="currency"
          delay={0.2}
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        />

        <StatCard
          title="Total Entries"
          value={summary.totalEntries}
          format="number"
          delay={0.3}
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
      </div>
    </div>
  )
}