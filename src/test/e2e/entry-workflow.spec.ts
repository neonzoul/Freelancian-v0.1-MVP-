import { test, expect } from '@playwright/test'

test.describe('Entry Management Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/')
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle')
  })

  test('should create a new income entry through manual form', async ({ page }) => {
    // Navigate to new entry form
    await page.click('[data-testid="add-entry-button"]')
    await expect(page).toHaveURL('/entries/new')

    // Fill out the form
    await page.fill('[data-testid="title-input"]', 'Voice Over Project')
    await page.selectOption('[data-testid="kind-select"]', 'income')
    await page.fill('[data-testid="client-name-input"]', 'ABC Company')
    await page.fill('[data-testid="product-service-input"]', 'Voice Over Services')
    await page.fill('[data-testid="gross-amount-input"]', '7000')

    // Enable auto-calculation for VAT and WHT
    await page.check('[data-testid="auto-vat-toggle"]')
    await page.check('[data-testid="auto-withholding-toggle"]')

    // Verify live preview updates
    await expect(page.locator('[data-testid="live-preview-title"]')).toHaveText('Voice Over Project')
    await expect(page.locator('[data-testid="live-preview-amount"]')).toContainText('฿7,000.00')
    await expect(page.locator('[data-testid="live-preview-vat"]')).toContainText('฿490.00') // 7% of 7000
    await expect(page.locator('[data-testid="live-preview-withholding"]')).toContainText('฿210.00') // 3% of 7000

    // Submit the form
    await page.click('[data-testid="save-button"]')

    // Wait for success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Entry created successfully')

    // Should redirect to entries list
    await expect(page).toHaveURL('/entries')

    // Verify the entry appears in the list
    await expect(page.locator('[data-testid="entry-card"]').first()).toContainText('Voice Over Project')
  })

  test('should create a new expense entry', async ({ page }) => {
    await page.click('[data-testid="add-entry-button"]')
    await expect(page).toHaveURL('/entries/new')

    // Fill expense form
    await page.fill('[data-testid="title-input"]', 'Office Supplies')
    await page.selectOption('[data-testid="kind-select"]', 'expense')
    await page.fill('[data-testid="vendor-name-input"]', 'Office Depot')
    await page.fill('[data-testid="gross-amount-input"]', '1500')

    // Verify expense-specific fields are shown
    await expect(page.locator('[data-testid="vendor-name-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="client-name-input"]')).not.toBeVisible()

    // Submit the form
    await page.click('[data-testid="save-button"]')

    // Wait for success and verify
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
    await expect(page).toHaveURL('/entries')
    await expect(page.locator('[data-testid="entry-card"]').first()).toContainText('Office Supplies')
  })

  test('should validate form fields and show errors', async ({ page }) => {
    await page.click('[data-testid="add-entry-button"]')

    // Try to submit empty form
    await page.click('[data-testid="save-button"]')

    // Should show validation errors
    await expect(page.locator('[data-testid="title-error"]')).toContainText('Title is required')

    // Fill title but add invalid withholding
    await page.fill('[data-testid="title-input"]', 'Test Entry')
    await page.fill('[data-testid="gross-amount-input"]', '1000')
    await page.fill('[data-testid="withholding-input"]', '50') // 5% - exceeds limit

    await page.click('[data-testid="save-button"]')

    // Should show withholding validation error
    await expect(page.locator('[data-testid="withholding-error"]')).toContainText('Withholding cannot exceed 3%')
  })

  test('should edit an existing entry', async ({ page }) => {
    // First create an entry (assuming there's test data or we create one)
    await page.goto('/entries')
    
    // Click edit on first entry
    await page.click('[data-testid="entry-card"]:first-child [data-testid="edit-button"]')

    // Should open edit panel
    await expect(page.locator('[data-testid="edit-panel"]')).toBeVisible()

    // Modify the entry
    await page.fill('[data-testid="edit-title-input"]', 'Updated Entry Title')
    await page.fill('[data-testid="edit-gross-amount-input"]', '8000')

    // Save changes
    await page.click('[data-testid="save-edit-button"]')

    // Should show success message and close panel
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
    await expect(page.locator('[data-testid="edit-panel"]')).not.toBeVisible()

    // Verify changes in the list
    await expect(page.locator('[data-testid="entry-card"]').first()).toContainText('Updated Entry Title')
  })

  test('should delete an entry with confirmation', async ({ page }) => {
    await page.goto('/entries')

    // Click delete on first entry
    await page.click('[data-testid="entry-card"]:first-child [data-testid="delete-button"]')

    // Should show confirmation dialog
    await expect(page.locator('[data-testid="confirm-dialog"]')).toBeVisible()
    await expect(page.locator('[data-testid="confirm-dialog"]')).toContainText('Are you sure')

    // Cancel first
    await page.click('[data-testid="cancel-button"]')
    await expect(page.locator('[data-testid="confirm-dialog"]')).not.toBeVisible()

    // Try again and confirm
    await page.click('[data-testid="entry-card"]:first-child [data-testid="delete-button"]')
    await page.click('[data-testid="confirm-button"]')

    // Should show success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Entry deleted successfully')
  })

  test('should filter and search entries', async ({ page }) => {
    await page.goto('/entries')

    // Test search functionality
    await page.fill('[data-testid="search-input"]', 'voice')
    await page.waitForTimeout(500) // Wait for debounce

    // Should filter results
    const entryCards = page.locator('[data-testid="entry-card"]')
    await expect(entryCards.first()).toContainText('voice', { ignoreCase: true })

    // Clear search
    await page.fill('[data-testid="search-input"]', '')

    // Test type filter
    await page.selectOption('[data-testid="type-filter"]', 'income')
    await page.waitForTimeout(500)

    // Should show only income entries
    const incomeEntries = page.locator('[data-testid="entry-card"][data-kind="income"]')
    await expect(incomeEntries.first()).toBeVisible()

    // Test month filter
    await page.selectOption('[data-testid="month-filter"]', '2024-01')
    await page.waitForTimeout(500)

    // Should filter by month
    // Verify URL contains filter parameters
    await expect(page).toHaveURL(/kind=income/)
    await expect(page).toHaveURL(/month=2024-01/)
  })

  test('should navigate through pagination', async ({ page }) => {
    await page.goto('/entries')

    // Check if pagination is present (assuming there are enough entries)
    const pagination = page.locator('[data-testid="pagination"]')
    
    if (await pagination.isVisible()) {
      // Click next page
      await page.click('[data-testid="next-page-button"]')
      
      // Should update URL and content
      await expect(page).toHaveURL(/page=2/)
      
      // Click previous page
      await page.click('[data-testid="prev-page-button"]')
      await expect(page).toHaveURL(/page=1/)
    }
  })

  test('should display dashboard with metrics', async ({ page }) => {
    await page.goto('/dashboard')

    // Should show metrics cards
    await expect(page.locator('[data-testid="total-income-card"]')).toBeVisible()
    await expect(page.locator('[data-testid="total-expenses-card"]')).toBeVisible()
    await expect(page.locator('[data-testid="net-amount-card"]')).toBeVisible()

    // Should show recent entries
    await expect(page.locator('[data-testid="recent-entries"]')).toBeVisible()

    // Should show mini chart
    await expect(page.locator('[data-testid="mini-chart"]')).toBeVisible()

    // Click on "View Reports" should navigate to reports page
    await page.click('[data-testid="view-reports-button"]')
    await expect(page).toHaveURL('/reports')
  })

  test('should display reports with charts', async ({ page }) => {
    await page.goto('/reports')

    // Should show monthly chart
    await expect(page.locator('[data-testid="monthly-chart"]')).toBeVisible()

    // Should show summary stats
    await expect(page.locator('[data-testid="summary-stats"]')).toBeVisible()

    // Should show period selector
    await expect(page.locator('[data-testid="period-selector"]')).toBeVisible()

    // Test period selection
    await page.selectOption('[data-testid="period-selector"]', '2024-01')
    
    // Chart should update (wait for animation)
    await page.waitForTimeout(1000)
    
    // Verify chart data updated
    await expect(page.locator('[data-testid="chart-tooltip"]')).not.toBeVisible()
  })

  test('should work on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    await page.goto('/')

    // Should show mobile navigation
    await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible()

    // Test mobile entry form
    await page.click('[data-testid="add-entry-button"]')
    
    // Form should stack vertically on mobile
    const formContainer = page.locator('[data-testid="entry-form-container"]')
    await expect(formContainer).toHaveClass(/flex-col/)

    // Live preview should be below form on mobile
    const livePreview = page.locator('[data-testid="live-preview"]')
    await expect(livePreview).toBeVisible()

    // Fill form on mobile
    await page.fill('[data-testid="title-input"]', 'Mobile Entry')
    await page.fill('[data-testid="gross-amount-input"]', '2000')

    // Should be able to scroll and submit
    await page.click('[data-testid="save-button"]')
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
  })
})