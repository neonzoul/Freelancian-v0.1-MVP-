'use client'

import { getContrastRatio, meetsWCAGContrast } from './accessibility'

/**
 * Test color combinations for WCAG compliance
 */
export function testColorContrast() {
  const colorTests = [
    // Primary colors
    { name: 'Primary 600 on White', fg: '#0284c7', bg: '#ffffff' },
    { name: 'Primary 700 on White', fg: '#0369a1', bg: '#ffffff' },
    { name: 'White on Primary 600', fg: '#ffffff', bg: '#0284c7' },
    { name: 'White on Primary 700', fg: '#ffffff', bg: '#0369a1' },
    
    // Neutral colors
    { name: 'Neutral 900 on White', fg: '#171717', bg: '#ffffff' },
    { name: 'Neutral 700 on White', fg: '#404040', bg: '#ffffff' },
    { name: 'Neutral 600 on White', fg: '#525252', bg: '#ffffff' },
    { name: 'Neutral 500 on White', fg: '#737373', bg: '#ffffff' },
    
    // Error colors
    { name: 'Error 600 on White', fg: '#dc2626', bg: '#ffffff' },
    { name: 'Error 700 on White', fg: '#b91c1c', bg: '#ffffff' },
    { name: 'White on Error 600', fg: '#ffffff', bg: '#dc2626' },
    
    // Success colors
    { name: 'Success 600 on White', fg: '#16a34a', bg: '#ffffff' },
    { name: 'Success 700 on White', fg: '#15803d', bg: '#ffffff' },
    { name: 'White on Success 600', fg: '#ffffff', bg: '#16a34a' },
  ]

  console.group('🎨 Color Contrast Testing')
  
  colorTests.forEach(({ name, fg, bg }) => {
    const ratio = getContrastRatio(fg, bg)
    const meetsAA = meetsWCAGContrast(fg, bg, 'AA', 'normal')
    const meetsAALarge = meetsWCAGContrast(fg, bg, 'AA', 'large')
    const meetsAAA = meetsWCAGContrast(fg, bg, 'AAA', 'normal')
    
    console.log(`${name}:`, {
      ratio: ratio.toFixed(2),
      'WCAG AA (normal)': meetsAA ? '✅' : '❌',
      'WCAG AA (large)': meetsAALarge ? '✅' : '❌',
      'WCAG AAA': meetsAAA ? '✅' : '❌'
    })
  })
  
  console.groupEnd()
}

/**
 * Test keyboard navigation
 */
export function testKeyboardNavigation() {
  console.group('⌨️ Keyboard Navigation Testing')
  
  const focusableElements = document.querySelectorAll(
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
  )
  
  console.log(`Found ${focusableElements.length} focusable elements`)
  
  // Test tab order
  const tabOrder: { element: Element; tabIndex: number }[] = []
  focusableElements.forEach((element, index) => {
    const tabIndex = element.getAttribute('tabindex')
    tabOrder.push({
      element,
      tabIndex: tabIndex ? parseInt(tabIndex) : 0
    })
  })
  
  // Check for proper tab order
  const hasCustomTabOrder = tabOrder.some(item => item.tabIndex > 0)
  if (hasCustomTabOrder) {
    console.warn('⚠️ Custom tab order detected. Ensure logical flow.')
  }
  
  // Check for missing labels
  const unlabeledElements: Element[] = []
  focusableElements.forEach(element => {
    const hasLabel = 
      element.getAttribute('aria-label') ||
      element.getAttribute('aria-labelledby') ||
      (element.tagName === 'INPUT' && document.querySelector(`label[for="${element.id}"]`)) ||
      element.textContent?.trim()
    
    if (!hasLabel) {
      unlabeledElements.push(element)
    }
  })
  
  if (unlabeledElements.length > 0) {
    console.warn(`⚠️ Found ${unlabeledElements.length} unlabeled focusable elements:`, unlabeledElements)
  } else {
    console.log('✅ All focusable elements have labels')
  }
  
  console.groupEnd()
}

/**
 * Test ARIA attributes
 */
export function testARIAAttributes() {
  console.group('🏷️ ARIA Attributes Testing')
  
  // Check for proper ARIA usage
  const elementsWithARIA = document.querySelectorAll('[aria-label], [aria-labelledby], [aria-describedby], [role]')
  console.log(`Found ${elementsWithARIA.length} elements with ARIA attributes`)
  
  // Check for invalid ARIA references
  const invalidReferences: { element: Element; attribute: string; value: string }[] = []
  
  elementsWithARIA.forEach(element => {
    const labelledBy = element.getAttribute('aria-labelledby')
    const describedBy = element.getAttribute('aria-describedby')
    
    if (labelledBy) {
      const ids = labelledBy.split(' ')
      ids.forEach(id => {
        if (!document.getElementById(id)) {
          invalidReferences.push({ element, attribute: 'aria-labelledby', value: id })
        }
      })
    }
    
    if (describedBy) {
      const ids = describedBy.split(' ')
      ids.forEach(id => {
        if (!document.getElementById(id)) {
          invalidReferences.push({ element, attribute: 'aria-describedby', value: id })
        }
      })
    }
  })
  
  if (invalidReferences.length > 0) {
    console.warn('⚠️ Invalid ARIA references found:', invalidReferences)
  } else {
    console.log('✅ All ARIA references are valid')
  }
  
  console.groupEnd()
}

/**
 * Test semantic HTML structure
 */
export function testSemanticHTML() {
  console.group('🏗️ Semantic HTML Testing')
  
  // Check for proper heading hierarchy
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
  const headingLevels: number[] = []
  
  headings.forEach(heading => {
    const level = parseInt(heading.tagName.charAt(1))
    headingLevels.push(level)
  })
  
  // Check for skipped heading levels
  let hasSkippedLevels = false
  for (let i = 1; i < headingLevels.length; i++) {
    if (headingLevels[i] - headingLevels[i - 1] > 1) {
      hasSkippedLevels = true
      break
    }
  }
  
  if (hasSkippedLevels) {
    console.warn('⚠️ Heading levels are skipped. Ensure proper hierarchy.')
  } else {
    console.log('✅ Heading hierarchy is proper')
  }
  
  // Check for landmark elements
  const landmarks = document.querySelectorAll('main, nav, header, footer, aside, section[aria-label], section[aria-labelledby]')
  console.log(`Found ${landmarks.length} landmark elements`)
  
  if (landmarks.length === 0) {
    console.warn('⚠️ No landmark elements found. Consider adding main, nav, header, footer, or aside elements.')
  }
  
  console.groupEnd()
}

/**
 * Run all accessibility tests
 */
export function runAccessibilityTests() {
  console.log('🔍 Running Accessibility Tests...')
  
  testColorContrast()
  testKeyboardNavigation()
  testARIAAttributes()
  testSemanticHTML()
  
  console.log('✅ Accessibility tests completed. Check console for details.')
}

/**
 * Test reduced motion preferences
 */
export function testReducedMotion() {
  console.group('🎭 Reduced Motion Testing')
  
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  console.log('Prefers reduced motion:', prefersReducedMotion ? 'Yes' : 'No')
  
  // Check if animations are properly disabled
  const animatedElements = document.querySelectorAll('[style*="animation"], [class*="animate-"]')
  console.log(`Found ${animatedElements.length} potentially animated elements`)
  
  if (prefersReducedMotion && animatedElements.length > 0) {
    console.warn('⚠️ User prefers reduced motion but animations may still be present')
  }
  
  console.groupEnd()
}