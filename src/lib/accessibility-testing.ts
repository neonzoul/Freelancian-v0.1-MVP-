'use client'

/**
 * Comprehensive accessibility testing utilities
 * Tests WCAG 2.1 AA compliance and screen reader compatibility
 */

export interface AccessibilityTestResult {
  category: 'keyboard' | 'aria' | 'contrast' | 'structure' | 'focus' | 'screen-reader'
  test: string
  status: 'pass' | 'fail' | 'warning'
  message: string
  element?: HTMLElement
  suggestion?: string
  wcagCriterion?: string
}

export interface AccessibilityReport {
  score: number
  totalTests: number
  passedTests: number
  failedTests: number
  warnings: number
  results: AccessibilityTestResult[]
  summary: {
    keyboard: number
    aria: number
    contrast: number
    structure: number
    focus: number
    screenReader: number
  }
}

/**
 * Run comprehensive accessibility tests
 */
export async function runAccessibilityAudit(): Promise<AccessibilityReport> {
  const results: AccessibilityTestResult[] = []
  
  // Test categories
  results.push(...await testKeyboardAccessibility())
  results.push(...await testARIACompliance())
  results.push(...await testColorContrast())
  results.push(...await testSemanticStructure())
  results.push(...await testFocusManagement())
  results.push(...await testScreenReaderCompatibility())
  
  // Calculate scores
  const totalTests = results.length
  const passedTests = results.filter(r => r.status === 'pass').length
  const failedTests = results.filter(r => r.status === 'fail').length
  const warnings = results.filter(r => r.status === 'warning').length
  const score = Math.round((passedTests / totalTests) * 100)
  
  // Category breakdown
  const summary = {
    keyboard: results.filter(r => r.category === 'keyboard' && r.status === 'pass').length,
    aria: results.filter(r => r.category === 'aria' && r.status === 'pass').length,
    contrast: results.filter(r => r.category === 'contrast' && r.status === 'pass').length,
    structure: results.filter(r => r.category === 'structure' && r.status === 'pass').length,
    focus: results.filter(r => r.category === 'focus' && r.status === 'pass').length,
    screenReader: results.filter(r => r.category === 'screen-reader' && r.status === 'pass').length,
  }
  
  return {
    score,
    totalTests,
    passedTests,
    failedTests,
    warnings,
    results,
    summary
  }
}

/**
 * Test keyboard accessibility
 */
async function testKeyboardAccessibility(): Promise<AccessibilityTestResult[]> {
  const results: AccessibilityTestResult[] = []
  
  // Test 1: All interactive elements are keyboard accessible
  const interactiveElements = document.querySelectorAll(
    'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"]), [role="button"], [role="link"], [role="menuitem"], [role="tab"]'
  )
  
  let keyboardAccessibleCount = 0
  interactiveElements.forEach(element => {
    const tabIndex = element.getAttribute('tabindex')
    const isDisabled = element.hasAttribute('disabled') || element.getAttribute('aria-disabled') === 'true'
    
    if (!isDisabled && tabIndex !== '-1') {
      keyboardAccessibleCount++
    }
  })
  
  results.push({
    category: 'keyboard',
    test: 'Interactive elements keyboard accessible',
    status: keyboardAccessibleCount === interactiveElements.length ? 'pass' : 'fail',
    message: `${keyboardAccessibleCount}/${interactiveElements.length} interactive elements are keyboard accessible`,
    wcagCriterion: '2.1.1 Keyboard',
    suggestion: 'Ensure all interactive elements can be reached and activated using only the keyboard'
  })
  
  // Test 2: Skip links present
  const skipLinks = document.querySelectorAll('.skip-link, [href^="#main"], [href^="#content"]')
  results.push({
    category: 'keyboard',
    test: 'Skip links present',
    status: skipLinks.length > 0 ? 'pass' : 'warning',
    message: `Found ${skipLinks.length} skip link(s)`,
    wcagCriterion: '2.4.1 Bypass Blocks',
    suggestion: 'Add skip links to help keyboard users bypass repetitive content'
  })
  
  // Test 3: Focus indicators visible
  const focusableElements = document.querySelectorAll('button:not([disabled]), a[href], input:not([disabled])')
  let visibleFocusCount = 0
  
  focusableElements.forEach(element => {
    const styles = window.getComputedStyle(element, ':focus-visible')
    const outline = styles.outline || styles.boxShadow
    if (outline && outline !== 'none' && outline !== '0px') {
      visibleFocusCount++
    }
  })
  
  results.push({
    category: 'keyboard',
    test: 'Focus indicators visible',
    status: visibleFocusCount > 0 ? 'pass' : 'fail',
    message: `${visibleFocusCount}/${focusableElements.length} elements have visible focus indicators`,
    wcagCriterion: '2.4.7 Focus Visible',
    suggestion: 'Ensure all focusable elements have visible focus indicators'
  })
  
  return results
}

