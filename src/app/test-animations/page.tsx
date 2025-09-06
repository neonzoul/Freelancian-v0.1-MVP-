'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Button, 
  Card, 
  LoadingSpinner, 
  Modal,
  StaggerContainer,
  SuccessAnimation,
  LoadingSkeleton,
  useToast
} from '@/components/ui'
import { MetricsCard } from '@/components/dashboard/MetricsCard'
import { EntryCard } from '@/components/entries/EntryCard'
import { useAnimatedCounter, useAnimatedCurrency } from '@/lib/hooks/use-animated-counter'
import { 
  fadeInUp, 
  fadeInLeft, 
  fadeInRight, 
  scaleIn, 
  staggerItem,
  cardHover,
  buttonPress
} from '@/lib/animations'

// Mock data
const mockEntry = {
  id: '1',
  kind: 'income' as const,
  title: 'Voice Over Project',
  clientName: 'ABC Company',
  docDate: '2024-01-15',
  priceGrossThb: 10000,
  vatThb: 700,
  withholdingThb: 300,
  totalNetThb: 10400,
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z'
}

function AnimationSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-neutral-900 mb-6">{title}</h2>
      <div className="space-y-6">
        {children}
      </div>
    </div>
  )
}

export default function TestAnimationsPage() {
  const [showModal, setShowModal] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [counterValue, setCounterValue] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  
  const toast = useToast()
  const { count } = useAnimatedCounter(counterValue, { duration: 2000 })
  const { formattedValue } = useAnimatedCurrency(counterValue, { duration: 2000 })

  const triggerCounter = () => {
    setCounterValue(Math.floor(Math.random() * 100000) + 1000)
  }

  const triggerLoading = () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 3000)
  }

  const triggerToast = (type: 'success' | 'error' | 'warning' | 'info') => {
    switch (type) {
      case 'success':
        toast.success('Success!', 'This is a success message with animation')
        break
      case 'error':
        toast.error('Error!', 'This is an error message with animation')
        break
      case 'warning':
        toast.warning('Warning!', 'This is a warning message with animation')
        break
      case 'info':
        toast.info('Info!', 'This is an info message with animation')
        break
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="mb-12 text-center"
        >
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">
            Animation Test Suite
          </h1>
          <p className="text-lg text-neutral-600">
            Testing all animations and micro-interactions in the application
          </p>
        </motion.div>

        {/* Basic Animations */}
        <AnimationSection title="Basic Animations">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div variants={fadeInUp} initial="initial" animate="animate">
              <Card className="p-6 text-center">
                <h3 className="font-semibold mb-2">Fade In Up</h3>
                <p className="text-sm text-neutral-600">Basic fade in from bottom</p>
              </Card>
            </motion.div>

            <motion.div variants={fadeInLeft} initial="initial" animate="animate">
              <Card className="p-6 text-center">
                <h3 className="font-semibold mb-2">Fade In Left</h3>
                <p className="text-sm text-neutral-600">Slide in from left</p>
              </Card>
            </motion.div>

            <motion.div variants={fadeInRight} initial="initial" animate="animate">
              <Card className="p-6 text-center">
                <h3 className="font-semibold mb-2">Fade In Right</h3>
                <p className="text-sm text-neutral-600">Slide in from right</p>
              </Card>
            </motion.div>

            <motion.div variants={scaleIn} initial="initial" animate="animate">
              <Card className="p-6 text-center">
                <h3 className="font-semibold mb-2">Scale In</h3>
                <p className="text-sm text-neutral-600">Scale up animation</p>
              </Card>
            </motion.div>
          </div>
        </AnimationSection>

        {/* Button Animations */}
        <AnimationSection title="Button Animations">
          <div className="flex flex-wrap gap-4">
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button loading>Loading Button</Button>
          </div>
        </AnimationSection>

        {/* Card Hover Effects */}
        <AnimationSection title="Card Hover Effects">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card hover className="p-6">
              <h3 className="font-semibold mb-2">Hover Card</h3>
              <p className="text-sm text-neutral-600">Hover to see lift effect</p>
            </Card>

            <Card hover interactive className="p-6">
              <h3 className="font-semibold mb-2">Interactive Card</h3>
              <p className="text-sm text-neutral-600">Click for tap animation</p>
            </Card>

            <Card hover variant="elevated" className="p-6">
              <h3 className="font-semibold mb-2">Elevated Card</h3>
              <p className="text-sm text-neutral-600">Enhanced shadow on hover</p>
            </Card>
          </div>
        </AnimationSection>

        {/* Loading Animations */}
        <AnimationSection title="Loading Animations">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Spinner Variants</h3>
              <div className="flex items-center gap-4">
                <LoadingSpinner variant="spin" size="sm" />
                <LoadingSpinner variant="spin" size="md" />
                <LoadingSpinner variant="spin" size="lg" />
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Dots Animation</h3>
              <div className="flex items-center gap-4">
                <LoadingSpinner variant="dots" size="sm" />
                <LoadingSpinner variant="dots" size="md" />
                <LoadingSpinner variant="dots" size="lg" />
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Pulse Animation</h3>
              <div className="flex items-center gap-4">
                <LoadingSpinner variant="pulse" size="sm" />
                <LoadingSpinner variant="pulse" size="md" />
                <LoadingSpinner variant="pulse" size="lg" />
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">Loading Skeleton</h3>
            <LoadingSkeleton lines={4} />
          </Card>
        </AnimationSection>

        {/* Stagger Animations */}
        <AnimationSection title="Stagger Animations">
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div key={i} variants={staggerItem}>
                <Card className="p-4">
                  <h4 className="font-semibold">Item {i + 1}</h4>
                  <p className="text-sm text-neutral-600">Staggered animation</p>
                </Card>
              </motion.div>
            ))}
          </StaggerContainer>
        </AnimationSection>

        {/* Counter Animations */}
        <AnimationSection title="Counter Animations">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Animated Counter</h3>
              <div className="text-3xl font-bold text-primary-600 mb-4">
                {count.toLocaleString()}
              </div>
              <Button onClick={triggerCounter}>Trigger Counter</Button>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Currency Counter</h3>
              <div className="text-3xl font-bold text-success-600 mb-4">
                {formattedValue}
              </div>
              <Button onClick={triggerCounter}>Trigger Currency</Button>
            </Card>
          </div>
        </AnimationSection>

        {/* Metrics Cards */}
        <AnimationSection title="Metrics Card Animations">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricsCard
              title="Total Income"
              value={125000}
              icon={<div className="w-6 h-6 bg-green-500 rounded" />}
              variant="income"
              isLoading={isLoading}
            />
            
            <MetricsCard
              title="Total Expenses"
              value={75000}
              icon={<div className="w-6 h-6 bg-red-500 rounded" />}
              variant="expense"
              isLoading={isLoading}
            />
            
            <MetricsCard
              title="Net Amount"
              value={50000}
              icon={<div className="w-6 h-6 bg-blue-500 rounded" />}
              variant="net"
              isLoading={isLoading}
            />
          </div>
          
          <Button onClick={triggerLoading}>
            {isLoading ? 'Loading...' : 'Trigger Loading State'}
          </Button>
        </AnimationSection>

        {/* Entry Card */}
        <AnimationSection title="Entry Card Animations">
          <div className="max-w-md">
            <EntryCard
              entry={mockEntry}
              onEdit={() => console.log('Edit')}
              onDelete={() => console.log('Delete')}
            />
          </div>
        </AnimationSection>

        {/* Modal Animations */}
        <AnimationSection title="Modal Animations">
          <Button onClick={() => setShowModal(true)}>
            Open Animated Modal
          </Button>
          
          <Modal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            title="Animated Modal"
          >
            <div className="space-y-4">
              <p>This modal has smooth enter and exit animations.</p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setShowModal(false)}>
                  Confirm
                </Button>
              </div>
            </div>
          </Modal>
        </AnimationSection>

        {/* Success Animation */}
        <AnimationSection title="Success Animation">
          <Button onClick={() => setShowSuccess(true)}>
            Trigger Success Animation
          </Button>
          
          <SuccessAnimation
            isVisible={showSuccess}
            onComplete={() => setShowSuccess(false)}
          />
        </AnimationSection>

        {/* Toast Notifications */}
        <AnimationSection title="Toast Animations">
          <div className="flex flex-wrap gap-4">
            <Button onClick={() => triggerToast('success')}>
              Success Toast
            </Button>
            <Button onClick={() => triggerToast('error')}>
              Error Toast
            </Button>
            <Button onClick={() => triggerToast('warning')}>
              Warning Toast
            </Button>
            <Button onClick={() => triggerToast('info')}>
              Info Toast
            </Button>
          </div>
        </AnimationSection>
      </div>
    </div>
  )
}