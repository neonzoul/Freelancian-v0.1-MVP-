import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/test-utils'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { EntryForm } from '@/components/entries/EntryForm'
import { EntryList } from '@/components/entries/EntryList'
import { Dashboard } from '@/components/dashboard'

// Mock API calls
global.fetch = vi.fn()

const mockFetch = vi.mocked(fetch)

describe('Entry Workflow Integration Tests', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    vi.clearAllMocks()
  })

  const renderWithQueryClient = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    )
  }

  describe('Complete Entry Creation Flow', () => {
    test('should create entry and update dashboard', async () => {
      // Mock successful entry creation
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            id: 'new-entry-id',
            kind: 'income',
            title: 'New Project',
            priceGrossThb: 10000,
            vatThb: 700,
            withholdingThb: 300,
            totalNetThb: 10400,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        }),
      } as Response)

      // Mock dashboard data refresh
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            totalIncome: 10400,
            totalExpenses: 0,
            netAmount: 10400,
            entryCount: { income: 1, expense: 0, total: 1 },
          },
        }),
      } as Response)

      renderWithQueryClient(<EntryForm />)

      // Fill out the form
      fireEvent.change(screen.getByLabelText(/title/i), {
        target: { value: 'New Project' },
      })
      fireEvent.change(screen.getByLabelText(/gross amount/i), {
        target: { value: '10000' },
      })
      fireEvent.change(screen.getByLabelText(/vat amount/i), {
        target: { value: '700' },
      })
      fireEvent.change(screen.getByLabelText(/withholding tax/i), {
        target: { value: '300' },
      })

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /save entry/i })
      fireEvent.click(submitButton)

      // Wait for submission
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/entries'),
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
            }),
            body: expect.stringContaining('New Project'),
          })
        )
      })

      // Verify success feedback
      await waitFor(() => {
        expect(screen.getByText(/entry created successfully/i)).toBeInTheDocument()
      })
    })

    test('should handle validation errors during creation', async () => {
      // Mock validation error response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          success: false,
          error: {
            type: 'VALIDATION_ERROR',
            title: 'Validation Failed',
            status: 400,
            detail: 'Withholding cannot exceed 3% of gross amount',
            errors: {
              withholdingThb: ['Withholding cannot exceed 3% of gross amount'],
            },
          },
        }),
      } as Response)

      renderWithQueryClient(<EntryForm />)

      // Fill form with invalid data
      fireEvent.change(screen.getByLabelText(/title/i), {
        target: { value: 'Invalid Entry' },
      })
      fireEvent.change(screen.getByLabelText(/gross amount/i), {
        target: { value: '1000' },
      })
      fireEvent.change(screen.getByLabelText(/withholding tax/i), {
        target: { value: '50' }, // 5% - exceeds limit
      })

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /save entry/i })
      fireEvent.click(submitButton)

      // Wait for error message
      await waitFor(() => {
        expect(screen.getByText(/withholding cannot exceed 3%/i)).toBeInTheDocument()
      })

      // Form should still be editable
      expect(screen.getByLabelText(/title/i)).not.toBeDisabled()
    })
  })

  describe('Entry List and Edit Flow', () => {
    test('should load entries and allow editing', async () => {
      const mockEntries = [
        {
          id: 'entry-1',
          kind: 'income',
          title: 'Existing Entry',
          priceGrossThb: 5000,
          vatThb: 350,
          withholdingThb: 150,
          totalNetThb: 5200,
          clientName: 'Test Client',
          createdAt: '2024-01-15T10:00:00.000Z',
          updatedAt: '2024-01-15T10:00:00.000Z',
        },
      ]

      // Mock entries list API
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockEntries,
          pagination: {
            page: 1,
            limit: 50,
            total: 1,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          },
        }),
      } as Response)

      renderWithQueryClient(<EntryList />)

      // Wait for entries to load
      await waitFor(() => {
        expect(screen.getByText('Existing Entry')).toBeInTheDocument()
      })

      // Click edit button
      const editButton = screen.getByRole('button', { name: /edit/i })
      fireEvent.click(editButton)

      // Should open edit panel
      await waitFor(() => {
        expect(screen.getByText(/edit entry/i)).toBeInTheDocument()
      })

      // Form should be populated with existing data
      expect(screen.getByDisplayValue('Existing Entry')).toBeInTheDocument()
      expect(screen.getByDisplayValue('5,000.00')).toBeInTheDocument()
    })

    test('should handle entry deletion with confirmation', async () => {
      const mockEntries = [
        {
          id: 'entry-to-delete',
          kind: 'expense',
          title: 'Entry to Delete',
          priceGrossThb: 1000,
          totalNetThb: 1000,
          createdAt: '2024-01-15T10:00:00.000Z',
          updatedAt: '2024-01-15T10:00:00.000Z',
        },
      ]

      // Mock entries list API
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockEntries,
          pagination: {
            page: 1,
            limit: 50,
            total: 1,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          },
        }),
      } as Response)

      renderWithQueryClient(<EntryList />)

      // Wait for entries to load
      await waitFor(() => {
        expect(screen.getByText('Entry to Delete')).toBeInTheDocument()
      })

      // Click delete button
      const deleteButton = screen.getByRole('button', { name: /delete/i })
      fireEvent.click(deleteButton)

      // Should show confirmation dialog
      await waitFor(() => {
        expect(screen.getByText(/are you sure/i)).toBeInTheDocument()
      })

      // Mock successful deletion
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { id: 'entry-to-delete' },
        }),
      } as Response)

      // Confirm deletion
      const confirmButton = screen.getByRole('button', { name: /confirm/i })
      fireEvent.click(confirmButton)

      // Wait for deletion API call
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/entries/entry-to-delete'),
          expect.objectContaining({
            method: 'DELETE',
          })
        )
      })
    })
  })

  describe('Search and Filter Flow', () => {
    test('should filter entries by search term', async () => {
      // Mock initial entries
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: [
            { id: '1', title: 'Web Development', kind: 'income' },
            { id: '2', title: 'Office Supplies', kind: 'expense' },
          ],
          pagination: { page: 1, limit: 50, total: 2 },
        }),
      } as Response)

      renderWithQueryClient(<EntryList />)

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Web Development')).toBeInTheDocument()
        expect(screen.getByText('Office Supplies')).toBeInTheDocument()
      })

      // Mock filtered results
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: [{ id: '1', title: 'Web Development', kind: 'income' }],
          pagination: { page: 1, limit: 50, total: 1 },
        }),
      } as Response)

      // Search for "web"
      const searchInput = screen.getByPlaceholderText(/search entries/i)
      fireEvent.change(searchInput, { target: { value: 'web' } })

      // Wait for filtered results
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('search=web'),
          expect.any(Object)
        )
      })
    })

    test('should filter entries by type', async () => {
      // Mock initial entries
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: [
            { id: '1', title: 'Income Entry', kind: 'income' },
            { id: '2', title: 'Expense Entry', kind: 'expense' },
          ],
          pagination: { page: 1, limit: 50, total: 2 },
        }),
      } as Response)

      renderWithQueryClient(<EntryList />)

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Income Entry')).toBeInTheDocument()
        expect(screen.getByText('Expense Entry')).toBeInTheDocument()
      })

      // Mock filtered results for income only
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: [{ id: '1', title: 'Income Entry', kind: 'income' }],
          pagination: { page: 1, limit: 50, total: 1 },
        }),
      } as Response)

      // Filter by income
      const typeFilter = screen.getByLabelText(/entry type/i)
      fireEvent.change(typeFilter, { target: { value: 'income' } })

      // Wait for filtered results
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('kind=income'),
          expect.any(Object)
        )
      })
    })
  })

  describe('Dashboard Integration', () => {
    test('should display updated metrics after entry creation', async () => {
      // Mock dashboard metrics
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            totalIncome: 15000,
            totalExpenses: 5000,
            netAmount: 10000,
            entryCount: { income: 3, expense: 2, total: 5 },
          },
        }),
      } as Response)

      // Mock recent entries
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: [
            {
              id: '1',
              title: 'Recent Entry',
              kind: 'income',
              totalNetThb: 5000,
              createdAt: new Date().toISOString(),
            },
          ],
        }),
      } as Response)

      renderWithQueryClient(<Dashboard />)

      // Wait for dashboard to load
      await waitFor(() => {
        expect(screen.getByText('฿15,000.00')).toBeInTheDocument() // Total income
        expect(screen.getByText('฿5,000.00')).toBeInTheDocument() // Total expenses
        expect(screen.getByText('฿10,000.00')).toBeInTheDocument() // Net amount
      })

      // Should show recent entries
      expect(screen.getByText('Recent Entry')).toBeInTheDocument()
    })
  })
})