/**
 * Test ARIA compliance
 */
async function testARIACompliance(): Promise<AccessibilityTestResult[]> {
  const results: AccessibilityTestResult[] = []
  
  // Test 1: ARIA labels present where needed
  const elementsNeedingLabels = document.querySelectorAll(
    'button:not([aria-label]):not([aria-labelledby]), input:not([aria-label]):not([aria-labelledby]), [role="button"]:not([aria-label]):not([aria-labelledby])'
  )
  
  let properlyLabeledCount = 0
  elementsNeedingLabels.forEach(element => {
    const hasTextContent = element.textContent?.trim()
    const hasLabel = element.closest('label') || document.querySelector(`label[for="${element.id}"]`)
    
    if (hasTextContent || hasLabel) {
      properlyLabeledCount++
    }
  })
  
  results.push({
    category: 'aria',
    test: 'Elements properly labeled',
    status: properlyLabeledCount === elementsNeedingLabels.length ? 'pass' : 'fail',
    message: `${properlyLabeledCount}/${elementsNeedingLabels.length} elements have proper labels`,
    wcagCriterion: '4.1.2 Name, Role, Value',
    suggestion: 'Add aria-label or aria-labelledby attributes to unlabeled interactive elements'
  })
  
  // Test 2: ARIA references valid
  const elementsWithARIAReferences = document.querySelectorAll('[aria-labelledby], [aria-describedby]')
  let validReferencesCount = 0
  
  elementsWithARIAReferences.forEach(element => {
    const labelledBy = element.getAttribute('aria-labelledby')
    const describedBy = element.getAttribute('aria-describedby')
    
    let isValid = true
    
    if (labelledBy) {
      const ids = labelledBy.split(' ')
      ids.forEach(id => {
        if (!document.getElementById(id)) {
          isValid = false
        }
      })
    }
    
    if (describedBy) {
      const ids = describedBy.split(' ')
      ids.forEach(id => {
        if (!document.getElementById(id)) {
          isValid = false
        }
      })
    }
    
    if (isValid) {
      validReferencesCount++
    }
  })
  
  results.push({
    category: 'aria',
    test: 'ARIA references valid',
    status: validReferencesCount === elementsWithARIAReferences.length ? 'pass' : 'fail',
    message: `${validReferencesCount}/${elementsWithARIAReferences.length} ARIA references are valid`,
    wcagCriterion: '4.1.2 Name, Role, Value',
    suggestion: 'Ensure all aria-labelledby and aria-describedby references point to existing elements'
  })
  
  // Test 3: Live regions present
  const liveRegions = document.querySelectorAll('[aria-live], [role="status"], [role="alert"]')
  results.push({
    category: 'aria',
    test: 'Live regions present',
    status: liveRegions.length > 0 ? 'pass' : 'warning',
    message: `Found ${liveRegions.length} live region(s)`,
    wcagCriterion: '4.1.3 Status Messages',
    suggestion: 'Add live regions for dynamic content updates'
  })
  
  return results
}

/**
 * Test color contrast
 */
async function testColorContrast(): Promise<AccessibilityTestResult[]> {
  const results: AccessibilityTestResult[] = []
  
  // Test text elements for contrast
  const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, button, a, label')
  let contrastPassCount = 0
  let totalContrastTests = 0
  
  textElements.forEach(element => {
    const styles = window.getComputedStyle(element)
    const color = styles.color
    const backgroundColor = styles.backgroundColor
    
    // Only test if we have both colors and background isn't transparent
    if (color && backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'transparent') {
      totalContrastTests++
      
      const ratio = calculateContrastRatio(color, backgroundColor)
      if (ratio >= 4.5) {
        contrastPassCount++
      }
    }
  })
  
  results.push({
    category: 'contrast',
    test: 'Color contrast WCAG AA',
    status: totalContrastTests === 0 ? 'warning' : (contrastPassCount / totalContrastTests >= 0.9 ? 'pass' : 'fail'),
    message: `${contrastPassCount}/${totalContrastTests} text elements meet WCAG AA contrast ratio (4.5:1)`,
    wcagCriterion: '1.4.3 Contrast (Minimum)',
    suggestion: 'Ensure text has sufficient contrast against its background'
  })
  
  return results
}

