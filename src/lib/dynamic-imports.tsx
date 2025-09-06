'use client'

import dynamic from 'next/dynamic'
import { ComponentType } from 'react'
import { Spinner, ChartSkeleton, CardSkeleton } from '@/components/ui/LoadingStates'

// Loading components for different types of content
const ChartLoading = () => <ChartSkeleton />
const CardLoading = () => <CardSkeleton count={3} />
const FormLoading = () => (
  <div className="flex items-center justify-center py-12">
    <Spinner size="lg" />
  </div>
)
const PageLoading = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <Spinner size="lg" />
  </div>
)

// Dynamic imports for heavy components
export const DynamicMiniChart = dynamic(
  () => import('@/components/dashboard/MiniChart').then(mod => ({ default: mod.MiniChart })),
  {
    loading: ChartLoading,
    ssr: false, // Disable SSR for chart components to avoid hydration issues
  }
)

export const DynamicRecentEntries = dynamic(
  () => import('@/components/dashboard/RecentEntries').then(mod => ({ default: mod.RecentEntries })),
  {
    loading: CardLoading,
    ssr: true, // Keep SSR for better SEO
  }
)

// Reports page components
export const DynamicMonthlyChart = dynamic(
  () => import('@/components/reports/MonthlyChart').then(mod => ({ default: mod.MonthlyChart })),
  {
    loading: ChartLoading,
    ssr: false,
  }
)

export const DynamicSummaryStats = dynamic(
  () => import('@/components/reports/SummaryStats').then(mod => ({ default: mod.SummaryStats })),
  {
    loading: CardLoading,
    ssr: true,
  }
)

// Entry form components
export const DynamicEntryForm = dynamic(
  () => import('@/components/entries/EntryForm').then(mod => ({ default: mod.EntryForm })),
  {
    loading: FormLoading,
    ssr: true,
  }
)

export const DynamicLivePreview = dynamic(
  () => import('@/components/entries/LivePreview').then(mod => ({ default: mod.LivePreview })),
  {
    loading: () => (
      <div className="bg-white rounded-xl p-6 shadow-soft">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-neutral-200 rounded w-1/3" />
          <div className="space-y-2">
            <div className="h-4 bg-neutral-200 rounded" />
            <div className="h-4 bg-neutral-200 rounded w-2/3" />
          </div>
        </div>
      </div>
    ),
    ssr: false, // Live preview doesn't need SSR
  }
)

// Import page components
export const DynamicCSVImport = dynamic(
  () => import('@/components/import/CSVImport'),
  {
    loading: FormLoading,
    ssr: true,
  }
)

// Entry list components
export const DynamicEntryList = dynamic(
  () => import('@/components/entries/EntryList').then(mod => ({ default: mod.EntryList })),
  {
    loading: CardLoading,
    ssr: true,
  }
)

export const DynamicSearchFilter = dynamic(
  () => import('@/components/entries/SearchFilter').then(mod => ({ default: mod.SearchFilter })),
  {
    loading: () => (
      <div className="bg-white rounded-xl p-4 shadow-soft">
        <div className="animate-pulse flex gap-4">
          <div className="h-10 bg-neutral-200 rounded flex-1" />
          <div className="h-10 bg-neutral-200 rounded w-32" />
          <div className="h-10 bg-neutral-200 rounded w-32" />
        </div>
      </div>
    ),
    ssr: true,
  }
)

// Utility function to create dynamic imports with consistent loading states
export function createDynamicImport<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: {
    loading?: () => JSX.Element
    ssr?: boolean
    loadingType?: 'chart' | 'card' | 'form' | 'page'
  } = {}
) {
  const { loading, ssr = true, loadingType = 'page' } = options
  
  const loadingComponents = {
    chart: ChartLoading,
    card: CardLoading,
    form: FormLoading,
    page: PageLoading,
  }
  
  return dynamic(importFn, {
    loading: loading || loadingComponents[loadingType],
    ssr,
  })
}

// Preload functions for critical components
export const preloadDashboardComponents = () => {
  // Preload dashboard components when user is likely to navigate there
  import('@/components/dashboard/MiniChart')
  import('@/components/dashboard/RecentEntries')
}

export const preloadReportsComponents = () => {
  // Preload reports components
  import('@/components/reports/MonthlyChart')
  import('@/components/reports/SummaryStats')
}

export const preloadEntryComponents = () => {
  // Preload entry form components
  import('@/components/entries/EntryForm')
  import('@/components/entries/LivePreview')
}