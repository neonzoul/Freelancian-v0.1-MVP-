import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi } from 'vitest'

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Mock data factories
export const createMockEntry = (overrides = {}) => ({
  id: 'test-entry-1',
  kind: 'income' as const,
  title: 'Test Entry',
  docDate: new Date('2024-01-15'),
  transferDate: new Date('2024-01-16'),
  clientName: 'Test Client',
  vendorName: null,
  productService: 'Web Development',
  accountName: 'Main Account',
  priceGrossThb: 10000,
  vatThb: 700,
  withholdingThb: 300,
  commissionThb: 0,
  totalNetThb: 10400,
  project: 'Test Project',
  remark: 'Test remark',
  invoiceNo: 'INV-001',
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-15'),
  ...overrides,
})

export const createMockDashboardMetrics = (overrides = {}) => ({
  totalIncome: 50000,
  totalExpenses: 15000,
  netAmount: 35000,
  entryCount: {
    income: 5,
    expense: 3,
    total: 8,
  },
  ...overrides,
})

export const createMockMonthlyTrend = (overrides = {}) => ({
  month: '2024-01',
  totalIncome: 25000,
  totalExpenses: 8000,
  netAmount: 17000,
  entryCount: 4,
  ...overrides,
})

// Mock API responses
export const mockApiResponse = <T,>(data: T) => ({
  success: true,
  data,
  timestamp: new Date().toISOString(),
  requestId: 'test-request-id',
})

export const mockApiError = (message = 'Test error') => ({
  success: false,
  error: {
    type: 'TEST_ERROR',
    title: 'Test Error',
    status: 400,
    detail: message,
    instance: '/test',
  },
  timestamp: new Date().toISOString(),
  requestId: 'test-request-id',
})

// Utility functions for testing
export const waitForLoadingToFinish = () => 
  new Promise(resolve => setTimeout(resolve, 0))

export const mockIntersectionObserver = () => {
  const mockIntersectionObserver = vi.fn()
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  })
  window.IntersectionObserver = mockIntersectionObserver
}

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }