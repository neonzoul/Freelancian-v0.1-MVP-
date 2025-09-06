import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/test-utils'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ImportPage } from '@/app/import/page'

// Mock file reading
const mockFileReader = {
  readAsText: vi.fn(),
  result: '',
  onload: null as any,
  onerror: null as any,
}

global.FileReader = vi.fn(() => mockFileReader) as any

// Mock fetch for API calls
global.fetch = vi.fn()
const mockFetch = vi.mocked(fetch)

describe('CSV Import Integration Tests', () => {
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

  const createMockFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv' })
    return new File([blob], filename, { type: 'text/csv' })
  }

  describe('Income CSV Import', () => {
    const incomeCSV = `Title,Date,Client,Service,Gross Amount,VAT,Withholding,Commission,Project,Invoice
Voice Over Project,2024-01-15,ABC Company,Voice Over,7000,490,210,0,Project A,INV-001
Web Development,2024-01-20,XYZ Corp,Development,15000,1050,450,0,Project B,INV-002`

    test('should preview income CSV data correctly', async () => {
      renderWithQueryClient(<ImportPage />)

      // Select income import
      const incomeTab = screen.getByRole('tab', { name: /income/i })
      fireEvent.click(incomeTab)

      // Mock file upload
      const fileInput = screen.getByLabelText(/upload income csv/i)
      const file = createMockFile(incomeCSV, 'income.csv')

      // Simulate file reading
      mockFileReader.readAsText.mockImplementation(() => {
        mockFileReader.result = incomeCSV
        if (mockFileReader.onload) {
          mockFileReader.onload({ target: { result: incomeCSV } } as any)
        }
      })

      fireEvent.change(fileInput, { target: { files: [file] } })

      // Wait for preview to load
      await waitFor(() => {
        expect(screen.getByText('Voice Over Project')).toBeInTheDocument()
        expect(screen.getByText('ABC Company')).toBeInTheDocument()
        expect(screen.getByText('7,000.00')).toBeInTheDocument()
      })

      // Should show field mapping
      expect(screen.getByText(/field mapping/i)).toBeInTheDocument()
      expect(screen.getByText(/2 rows detected/i)).toBeInTheDocument()
    })

    test('should handle field mapping for income CSV', async () => {
      renderWithQueryClient(<ImportPage />)

      const incomeTab = screen.getByRole('tab', { name: /income/i })
      fireEvent.click(incomeTab)

      const fileInput = screen.getByLabelText(/upload income csv/i)
      const file = createMockFile(incomeCSV, 'income.csv')

      mockFileReader.readAsText.mockImplementation(() => {
        mockFileReader.result = incomeCSV
        if (mockFileReader.onload) {
          mockFileReader.onload({ target: { result: incomeCSV } } as any)
        }
      })

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText('Voice Over Project')).toBeInTheDocument()
      })

      // Check field mappings
      const titleMapping = screen.getByLabelText(/map title field/i)
      expect(titleMapping).toHaveValue('Title')

      const clientMapping = screen.getByLabelText(/map client field/i)
      expect(clientMapping).toHaveValue('Client')

      const amountMapping = screen.getByLabelText(/map gross amount field/i)
      expect(amountMapping).toHaveValue('Gross Amount')

      // Change a mapping
      fireEvent.change(clientMapping, { target: { value: 'Client' } })
      expect(clientMapping).toHaveValue('Client')
    })

    test('should import income CSV successfully', async () => {
      renderWithQueryClient(<ImportPage />)

      const incomeTab = screen.getByRole('tab', { name: /income/i })
      fireEvent.click(incomeTab)

      const fileInput = screen.getByLabelText(/upload income csv/i)
      const file = createMockFile(incomeCSV, 'income.csv')

      mockFileReader.readAsText.mockImplementation(() => {
        mockFileReader.result = incomeCSV
        if (mockFileReader.onload) {
          mockFileReader.onload({ target: { result: incomeCSV } } as any)
        }
      })

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText('Voice Over Project')).toBeInTheDocument()
      })

      // Mock successful import API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            imported: 2,
            skipped: 0,
            errors: [],
          },
        }),
      } as Response)

      // Start import
      const importButton = screen.getByRole('button', { name: /import entries/i })
      fireEvent.click(importButton)

      // Wait for import to complete
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/import/execute'),
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
            }),
            body: expect.stringContaining('Voice Over Project'),
          })
        )
      })

      // Should show success message
      await waitFor(() => {
        expect(screen.getByText(/import completed successfully/i)).toBeInTheDocument()
        expect(screen.getByText(/2 entries imported/i)).toBeInTheDocument()
        expect(screen.getByText(/0 entries skipped/i)).toBeInTheDocument()
      })
    })
  })

  describe('Expense CSV Import', () => {
    const expenseCSV = `Title,Date,Vendor,Service,Gross Amount,VAT,Withholding,Project
Office Supplies,2024-01-10,Office Depot,Supplies,1500,105,45,Project A
Software License,2024-01-12,Adobe,Software,2000,140,60,Project B`

    test('should preview expense CSV data correctly', async () => {
      renderWithQueryClient(<ImportPage />)

      // Select expense import
      const expenseTab = screen.getByRole('tab', { name: /expense/i })
      fireEvent.click(expenseTab)

      const fileInput = screen.getByLabelText(/upload expense csv/i)
      const file = createMockFile(expenseCSV, 'expenses.csv')

      mockFileReader.readAsText.mockImplementation(() => {
        mockFileReader.result = expenseCSV
        if (mockFileReader.onload) {
          mockFileReader.onload({ target: { result: expenseCSV } } as any)
        }
      })

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText('Office Supplies')).toBeInTheDocument()
        expect(screen.getByText('Office Depot')).toBeInTheDocument()
        expect(screen.getByText('1,500.00')).toBeInTheDocument()
      })

      // Should show vendor field for expenses
      expect(screen.getByText('Office Depot')).toBeInTheDocument()
    })

    test('should import expense CSV successfully', async () => {
      renderWithQueryClient(<ImportPage />)

      const expenseTab = screen.getByRole('tab', { name: /expense/i })
      fireEvent.click(expenseTab)

      const fileInput = screen.getByLabelText(/upload expense csv/i)
      const file = createMockFile(expenseCSV, 'expenses.csv')

      mockFileReader.readAsText.mockImplementation(() => {
        mockFileReader.result = expenseCSV
        if (mockFileReader.onload) {
          mockFileReader.onload({ target: { result: expenseCSV } } as any)
        }
      })

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText('Office Supplies')).toBeInTheDocument()
      })

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            imported: 2,
            skipped: 0,
            errors: [],
          },
        }),
      } as Response)

      const importButton = screen.getByRole('button', { name: /import entries/i })
      fireEvent.click(importButton)

      await waitFor(() => {
        expect(screen.getByText(/import completed successfully/i)).toBeInTheDocument()
        expect(screen.getByText(/2 entries imported/i)).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    test('should handle invalid CSV format', async () => {
      renderWithQueryClient(<ImportPage />)

      const incomeTab = screen.getByRole('tab', { name: /income/i })
      fireEvent.click(incomeTab)

      const fileInput = screen.getByLabelText(/upload income csv/i)
      const invalidCSV = 'Invalid,CSV,Format\nMissing,Required'
      const file = createMockFile(invalidCSV, 'invalid.csv')

      mockFileReader.readAsText.mockImplementation(() => {
        mockFileReader.result = invalidCSV
        if (mockFileReader.onload) {
          mockFileReader.onload({ target: { result: invalidCSV } } as any)
        }
      })

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText(/invalid csv format/i)).toBeInTheDocument()
      })
    })

    test('should handle import errors', async () => {
      renderWithQueryClient(<ImportPage />)

      const incomeTab = screen.getByRole('tab', { name: /income/i })
      fireEvent.click(incomeTab)

      const fileInput = screen.getByLabelText(/upload income csv/i)
      const validCSV = 'Title,Date,Client,Gross Amount\nValid Entry,2024-01-15,Client A,1000'
      const file = createMockFile(validCSV, 'valid.csv')

      mockFileReader.readAsText.mockImplementation(() => {
        mockFileReader.result = validCSV
        if (mockFileReader.onload) {
          mockFileReader.onload({ target: { result: validCSV } } as any)
        }
      })

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText('Valid Entry')).toBeInTheDocument()
      })

      // Mock import error response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          success: false,
          error: {
            type: 'IMPORT_ERROR',
            title: 'Import Failed',
            status: 400,
            detail: 'Some entries could not be imported',
            errors: [
              { row: 1, field: 'title', message: 'Title is required' },
            ],
          },
        }),
      } as Response)

      const importButton = screen.getByRole('button', { name: /import entries/i })
      fireEvent.click(importButton)

      await waitFor(() => {
        expect(screen.getByText(/import failed/i)).toBeInTheDocument()
        expect(screen.getByText(/title is required/i)).toBeInTheDocument()
      })
    })

    test('should handle partial import success', async () => {
      renderWithQueryClient(<ImportPage />)

      const incomeTab = screen.getByRole('tab', { name: /income/i })
      fireEvent.click(incomeTab)

      const fileInput = screen.getByLabelText(/upload income csv/i)
      const mixedCSV = `Title,Date,Client,Gross Amount
Valid Entry,2024-01-15,Client A,1000
Invalid Entry,,Client B,invalid`
      const file = createMockFile(mixedCSV, 'mixed.csv')

      mockFileReader.readAsText.mockImplementation(() => {
        mockFileReader.result = mixedCSV
        if (mockFileReader.onload) {
          mockFileReader.onload({ target: { result: mixedCSV } } as any)
        }
      })

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText('Valid Entry')).toBeInTheDocument()
      })

      // Mock partial success response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            imported: 1,
            skipped: 1,
            errors: [
              { row: 2, field: 'grossAmount', message: 'Invalid amount format' },
            ],
          },
        }),
      } as Response)

      const importButton = screen.getByRole('button', { name: /import entries/i })
      fireEvent.click(importButton)

      await waitFor(() => {
        expect(screen.getByText(/import completed with warnings/i)).toBeInTheDocument()
        expect(screen.getByText(/1 entries imported/i)).toBeInTheDocument()
        expect(screen.getByText(/1 entries skipped/i)).toBeInTheDocument()
        expect(screen.getByText(/invalid amount format/i)).toBeInTheDocument()
      })
    })

    test('should handle file reading errors', async () => {
      renderWithQueryClient(<ImportPage />)

      const incomeTab = screen.getByRole('tab', { name: /income/i })
      fireEvent.click(incomeTab)

      const fileInput = screen.getByLabelText(/upload income csv/i)
      const file = createMockFile('test', 'test.csv')

      // Mock file reading error
      mockFileReader.readAsText.mockImplementation(() => {
        if (mockFileReader.onerror) {
          mockFileReader.onerror(new Error('File reading failed') as any)
        }
      })

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText(/failed to read file/i)).toBeInTheDocument()
      })
    })
  })

  describe('Field Mapping', () => {
    test('should auto-detect common field mappings', async () => {
      renderWithQueryClient(<ImportPage />)

      const incomeTab = screen.getByRole('tab', { name: /income/i })
      fireEvent.click(incomeTab)

      const fileInput = screen.getByLabelText(/upload income csv/i)
      const notionCSV = `Name,Date,Client Name,Amount,VAT Amount,WHT Amount
Project 1,2024-01-15,Client A,1000,70,30`
      const file = createMockFile(notionCSV, 'notion-export.csv')

      mockFileReader.readAsText.mockImplementation(() => {
        mockFileReader.result = notionCSV
        if (mockFileReader.onload) {
          mockFileReader.onload({ target: { result: notionCSV } } as any)
        }
      })

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText('Project 1')).toBeInTheDocument()
      })

      // Should auto-map similar field names
      const titleMapping = screen.getByLabelText(/map title field/i)
      expect(titleMapping).toHaveValue('Name') // Auto-mapped from "Name"

      const clientMapping = screen.getByLabelText(/map client field/i)
      expect(clientMapping).toHaveValue('Client Name') // Auto-mapped from "Client Name"

      const amountMapping = screen.getByLabelText(/map gross amount field/i)
      expect(amountMapping).toHaveValue('Amount') // Auto-mapped from "Amount"
    })

    test('should allow manual field mapping changes', async () => {
      renderWithQueryClient(<ImportPage />)

      const incomeTab = screen.getByRole('tab', { name: /income/i })
      fireEvent.click(incomeTab)

      const fileInput = screen.getByLabelText(/upload income csv/i)
      const customCSV = `Project Name,Project Date,Customer,Price
Custom Project,2024-01-15,Custom Client,5000`
      const file = createMockFile(customCSV, 'custom.csv')

      mockFileReader.readAsText.mockImplementation(() => {
        mockFileReader.result = customCSV
        if (mockFileReader.onload) {
          mockFileReader.onload({ target: { result: customCSV } } as any)
        }
      })

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText('Custom Project')).toBeInTheDocument()
      })

      // Manually map fields
      const titleMapping = screen.getByLabelText(/map title field/i)
      fireEvent.change(titleMapping, { target: { value: 'Project Name' } })
      expect(titleMapping).toHaveValue('Project Name')

      const dateMapping = screen.getByLabelText(/map date field/i)
      fireEvent.change(dateMapping, { target: { value: 'Project Date' } })
      expect(dateMapping).toHaveValue('Project Date')

      const clientMapping = screen.getByLabelText(/map client field/i)
      fireEvent.change(clientMapping, { target: { value: 'Customer' } })
      expect(clientMapping).toHaveValue('Customer')

      const amountMapping = screen.getByLabelText(/map gross amount field/i)
      fireEvent.change(amountMapping, { target: { value: 'Price' } })
      expect(amountMapping).toHaveValue('Price')

      // Preview should update with new mappings
      expect(screen.getByText('Custom Project')).toBeInTheDocument()
      expect(screen.getByText('Custom Client')).toBeInTheDocument()
      expect(screen.getByText('5,000.00')).toBeInTheDocument()
    })
  })
})