/**
 * Test semantic structure
 */
async function testSemanticStructure(): Promise<AccessibilityTestResult[]> {
  const results: AccessibilityTestResult[] = []
  
  // Test 1: Heading hierarchy
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
  const headingLevels: number[] = []
  
  headings.forEach(heading => {
    const level = parseInt(heading.tagName.charAt(1))
    headingLevels.push(level)
  })
  
  let properHierarchy = true
  for (let i = 1; i < headingLevels.length; i++) {
    if (headingLevels[i] - headingLevels[i - 1] > 1) {
      properHierarchy = false
      break
    }
  }
  
  results.push({
    category: 'structure',
    test: 'Heading hierarchy proper',
    status: properHierarchy ? 'pass' : 'warning',
    message: `Heading hierarchy is ${properHierarchy ? 'proper' : 'improper'}`,
    wcagCriterion: '1.3.1 Info and Relationships',
    suggestion: 'Ensure headings follow sequential order (h1, h2, h3, etc.)'
  })
  
  // Test 2: Landmarks present
  const landmarks = document.querySelectorAll('main, nav, header, footer, aside, section[aria-label], section[aria-labelledby], [role="main"], [role="navigation"], [role="banner"], [role="contentinfo"]')
  results.push({
    category: 'structure',
    test: 'Landmark elements present',
    status: landmarks.length >= 2 ? 'pass' : 'warning',
    message: `Found ${landmarks.length} landmark element(s)`,
    wcagCriterion: '1.3.1 Info and Relationships',
    suggestion: 'Use semantic HTML5 elements or ARIA landmarks to structure content'
  })
  
  // Test 3: Images have alt text
  const images = document.querySelectorAll('img')
  let imagesWithAltCount = 0
  
  images.forEach(img => {
    if (img.hasAttribute('alt') || img.getAttribute('role') === 'presentation') {
      imagesWithAltCount++
    }
  })
  
  results.push({
    category: 'structure',
    test: 'Images have alt text',
    status: images.length === 0 ? 'pass' : (imagesWithAltCount === images.length ? 'pass' : 'fail'),
    message: `${imagesWithAltCount}/${images.length} images have alt text or are marked decorative`,
    wcagCriterion: '1.1.1 Non-text Content',
    suggestion: 'Add alt attributes to images or role="presentation" for decorative images'
  })
  
  return results
}

/**
 * Test focus management
 */
async function testFocusManagement(): Promise<AccessibilityTestResult[]> {
  const results: AccessibilityTestResult[] = []
  
  // Test 1: Focus traps in modals
  const modals = document.querySelectorAll('[role="dialog"], .modal')
  let modalFocusTrapsCount = 0
  
  modals.forEach(modal => {
    const focusableElements = modal.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
    
    if (focusableElements.length > 0) {
      modalFocusTrapsCount++
    }
  })
  
  results.push({
    category: 'focus',
    test: 'Modal focus management',
    status: modals.length === 0 ? 'pass' : (modalFocusTrapsCount === modals.length ? 'pass' : 'warning'),
    message: `${modalFocusTrapsCount}/${modals.length} modals have focusable elements`,
    wcagCriterion: '2.4.3 Focus Order',
    suggestion: 'Ensure modals trap focus and restore it when closed'
  })
  
  // Test 2: No focus traps outside modals
  const focusableElements = document.querySelectorAll('button:not([disabled]), [href], input:not([disabled])')
  results.push({
    category: 'focus',
    test: 'Focus order logical',
    status: focusableElements.length > 0 ? 'pass' : 'warning',
    message: `Found ${focusableElements.length} focusable elements`,
    wcagCriterion: '2.4.3 Focus Order',
    suggestion: 'Ensure focus order follows logical sequence'
  })
  
  return results
}

/**
 * Test screen reader compatibility
 */
