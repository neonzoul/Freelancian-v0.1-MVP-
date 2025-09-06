'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { MetricsCard } from '@/components/dashboard/MetricsCard'
import { RecentEntries } from '@/components/dashboard/RecentEntries'
import { MiniChart } from '@/components/dashboard/MiniChart'
import { useDashboardMetrics, useRecentEntries } from '@/lib/hooks/use-dashboard'
import type { DashboardMetrics, EntryResponse } from '@/types'

// Icons for metrics cards
function IncomeIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
    </svg>
  )
}

function ExpenseIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 0h10a2 2 0 002-2v-2a2 2 0 00-2-2H9a2 2 0 00-2 2v2a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  )
}

function NetIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const { data: metrics, isLoading: metricsLoading, error: metricsError } = useDashboardMetrics()
  const { data: recentEntries, isLoading: entriesLoading, error: entriesError } = useRecentEntries(10)

  const handleEditEntry = (entryId: string) => {
    // TODO: Implement edit functionality
    console.log('Edit entry:', entryId)
  }

  const handleDeleteEntry = (entryId: string) => {
    // TODO: Implement delete functionality
    console.log('Delete entry:', entryId)
  }

  const handleAddEntry = () => {
    router.push('/entries/new')
  }

  const handleViewReports = () => {
    router.push('/reports')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                Dashboard
              </h1>
              <p className="text-neutral-600">
                Welcome back! Here&apos;s your financial overview for this month.
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => router.push('/import')}
                className="flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Import Data
              </Button>
              
              <Button
                variant="outline"
                onClick={handleViewReports}
                className="flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                View Reports
              </Button>
              
              <Button
                variant="primary"
                onClick={handleAddEntry}
                className="flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Entry
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Error States */}
        {(metricsError || entriesError) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <div className="flex items-center gap-2 text-red-800">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">
                Failed to load dashboard data. Please try refreshing the page.
              </span>
            </div>
          </motion.div>
        )}

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <MetricsCard
            title="Total Income"
            value={(metrics as DashboardMetrics)?.totalIncome || 0}
            icon={<IncomeIcon />}
            variant="income"
            isLoading={metricsLoading}
          />
          
          <MetricsCard
            title="Total Expenses"
            value={(metrics as DashboardMetrics)?.totalExpenses || 0}
            icon={<ExpenseIcon />}
            variant="expense"
            isLoading={metricsLoading}
          />
          
          <MetricsCard
            title="Net Amount"
            value={(metrics as DashboardMetrics)?.netAmount || 0}
            icon={<NetIcon />}
            variant="net"
            isLoading={metricsLoading}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Entries - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <RecentEntries
              entries={(recentEntries as EntryResponse[]) || []}
              isLoading={entriesLoading}
              onEditEntry={handleEditEntry}
              onDeleteEntry={handleDeleteEntry}
            />
          </div>

          {/* Mini Chart - Takes 1 column on large screens */}
          <div className="lg:col-span-1">
            <MiniChart
              metrics={(metrics as DashboardMetrics) || {
                totalIncome: 0,
                totalExpenses: 0,
                netAmount: 0,
                entryCount: { income: 0, expense: 0, total: 0 }
              }}
              isLoading={metricsLoading}
            />
          </div>
        </div>
      </div>
    </div>
  )
}