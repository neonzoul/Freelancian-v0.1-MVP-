'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  validateAriaAttributes, 
  isKeyboardAccessible, 
  getFocusableElements,
  getContrastRatio,
  meetsWCAGContrast 
} from '@/lib/accessibility'

interface AccessibilityIssue {
  type: 'error' | 'warning' | 'info'
  category: 'keyboard' | 'aria' | 'contrast' | 'structure' | 'focus'
  element: HTMLElement
  message: string
  suggestion?: string
}

interface AccessibilityReport {
  issues: AccessibilityIssue[]
  score: number
  totalChecks: number
  passedChecks: number
}

export function AccessibilityChecker() {
  const [report, setReport] = useState<AccessibilityReport | null>(null)
  const [isRunning, setIsRunning] = useState(false)

  const runAccessibilityCheck = async () => {
    setIsRunning(true)
    const issues: AccessibilityIssue[] = []
    let totalChecks = 0
    let passedChecks = 0

    try {
      // Check keyboard accessibility
      const focusableElements = getFocusableElements(document.body)
      totalChecks += focusableElements.length

      focusableElements.forEach(element => {
        if (isKeyboardAccessible(element)) {
          passedChecks++
        } else {
          issues.push({
            type: 'error',
            category: 'keyboard',
            element,
            message: 'Element is not keyboard accessible',
            suggestion: 'Add tabindex="0" or ensure element is focusable'
          })
        }
      })

      // Check ARIA attributes
      const elementsWithAria = document.querySelectorAll('[aria-label], [aria-labelledby], [aria-describedby], [role]')
      totalChecks += elementsWithAria.length

      elementsWithAria.forEach(element => {
        const ariaErrors = validateAriaAttributes(element as HTMLElement)
        if (ariaErrors.length === 0) {
          passedChecks++
        } else {
          ariaErrors.forEach(error => {
            issues.push({
              type: 'error',
              category: 'aria',
              element: element as HTMLElement,
              message: error,
              suggestion: 'Fix ARIA attribute references'
            })
          })
        }
      })

      // Check heading hierarchy
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
      const headingLevels: number[] = []
      
      headings.forEach(heading => {
        const level = parseInt(heading.tagName.charAt(1))
        headingLevels.push(level)
      })

      totalChecks++
      let hasProperHierarchy = true
      for (let i = 1; i < headingLevels.length; i++) {
        if (headingLevels[i] - headingLevels[i - 1] > 1) {
          hasProperHierarchy = false
          break
        }
      }

      if (hasProperHierarchy) {
        passedChecks++
      } else {
        issues.push({
          type: 'warning',
          category: 'structure',
          element: document.body,
          message: 'Heading hierarchy is not proper',
          suggestion: 'Ensure headings follow sequential order (h1, h2, h3, etc.)'
        })
      }

      // Check for alt text on images
      const images = document.querySelectorAll('img')
      totalChecks += images.length

      images.forEach(img => {
        const hasAlt = img.hasAttribute('alt')
        const isDecorative = img.getAttribute('role') === 'presentation' || img.getAttribute('alt') === ''
        
        if (hasAlt || isDecorative) {
          passedChecks++
        } else {
          issues.push({
            type: 'error',
            category: 'structure',
            element: img,
            message: 'Image missing alt text',
            suggestion: 'Add alt attribute with descriptive text or alt="" for decorative images'
          })
        }
      })

      // Check for form labels
      const formControls = document.querySelectorAll('input, select, textarea')
      totalChecks += formControls.length

      formControls.forEach(control => {
        const hasLabel = 
          control.getAttribute('aria-label') ||
          control.getAttribute('aria-labelledby') ||
          (control.id && document.querySelector(`label[for="${control.id}"]`))

        if (hasLabel) {
          passedChecks++
        } else {
          issues.push({
            type: 'error',
            category: 'structure',
            element: control as HTMLElement,
            message: 'Form control missing label',
            suggestion: 'Add a label element or aria-label attribute'
          })
        }
      })

      // Check color contrast (sample check on text elements)
      const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, button, a')
      let contrastChecks = 0
      let contrastPassed = 0

      textElements.forEach(element => {
        const styles = window.getComputedStyle(element)
        const color = styles.color
        const backgroundColor = styles.backgroundColor
        
        // Only check if we have both colors and they're not transparent
        if (color && backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'transparent') {
          contrastChecks++
          
          // Convert RGB to hex for contrast checking (simplified)
          const rgbToHex = (rgb: string) => {
            const match = rgb.match(/\d+/g)
            if (match && match.length >= 3) {
              const r = parseInt(match[0]).toString(16).padStart(2, '0')
              const g = parseInt(match[1]).toString(16).padStart(2, '0')
              const b = parseInt(match[2]).toString(16).padStart(2, '0')
              return `#${r}${g}${b}`
            }
            return '#000000'
          }

          try {
            const fgHex = rgbToHex(color)
            const bgHex = rgbToHex(backgroundColor)
            
            if (meetsWCAGContrast(fgHex, bgHex, 'AA', 'normal')) {
              contrastPassed++
            } else {
              issues.push({
                type: 'warning',
                category: 'contrast',
                element: element as HTMLElement,
                message: `Color contrast ratio does not meet WCAG AA standards`,
                suggestion: 'Increase contrast between text and background colors'
              })
            }
          } catch (error) {
            // Skip contrast check if color parsing fails
          }
        }
      })

      totalChecks += contrastChecks
      passedChecks += contrastPassed

      // Calculate score
      const score = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 100

      setReport({
        issues,
        score,
        totalChecks,
        passedChecks
      })
    } catch (error) {
      console.error('Error running accessibility check:', error)
    } finally {
      setIsRunning(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-success-600'
    if (score >= 70) return 'text-secondary-600'
    return 'text-error-600'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent'
    if (score >= 70) return 'Good'
    if (score >= 50) return 'Needs Improvement'
    return 'Poor'
  }

  const groupedIssues = report?.issues.reduce((acc, issue) => {
    if (!acc[issue.category]) {
      acc[issue.category] = []
    }
    acc[issue.category].push(issue)
    return acc
  }, {} as Record<string, AccessibilityIssue[]>) || {}

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-neutral-900">
              Accessibility Checker
            </h2>
            <Button 
              onClick={runAccessibilityCheck}
              loading={isRunning}
              disabled={isRunning}
            >
              {isRunning ? 'Checking...' : 'Run Check'}
            </Button>
          </div>
        </CardHeader>
        
        {report && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className={`text-3xl font-bold ${getScoreColor(report.score)}`}>
                  {report.score}%
                </div>
                <div className="text-sm text-neutral-600">
                  {getScoreLabel(report.score)}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-semibold text-neutral-900">
                  {report.passedChecks}/{report.totalChecks}
                </div>
                <div className="text-sm text-neutral-600">
                  Checks Passed
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-semibold text-error-600">
                  {report.issues.length}
                </div>
                <div className="text-sm text-neutral-600">
                  Issues Found
                </div>
              </div>
            </div>

            {report.issues.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-neutral-900">Issues Found</h3>
                
                {Object.entries(groupedIssues).map(([category, issues]) => (
                  <Card key={category} variant="outlined">
                    <CardContent className="p-4">
                      <h4 className="font-medium text-neutral-900 mb-3 capitalize">
                        {category} Issues ({issues.length})
                      </h4>
                      
                      <div className="space-y-2">
                        {issues.map((issue, index) => (
                          <div 
                            key={index}
                            className={`p-3 rounded-lg border-l-4 ${
                              issue.type === 'error' 
                                ? 'bg-error-50 border-error-500' 
                                : issue.type === 'warning'
                                ? 'bg-secondary-50 border-secondary-500'
                                : 'bg-primary-50 border-primary-500'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                                issue.type === 'error' 
                                  ? 'bg-error-500' 
                                  : issue.type === 'warning'
                                  ? 'bg-secondary-500'
                                  : 'bg-primary-500'
                              }`}>
                                {issue.type === 'error' ? '!' : issue.type === 'warning' ? '⚠' : 'i'}
                              </div>
                              
                              <div className="flex-1">
                                <p className="text-sm font-medium text-neutral-900">
                                  {issue.message}
                                </p>
                                {issue.suggestion && (
                                  <p className="text-xs text-neutral-600 mt-1">
                                    💡 {issue.suggestion}
                                  </p>
                                )}
                                <p className="text-xs text-neutral-500 mt-1">
                                  Element: {issue.element.tagName.toLowerCase()}
                                  {issue.element.id && ` #${issue.element.id}`}
                                  {issue.element.className && ` .${issue.element.className.split(' ')[0]}`}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {report.issues.length === 0 && (
              <div className="text-center py-8">
                <div className="text-success-600 text-4xl mb-2">✅</div>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">
                  No Issues Found!
                </h3>
                <p className="text-neutral-600">
                  Your page meets all accessibility checks.
                </p>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  )
}