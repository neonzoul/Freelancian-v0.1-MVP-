'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { useAccessibility } from '@/components/providers/AccessibilityProvider'
import { AccessibilityChecker } from './AccessibilityChecker'

interface AccessibilitySettingsProps {
  isOpen: boolean
  onClose: () => void
}

export function AccessibilitySettings({ isOpen, onClose }: AccessibilitySettingsProps) {
  const {
    prefersReducedMotion,
    prefersHighContrast,
    isKeyboardUser,
    colorScheme,
    setColorScheme,
    fontSize,
    setFontSize,
    announceSuccess,
  } = useAccessibility()

  const [showChecker, setShowChecker] = useState(false)

  const handleColorSchemeChange = (value: string) => {
    setColorScheme(value as 'light' | 'dark' | 'auto')
    announceSuccess(`Color scheme changed to ${value}`)
  }

  const handleFontSizeChange = (value: string) => {
    setFontSize(value as 'small' | 'medium' | 'large' | 'extra-large')
    announceSuccess(`Font size changed to ${value}`)
  }

  const resetSettings = () => {
    setColorScheme('auto')
    setFontSize('medium')
    announceSuccess('Accessibility settings reset to defaults')
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Accessibility Settings"
      size="lg"
    >
      <div className="space-y-6">
        {/* Current Status */}
        <Card variant="outlined">
          <CardHeader>
            <h3 className="text-lg font-medium text-neutral-900">
              Current Accessibility Status
            </h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-neutral-900">System Preferences</h4>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${prefersReducedMotion ? 'bg-green-500' : 'bg-neutral-300'}`} />
                    Reduced Motion: {prefersReducedMotion ? 'Enabled' : 'Disabled'}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${prefersHighContrast ? 'bg-green-500' : 'bg-neutral-300'}`} />
                    High Contrast: {prefersHighContrast ? 'Enabled' : 'Disabled'}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${isKeyboardUser ? 'bg-green-500' : 'bg-neutral-300'}`} />
                    Keyboard Navigation: {isKeyboardUser ? 'Active' : 'Inactive'}
                  </li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-neutral-900">App Settings</h4>
                <ul className="space-y-1 text-sm">
                  <li>Color Scheme: <span className="font-medium capitalize">{colorScheme}</span></li>
                  <li>Font Size: <span className="font-medium capitalize">{fontSize.replace('-', ' ')}</span></li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings Controls */}
        <Card variant="outlined">
          <CardHeader>
            <h3 className="text-lg font-medium text-neutral-900">
              Customize Settings
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Select
                  label="Color Scheme"
                  value={colorScheme}
                  onChange={(e) => handleColorSchemeChange(e.target.value)}
                  options={[
                    { value: 'auto', label: 'Auto (Follow System)' },
                    { value: 'light', label: 'Light Mode' },
                    { value: 'dark', label: 'Dark Mode' },
                  ]}
                  helperText="Choose your preferred color scheme"
                />
              </div>

              <div>
                <Select
                  label="Font Size"
                  value={fontSize}
                  onChange={(e) => handleFontSizeChange(e.target.value)}
                  options={[
                    { value: 'small', label: 'Small' },
                    { value: 'medium', label: 'Medium (Default)' },
                    { value: 'large', label: 'Large' },
                    { value: 'extra-large', label: 'Extra Large' },
                  ]}
                  helperText="Adjust text size for better readability"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={resetSettings} variant="outline">
                  Reset to Defaults
                </Button>
                <Button onClick={() => setShowChecker(!showChecker)} variant="outline">
                  {showChecker ? 'Hide' : 'Show'} Accessibility Checker
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Accessibility Tips */}
        <Card variant="outlined">
          <CardHeader>
            <h3 className="text-lg font-medium text-neutral-900">
              Accessibility Tips
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div>
                <h4 className="font-medium text-neutral-900 mb-1">Keyboard Navigation</h4>
                <ul className="list-disc list-inside space-y-1 text-neutral-600">
                  <li>Use <kbd className="px-1 py-0.5 bg-neutral-100 rounded text-xs">Tab</kbd> to move between elements</li>
                  <li>Use <kbd className="px-1 py-0.5 bg-neutral-100 rounded text-xs">Enter</kbd> or <kbd className="px-1 py-0.5 bg-neutral-100 rounded text-xs">Space</kbd> to activate buttons</li>
                  <li>Use <kbd className="px-1 py-0.5 bg-neutral-100 rounded text-xs">Escape</kbd> to close modals and menus</li>
                  <li>Use <kbd className="px-1 py-0.5 bg-neutral-100 rounded text-xs">Alt + K</kbd> for keyboard shortcuts</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-neutral-900 mb-1">Screen Readers</h4>
                <ul className="list-disc list-inside space-y-1 text-neutral-600">
                  <li>Navigate by headings using <kbd className="px-1 py-0.5 bg-neutral-100 rounded text-xs">H</kbd></li>
                  <li>Navigate by landmarks using <kbd className="px-1 py-0.5 bg-neutral-100 rounded text-xs">D</kbd></li>
                  <li>Navigate by form controls using <kbd className="px-1 py-0.5 bg-neutral-100 rounded text-xs">F</kbd></li>
                  <li>All interactive elements have proper labels and descriptions</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-neutral-900 mb-1">Visual Accessibility</h4>
                <ul className="list-disc list-inside space-y-1 text-neutral-600">
                  <li>All colors meet WCAG AA contrast standards</li>
                  <li>Text can be enlarged up to 200% without loss of functionality</li>
                  <li>Focus indicators are clearly visible</li>
                  <li>Animations respect reduced motion preferences</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Accessibility Checker */}
        {showChecker && (
          <AccessibilityChecker />
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
          <Button onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  )
}

// Floating accessibility button
export function AccessibilityButton() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsSettingsOpen(true)}
        className="fixed bottom-4 left-4 w-12 h-12 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-strong z-50 flex items-center justify-center transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        aria-label="Open accessibility settings"
        title="Accessibility Settings"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
        </svg>
      </button>

      <AccessibilitySettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  )
}