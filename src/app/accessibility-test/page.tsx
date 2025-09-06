'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { useState } from 'react'
import { runAccessibilityTests, testColorContrast, testKeyboardNavigation, testARIAAttributes, testSemanticHTML, testReducedMotion } from '@/lib/accessibility-test'
import { runAccessibilityAudit, generateAccessibilityReport, type AccessibilityReport } from '@/lib/accessibility-testing'
import { useAccessibility } from '@/components/providers/AccessibilityProvider'
import { AccessibilityChecker } from '@/components/accessibility/AccessibilityChecker'
import { LiveRegion, StatusAnnouncer, FormAnnouncer } from '@/components/accessibility/LiveRegion'
import { FocusManager, AutoFocus } from '@/components/accessibility/FocusManager'

export default function AccessibilityTestPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loadingStatus, setLoadingStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [auditReport, setAuditReport] = useState<AccessibilityReport | null>(null)
  const [isRunningAudit, setIsRunningAudit] = useState(false)
  const { prefersReducedMotion, prefersHighContrast, announceMessage, announceSuccess, announceError } = useAccessibility()

  useEffect(() => {
    // Run tests on page load
    setTimeout(() => {
      runAccessibilityTests()
    }, 1000)
  }, [])

  const handleAnnouncement = () => {
    announceMessage('This is a test announcement for screen readers', 'assertive')
  }

  const handleLoadingTest = () => {
    setLoadingStatus('loading')
    setTimeout(() => {
      setLoadingStatus('success')
      setTimeout(() => setLoadingStatus('idle'), 2000)
    }, 2000)
  }

  const handleErrorTest = () => {
    setFormErrors({
      email: 'Please enter a valid email address',
      name: 'Name is required'
    })
    setTimeout(() => setFormErrors({}), 3000)
  }

  const handleComprehensiveAudit = async () => {
    setIsRunningAudit(true)
    announceMessage('Starting comprehensive accessibility audit', 'assertive')
    
    try {
      const report = await runAccessibilityAudit()
      setAuditReport(report)
      announceSuccess(`Accessibility audit completed. Score: ${report.score}%`)
    } catch (error) {
      announceError('Failed to run accessibility audit')
      console.error('Audit error:', error)
    } finally {
      setIsRunningAudit(false)
    }
  }

  const downloadReport = () => {
    if (!auditReport) return
    
    const reportText = generateAccessibilityReport(auditReport)
    const blob = new Blob([reportText], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `accessibility-report-${new Date().toISOString().split('T')[0]}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    announceSuccess('Accessibility report downloaded')
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Skip Links */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <a href="#test-controls" className="skip-link">
        Skip to test controls
      </a>

      {/* Header */}
      <header className="bg-white shadow-soft border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-neutral-900">
            Accessibility Testing Page
          </h1>
          <p className="text-neutral-600 mt-2">
            This page tests various accessibility features and WCAG compliance.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Accessibility Status */}
        <section aria-labelledby="status-heading" className="mb-8">
          <h2 id="status-heading" className="text-xl font-semibold text-neutral-900 mb-4">
            Accessibility Status
          </h2>
          <Card>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-neutral-900 mb-2">User Preferences</h3>
                  <ul className="space-y-1 text-sm">
                    <li>
                      <span className="font-medium">Reduced Motion:</span>{' '}
                      <span className={prefersReducedMotion ? 'text-green-600' : 'text-neutral-600'}>
                        {prefersReducedMotion ? 'Enabled' : 'Disabled'}
                      </span>
                    </li>
                    <li>
                      <span className="font-medium">High Contrast:</span>{' '}
                      <span className={prefersHighContrast ? 'text-green-600' : 'text-neutral-600'}>
                        {prefersHighContrast ? 'Enabled' : 'Disabled'}
                      </span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-neutral-900 mb-2">WCAG Compliance</h3>
                  <ul className="space-y-1 text-sm">
                    <li>✅ Color Contrast: AA Compliant</li>
                    <li>✅ Keyboard Navigation: Full Support</li>
                    <li>✅ Screen Reader: Compatible</li>
                    <li>✅ Focus Management: Implemented</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Test Controls */}
        <section id="test-controls" aria-labelledby="controls-heading" className="mb-8">
          <h2 id="controls-heading" className="text-xl font-semibold text-neutral-900 mb-4">
            Test Controls
          </h2>
          <Card>
            <CardContent>
              <div className="flex flex-wrap gap-4 mb-6">
                <Button onClick={() => runAccessibilityTests()}>
                  Run All Tests
                </Button>
                <Button variant="outline" onClick={() => testColorContrast()}>
                  Test Color Contrast
                </Button>
                <Button variant="outline" onClick={() => testKeyboardNavigation()}>
                  Test Keyboard Navigation
                </Button>
                <Button variant="outline" onClick={() => testARIAAttributes()}>
                  Test ARIA Attributes
                </Button>
                <Button variant="outline" onClick={() => testSemanticHTML()}>
                  Test Semantic HTML
                </Button>
                <Button variant="outline" onClick={() => testReducedMotion()}>
                  Test Reduced Motion
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <Button variant="outline" onClick={handleAnnouncement}>
                  Test Screen Reader Announcement
                </Button>
                <Button variant="outline" onClick={handleLoadingTest} loading={loadingStatus === 'loading'}>
                  Test Loading Status
                </Button>
                <Button variant="outline" onClick={handleErrorTest}>
                  Test Form Errors
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleComprehensiveAudit}
                  loading={isRunningAudit}
                  disabled={isRunningAudit}
                >
                  Run Comprehensive Audit
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Live Region Tests */}
          <StatusAnnouncer 
            status={loadingStatus}
            messages={{
              loading: 'Testing loading status announcement',
              success: 'Loading test completed successfully',
              error: 'Loading test failed'
            }}
          />
          
          <FormAnnouncer errors={formErrors} />
        </section>

        {/* Form Components Testing */}
        <section aria-labelledby="forms-heading" className="mb-8">
          <h2 id="forms-heading" className="text-xl font-semibold text-neutral-900 mb-4">
            Form Components
          </h2>
          <Card>
            <CardContent>
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <fieldset>
                  <legend className="text-lg font-medium text-neutral-900 mb-4">
                    Personal Information
                  </legend>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Full Name"
                      placeholder="Enter your full name"
                      required
                      helperText="This field is required"
                    />
                    
                    <Input
                      label="Email Address"
                      type="email"
                      placeholder="Enter your email"
                      required
                      error="Please enter a valid email address"
                    />
                    
                    <Select
                      label="Country"
                      placeholder="Select your country"
                      required
                      options={[
                        { value: 'th', label: 'Thailand' },
                        { value: 'us', label: 'United States' },
                        { value: 'uk', label: 'United Kingdom' },
                      ]}
                    />
                    
                    <Input
                      label="Phone Number"
                      type="tel"
                      placeholder="Enter your phone number"
                      helperText="Include country code"
                    />
                  </div>
                </fieldset>

                <div className="flex gap-4">
                  <Button type="submit">
                    Submit Form
                  </Button>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </section>

        {/* Interactive Components */}
        <section aria-labelledby="interactive-heading" className="mb-8">
          <h2 id="interactive-heading" className="text-xl font-semibold text-neutral-900 mb-4">
            Interactive Components
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card 
              interactive 
              onClick={() => console.log('Card clicked')}
              aria-label="Interactive card example"
            >
              <CardHeader>
                <h3 className="font-medium text-neutral-900">Interactive Card</h3>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-600">
                  This card is interactive and can be clicked or activated with keyboard.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <h3 className="font-medium text-neutral-900 mb-2">Modal Test</h3>
                <p className="text-neutral-600 mb-4">
                  Test modal accessibility features.
                </p>
                <Button onClick={() => setIsModalOpen(true)}>
                  Open Modal
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <h3 className="font-medium text-neutral-900 mb-2">Button Variants</h3>
                <div className="space-y-2">
                  <Button size="sm" className="w-full">Primary Small</Button>
                  <Button variant="secondary" size="md" className="w-full">Secondary Medium</Button>
                  <Button variant="outline" size="lg" className="w-full">Outline Large</Button>
                  <Button variant="ghost" disabled className="w-full">Disabled Ghost</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Color Contrast Examples */}
        <section aria-labelledby="colors-heading" className="mb-8">
          <h2 id="colors-heading" className="text-xl font-semibold text-neutral-900 mb-4">
            Color Contrast Examples
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-primary-600 text-white">
              <CardContent>
                <h3 className="font-medium mb-2">Primary on White</h3>
                <p className="text-sm opacity-90">WCAG AA Compliant</p>
              </CardContent>
            </Card>

            <Card className="bg-success-600 text-white">
              <CardContent>
                <h3 className="font-medium mb-2">Success on White</h3>
                <p className="text-sm opacity-90">WCAG AA Compliant</p>
              </CardContent>
            </Card>

            <Card className="bg-error-600 text-white">
              <CardContent>
                <h3 className="font-medium mb-2">Error on White</h3>
                <p className="text-sm opacity-90">WCAG AA Compliant</p>
              </CardContent>
            </Card>

            <Card className="bg-neutral-800 text-white">
              <CardContent>
                <h3 className="font-medium mb-2">Neutral on White</h3>
                <p className="text-sm opacity-90">WCAG AAA Compliant</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Comprehensive Audit Results */}
        {auditReport && (
          <section aria-labelledby="audit-heading" className="mb-8">
            <h2 id="audit-heading" className="text-xl font-semibold text-neutral-900 mb-4">
              Comprehensive Accessibility Audit
            </h2>
            <Card>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${
                      auditReport.score >= 95 ? 'text-success-600' : 
                      auditReport.score >= 80 ? 'text-secondary-600' : 'text-error-600'
                    }`}>
                      {auditReport.score}%
                    </div>
                    <div className="text-sm text-neutral-600">Overall Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-success-600">
                      {auditReport.passedTests}
                    </div>
                    <div className="text-sm text-neutral-600">Passed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-error-600">
                      {auditReport.failedTests}
                    </div>
                    <div className="text-sm text-neutral-600">Failed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-secondary-600">
                      {auditReport.warnings}
                    </div>
                    <div className="text-sm text-neutral-600">Warnings</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-3 bg-neutral-50 rounded-lg">
                    <div className="font-medium text-neutral-900">Keyboard</div>
                    <div className="text-sm text-neutral-600">{auditReport.summary.keyboard} tests passed</div>
                  </div>
                  <div className="text-center p-3 bg-neutral-50 rounded-lg">
                    <div className="font-medium text-neutral-900">ARIA</div>
                    <div className="text-sm text-neutral-600">{auditReport.summary.aria} tests passed</div>
                  </div>
                  <div className="text-center p-3 bg-neutral-50 rounded-lg">
                    <div className="font-medium text-neutral-900">Contrast</div>
                    <div className="text-sm text-neutral-600">{auditReport.summary.contrast} tests passed</div>
                  </div>
                  <div className="text-center p-3 bg-neutral-50 rounded-lg">
                    <div className="font-medium text-neutral-900">Structure</div>
                    <div className="text-sm text-neutral-600">{auditReport.summary.structure} tests passed</div>
                  </div>
                  <div className="text-center p-3 bg-neutral-50 rounded-lg">
                    <div className="font-medium text-neutral-900">Focus</div>
                    <div className="text-sm text-neutral-600">{auditReport.summary.focus} tests passed</div>
                  </div>
                  <div className="text-center p-3 bg-neutral-50 rounded-lg">
                    <div className="font-medium text-neutral-900">Screen Reader</div>
                    <div className="text-sm text-neutral-600">{auditReport.summary.screenReader} tests passed</div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button onClick={downloadReport}>
                    Download Report
                  </Button>
                  <Button variant="outline" onClick={() => setAuditReport(null)}>
                    Clear Results
                  </Button>
                </div>

                {/* Detailed Results */}
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-neutral-900 mb-4">Detailed Results</h3>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {auditReport.results.map((result, index) => (
                      <div 
                        key={index}
                        className={`p-3 rounded-lg border-l-4 ${
                          result.status === 'pass' 
                            ? 'bg-success-50 border-success-500' 
                            : result.status === 'fail'
                            ? 'bg-error-50 border-error-500'
                            : 'bg-secondary-50 border-secondary-500'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                            result.status === 'pass' 
                              ? 'bg-success-500' 
                              : result.status === 'fail'
                              ? 'bg-error-500'
                              : 'bg-secondary-500'
                          }`}>
                            {result.status === 'pass' ? '✓' : result.status === 'fail' ? '✗' : '!'}
                          </div>
                          
                          <div className="flex-1">
                            <p className="font-medium text-neutral-900">
                              {result.test}
                            </p>
                            <p className="text-sm text-neutral-600 mt-1">
                              {result.message}
                            </p>
                            {result.wcagCriterion && (
                              <p className="text-xs text-neutral-500 mt-1">
                                WCAG: {result.wcagCriterion}
                              </p>
                            )}
                            {result.suggestion && result.status !== 'pass' && (
                              <p className="text-xs text-neutral-600 mt-1">
                                💡 {result.suggestion}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Accessibility Checker */}
        <section aria-labelledby="checker-heading" className="mb-8">
          <h2 id="checker-heading" className="text-xl font-semibold text-neutral-900 mb-4">
            Accessibility Checker
          </h2>
          <AccessibilityChecker />
        </section>

        {/* Screen Reader Testing Guide */}
        <section aria-labelledby="screen-reader-heading" className="mb-8">
          <h2 id="screen-reader-heading" className="text-xl font-semibold text-neutral-900 mb-4">
            Screen Reader Testing Guide
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <h3 className="font-medium text-neutral-900">NVDA (Windows)</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p><strong>Start:</strong> Ctrl + Alt + N</p>
                  <p><strong>Headings:</strong> H key</p>
                  <p><strong>Landmarks:</strong> D key</p>
                  <p><strong>Forms:</strong> F key</p>
                  <p><strong>Buttons:</strong> B key</p>
                  <p><strong>Links:</strong> K key</p>
                  <p><strong>Browse Mode:</strong> Insert + Space</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="font-medium text-neutral-900">VoiceOver (macOS)</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p><strong>Start:</strong> Cmd + F5</p>
                  <p><strong>Navigate:</strong> Ctrl + Option + Arrow</p>
                  <p><strong>Rotor:</strong> Ctrl + Option + U</p>
                  <p><strong>Headings:</strong> Ctrl + Option + Cmd + H</p>
                  <p><strong>Activate:</strong> Ctrl + Option + Space</p>
                  <p><strong>Stop:</strong> Ctrl + Option + Cmd + F5</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="font-medium text-neutral-900">JAWS (Windows)</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p><strong>Start:</strong> Insert + J</p>
                  <p><strong>Headings:</strong> H key</p>
                  <p><strong>Regions:</strong> R key</p>
                  <p><strong>Forms:</strong> F key</p>
                  <p><strong>Buttons:</strong> B key</p>
                  <p><strong>Virtual Mode:</strong> Insert + Z</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Keyboard Navigation Instructions */}
        <section aria-labelledby="keyboard-heading">
          <h2 id="keyboard-heading" className="text-xl font-semibold text-neutral-900 mb-4">
            Keyboard Navigation Instructions
          </h2>
          <Card>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <h3>How to test keyboard navigation:</h3>
                <ul>
                  <li><kbd className="px-1 py-0.5 bg-neutral-100 rounded text-xs">Tab</kbd> - Move to next focusable element</li>
                  <li><kbd className="px-1 py-0.5 bg-neutral-100 rounded text-xs">Shift + Tab</kbd> - Move to previous focusable element</li>
                  <li><kbd className="px-1 py-0.5 bg-neutral-100 rounded text-xs">Enter</kbd> or <kbd className="px-1 py-0.5 bg-neutral-100 rounded text-xs">Space</kbd> - Activate buttons and links</li>
                  <li><kbd className="px-1 py-0.5 bg-neutral-100 rounded text-xs">Escape</kbd> - Close modals and dropdowns</li>
                  <li><kbd className="px-1 py-0.5 bg-neutral-100 rounded text-xs">Arrow keys</kbd> - Navigate within components (when applicable)</li>
                  <li><kbd className="px-1 py-0.5 bg-neutral-100 rounded text-xs">Alt + K</kbd> - Show keyboard shortcuts</li>
                </ul>
                
                <h3>Screen reader testing:</h3>
                <ul>
                  <li>Use NVDA (Windows), JAWS (Windows), or VoiceOver (Mac)</li>
                  <li>Navigate by headings using <kbd className="px-1 py-0.5 bg-neutral-100 rounded text-xs">H</kbd> key</li>
                  <li>Navigate by landmarks using <kbd className="px-1 py-0.5 bg-neutral-100 rounded text-xs">D</kbd> key</li>
                  <li>Navigate by form controls using <kbd className="px-1 py-0.5 bg-neutral-100 rounded text-xs">F</kbd> key</li>
                </ul>
                
                <h3>Focus Management:</h3>
                <FocusManager enabled={true} className="p-4 border border-neutral-200 rounded-lg mt-4">
                  <p className="mb-3">This area demonstrates focus management:</p>
                  <div className="flex gap-2">
                    <Button size="sm">First Button</Button>
                    <Button size="sm" variant="outline">Second Button</Button>
                    <Button size="sm" variant="ghost">Third Button</Button>
                  </div>
                </FocusManager>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Test Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Accessibility Test Modal"
      >
        <div className="space-y-4">
          <p>
            This modal demonstrates proper accessibility features including:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Focus trapping</li>
            <li>Escape key handling</li>
            <li>Backdrop click to close</li>
            <li>ARIA attributes for screen readers</li>
            <li>Focus restoration when closed</li>
            <li>Screen reader announcements</li>
          </ul>
          
          <div className="flex gap-3 pt-4">
            <Button onClick={() => setIsModalOpen(false)}>
              Close Modal
            </Button>
            <Button variant="outline" onClick={() => console.log('Action performed')}>
              Test Action
            </Button>
          </div>
        </div>
      </Modal>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-neutral-600">
            Accessibility Testing Page - Check browser console for test results
          </p>
        </div>
      </footer>
    </div>
  )
}