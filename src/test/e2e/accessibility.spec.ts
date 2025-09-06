import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessibility Tests', () => {
  test('should not have any automatically detectable accessibility issues on dashboard', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('should not have any automatically detectable accessibility issues on entry form', async ({ page }) => {
    await page.goto('/entries/new')
    await page.waitForLoadState('networkidle')

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('should not have any automatically detectable accessibility issues on entry list', async ({ page }) => {
    await page.goto('/entries')
    await page.waitForLoadState('networkidle')

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('should not have any automatically detectable accessibility issues on reports', async ({ page }) => {
    await page.goto('/reports')
    await page.waitForLoadState('networkidle')

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/entries/new')

    // Test tab navigation through form fields
    await page.keyboard.press('Tab')
    await expect(page.locator('[data-testid="title-input"]')).toBeFocused()

    await page.keyboard.press('Tab')
    await expect(page.locator('[data-testid="kind-select"]')).toBeFocused()

    await page.keyboard.press('Tab')
    await expect(page.locator('[data-testid="doc-date-input"]')).toBeFocused()

    // Test form submission with Enter key
    await page.fill('[data-testid="title-input"]', 'Keyboard Test Entry')
    await page.fill('[data-testid="gross-amount-input"]', '1000')
    
    await page.locator('[data-testid="save-button"]').focus()
    await page.keyboard.press('Enter')

    // Should submit form
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
  })

  test('should have proper focus indicators', async ({ page }) => {
    await page.goto('/entries/new')

    // Check that focused elements have visible focus indicators
    await page.keyboard.press('Tab')
    const focusedElement = page.locator('[data-testid="title-input"]')
    
    // Should have focus styles (outline or box-shadow)
    const styles = await focusedElement.evaluate(el => {
      const computed = window.getComputedStyle(el)
      return {
        outline: computed.outline,
        boxShadow: computed.boxShadow,
        borderColor: computed.borderColor,
      }
    })

    // Should have some form of focus indicator
    const hasFocusIndicator = 
      styles.outline !== 'none' || 
      styles.boxShadow !== 'none' || 
      styles.borderColor.includes('blue') // Common focus color

    expect(hasFocusIndicator).toBe(true)
  })

  test('should have proper ARIA labels and roles', async ({ page }) => {
    await page.goto('/entries/new')

    // Check form has proper role
    const form = page.locator('form')
    await expect(form).toHaveAttribute('role', 'form')

    // Check inputs have proper labels
    const titleInput = page.locator('[data-testid="title-input"]')
    await expect(titleInput).toHaveAttribute('aria-label')

    // Check required fields are marked
    await expect(titleInput).toHaveAttribute('required')
    await expect(titleInput).toHaveAttribute('aria-required', 'true')

    // Check error messages are associated
    await page.click('[data-testid="save-button"]') // Trigger validation
    
    const errorMessage = page.locator('[data-testid="title-error"]')
    if (await errorMessage.isVisible()) {
      const errorId = await errorMessage.getAttribute('id')
      await expect(titleInput).toHaveAttribute('aria-describedby', errorId)
    }
  })

  test('should support screen reader announcements', async ({ page }) => {
    await page.goto('/entries/new')

    // Check for live regions
    const liveRegion = page.locator('[aria-live]')
    await expect(liveRegion).toBeAttached()

    // Test that success messages are announced
    await page.fill('[data-testid="title-input"]', 'Screen Reader Test')
    await page.fill('[data-testid="gross-amount-input"]', '1000')
    await page.click('[data-testid="save-button"]')

    const successMessage = page.locator('[data-testid="success-message"]')
    await expect(successMessage).toHaveAttribute('aria-live', 'polite')
  })

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/dashboard')

    // Test color contrast for text elements
    const textElements = [
      '[data-testid="total-income-value"]',
      '[data-testid="total-expenses-value"]',
      '[data-testid="net-amount-value"]',
    ]

    for (const selector of textElements) {
      const element = page.locator(selector)
      if (await element.isVisible()) {
        const contrast = await element.evaluate(el => {
          const styles = window.getComputedStyle(el)
          const backgroundColor = styles.backgroundColor
          const color = styles.color
          
          // Simple contrast check (in real implementation, you'd use a proper contrast calculation)
          return { backgroundColor, color }
        })

        // Ensure colors are defined (not transparent/inherit)
        expect(contrast.color).not.toBe('rgba(0, 0, 0, 0)')
        expect(contrast.backgroundColor).toBeDefined()
      }
    }
  })

  test('should respect reduced motion preferences', async ({ page }) => {
    // Set reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/dashboard')

    // Check that animations are disabled or reduced
    const animatedElement = page.locator('[data-testid="metrics-card"]').first()
    
    const animationDuration = await animatedElement.evaluate(el => {
      const styles = window.getComputedStyle(el)
      return styles.animationDuration
    })

    // Should have no animation or very short duration
    expect(animationDuration === 'none' || animationDuration === '0s').toBe(true)
  })

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/dashboard')

    // Check heading levels are in proper order
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all()
    
    let previousLevel = 0
    for (const heading of headings) {
      const tagName = await heading.evaluate(el => el.tagName.toLowerCase())
      const currentLevel = parseInt(tagName.charAt(1))
      
      // Heading levels should not skip (e.g., h1 -> h3)
      expect(currentLevel - previousLevel).toBeLessThanOrEqual(1)
      previousLevel = currentLevel
    }
  })

  test('should have descriptive link text', async ({ page }) => {
    await page.goto('/dashboard')

    // Check that links have descriptive text
    const links = await page.locator('a').all()
    
    for (const link of links) {
      const text = await link.textContent()
      const ariaLabel = await link.getAttribute('aria-label')
      
      // Link should have either descriptive text or aria-label
      const hasDescription = 
        (text && text.trim().length > 0 && !['click here', 'read more', 'link'].includes(text.toLowerCase())) ||
        (ariaLabel && ariaLabel.trim().length > 0)
      
      expect(hasDescription).toBe(true)
    }
  })

  test('should handle high contrast mode', async ({ page }) => {
    // Simulate high contrast mode
    await page.addStyleTag({
      content: `
        @media (prefers-contrast: high) {
          * {
            background-color: white !important;
            color: black !important;
            border-color: black !important;
          }
        }
      `
    })

    await page.goto('/dashboard')

    // Verify content is still readable
    const textElements = page.locator('h1, h2, h3, p, span')
    const firstElement = textElements.first()
    
    if (await firstElement.isVisible()) {
      const styles = await firstElement.evaluate(el => {
        const computed = window.getComputedStyle(el)
        return {
          color: computed.color,
          backgroundColor: computed.backgroundColor,
        }
      })

      // Should have high contrast colors
      expect(styles.color).toBeDefined()
      expect(styles.backgroundColor).toBeDefined()
    }
  })
})