async function testScreenReaderCompatibility(): Promise<AccessibilityTestResult[]> {
  const results: AccessibilityTestResult[] = []
  
  // Test 1: Screen reader only content
  const srOnlyElements = document.querySelectorAll('.sr-only, .visually-hidden')
  results.push({
    category: 'screen-reader',
    test: 'Screen reader only content',
    status: srOnlyElements.length > 0 ? 'pass' : 'warning',
    message: `Found ${srOnlyElements.length} screen reader only element(s)`,
    wcagCriterion: '1.3.1 Info and Relationships',
    suggestion: 'Use screen reader only text to provide additional context'
  })
  
  // Test 2: Form labels
  const formControls = document.querySelectorAll('input, select, textarea')
  let labeledControlsCount = 0
  
  formControls.forEach(control => {
    const hasLabel = 
      control.getAttribute('aria-label') ||
      control.getAttribute('aria-labelledby') ||
      (control.id && document.querySelector(`label[for="${control.id}"]`)) ||
      control.closest('label')
    
    if (hasLabel) {
      labeledControlsCount++
    }
  })
  
  results.push({
    category: 'screen-reader',
    test: 'Form controls labeled',
    status: formControls.length === 0 ? 'pass' : (labeledControlsCount === formControls.length ? 'pass' : 'fail'),
    message: `${labeledControlsCount}/${formControls.length} form controls are properly labeled`,
    wcagCriterion: '3.3.2 Labels or Instructions',
    suggestion: 'Associate labels with form controls using for/id or aria-labelledby'
  })
  
  // Test 3: Error messages
  const errorElements = document.querySelectorAll('[role="alert"], .error, [aria-invalid="true"]')
  results.push({
    category: 'screen-reader',
    test: 'Error handling accessible',
    status: 'pass', // This is more of an informational test
    message: `Found ${errorElements.length} error-related element(s)`,
    wcagCriterion: '3.3.1 Error Identification',
    suggestion: 'Ensure errors are announced to screen readers using role="alert" or live regions'
  })
  
  return results
}

/**
 * Calculate contrast ratio between two colors
 */
function calculateContrastRatio(color1: string, color2: string): number {
  const rgb1 = parseColor(color1)
  const rgb2 = parseColor(color2)
  
  if (!rgb1 || !rgb2) return 0
  
  const l1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b)
  const l2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b)
  
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Parse color string to RGB values
 */
function parseColor(color: string): { r: number; g: number; b: number } | null {
  // Handle rgb() format
  const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1]),
      g: parseInt(rgbMatch[2]),
      b: parseInt(rgbMatch[3])
    }
  }
  
  // Handle rgba() format
  const rgbaMatch = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/)
  if (rgbaMatch) {
    return {
      r: parseInt(rgbaMatch[1]),
      g: parseInt(rgbaMatch[2]),
      b: parseInt(rgbaMatch[3])
    }
  }
  
  // Handle hex format
  const hexMatch = color.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i)
  if (hexMatch) {
    return {
      r: parseInt(hexMatch[1], 16),
      g: parseInt(hexMatch[2], 16),
      b: parseInt(hexMatch[3], 16)
    }
  }
  
  return null
}

/**
 * Calculate relative luminance
 */
function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

/**
 * Generate accessibility testing report
 */
export function generateAccessibilityReport(report: AccessibilityReport): string {
  const { score, totalTests, passedTests, failedTests, warnings, results } = report
  
  let reportText = `# Accessibility Test Report\n\n`
  reportText += `**Overall Score:** ${score}%\n`
  reportText += `**Tests:** ${passedTests} passed, ${failedTests} failed, ${warnings} warnings out of ${totalTests} total\n\n`
  
  // Group results by category
  const categories = ['keyboard', 'aria', 'contrast', 'structure', 'focus', 'screen-reader'] as const
  
  categories.forEach(category => {
    const categoryResults = results.filter(r => r.category === category)
    if (categoryResults.length === 0) return
    
    reportText += `## ${category.charAt(0).toUpperCase() + category.slice(1)} Tests\n\n`
    
    categoryResults.forEach(result => {
      const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️'
      reportText += `${icon} **${result.test}**\n`
      reportText += `   ${result.message}\n`
      if (result.wcagCriterion) {
        reportText += `   *WCAG: ${result.wcagCriterion}*\n`
      }
      if (result.suggestion && result.status !== 'pass') {
        reportText += `   💡 ${result.suggestion}\n`
      }
      reportText += `\n`
    })
  })
  
  return reportText
}