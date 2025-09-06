'use client'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { PageWrapper } from '@/components/ui/PageWrapper'
import { useResponsive } from '@/lib/hooks/use-responsive'

export default function TestMobilePage() {
  const { width, height, isMobile, isTablet, isDesktop, breakpoint } = useResponsive()

  return (
    <PageWrapper
      title="Mobile Optimization Test"
      subtitle="Testing responsive design and mobile features"
    >
      <div className="space-y-6">
        {/* Responsive Info Card */}
        <Card className="p-4 sm:p-6">
          <h2 className="text-lg font-semibold mb-4">Current Viewport Info</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Width:</span> {width}px
            </div>
            <div>
              <span className="font-medium">Height:</span> {height}px
            </div>
            <div>
              <span className="font-medium">Breakpoint:</span> {breakpoint}
            </div>
            <div>
              <span className="font-medium">Device:</span>{' '}
              {isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop'}
            </div>
          </div>
        </Card>

        {/* Touch Target Test */}
        <Card className="p-4 sm:p-6">
          <h2 className="text-lg font-semibold mb-4">Touch Target Test</h2>
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-3">
            <Button size="sm" variant="primary">Small Button</Button>
            <Button size="md" variant="secondary">Medium Button</Button>
            <Button size="lg" variant="outline">Large Button</Button>
          </div>
        </Card>

        {/* Form Input Test */}
        <Card className="p-4 sm:p-6">
          <h2 className="text-lg font-semibold mb-4">Mobile Form Test</h2>
          <div className="space-y-4">
            <Input
              label="Text Input"
              placeholder="Type something..."
              size="md"
            />
            <Input
              label="Number Input"
              type="number"
              placeholder="0.00"
              size="md"
              leftIcon={<span className="text-neutral-600 font-medium">฿</span>}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Date"
                type="date"
                size="md"
              />
              <Input
                label="Email"
                type="email"
                placeholder="email@example.com"
                size="md"
              />
            </div>
          </div>
        </Card>

        {/* Responsive Grid Test */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <Card key={num} className="p-4 text-center">
              <h3 className="font-semibold mb-2">Card {num}</h3>
              <p className="text-sm text-neutral-600">
                This card tests responsive grid layouts
              </p>
            </Card>
          ))}
        </div>

        {/* Mobile-Specific Features */}
        <Card className="p-4 sm:p-6">
          <h2 className="text-lg font-semibold mb-4">Mobile Features</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
              <span>Bottom Navigation</span>
              <span className="text-sm text-neutral-600">
                {isMobile ? 'Visible' : 'Hidden'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
              <span>Touch Optimization</span>
              <span className="text-sm text-green-600">Active</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
              <span>Safe Area Support</span>
              <span className="text-sm text-green-600">Active</span>
            </div>
          </div>
        </Card>
      </div>
    </PageWrapper>
  )
}