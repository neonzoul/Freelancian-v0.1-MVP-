'use client'

import { useState } from 'react'
import {
  Button,
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  Input,
  NumberInput,
  DateInput,
  Select,
  Textarea,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ConfirmDialog,
  Pagination,
  LoadingSpinner,
  EmptyState,
} from './index'
import { toast } from 'sonner'

export function ComponentShowcase() {
  const [modalOpen, setModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    amount: '',
    date: '',
    type: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)

  const entryTypes = [
    { value: 'income', label: 'Income' },
    { value: 'expense', label: 'Expense' },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Simple validation
    const newErrors: Record<string, string> = {}
    if (!formData.name) newErrors.name = 'Name is required'
    if (!formData.email) newErrors.email = 'Email is required'
    if (!formData.amount) newErrors.amount = 'Amount is required'
    
    setErrors(newErrors)
    
    if (Object.keys(newErrors).length === 0) {
      toast.success('Form submitted successfully!')
      setFormData({ name: '', email: '', amount: '', date: '', type: '' })
    } else {
      toast.error('Please fix the errors')
    }
  }

  const handleDeleteConfirm = () => {
    setConfirmDialogOpen(true)
  }

  const confirmDelete = () => {
    toast.success('Entry deleted')
    setConfirmDialogOpen(false)
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">UI Component Library</h1>
        <p className="text-neutral-600">Freelancian MVP Component Showcase</p>
      </div>

      {/* Buttons */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Buttons</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-3">
              <h3 className="font-medium text-sm text-neutral-700">Primary</h3>
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
            <div className="space-y-3">
              <h3 className="font-medium text-sm text-neutral-700">Secondary</h3>
              <Button variant="secondary" size="sm">Small</Button>
              <Button variant="secondary" size="md">Medium</Button>
              <Button variant="secondary" size="lg">Large</Button>
            </div>
            <div className="space-y-3">
              <h3 className="font-medium text-sm text-neutral-700">Outline</h3>
              <Button variant="outline" size="sm">Small</Button>
              <Button variant="outline" size="md">Medium</Button>
              <Button variant="outline" size="lg">Large</Button>
            </div>
            <div className="space-y-3">
              <h3 className="font-medium text-sm text-neutral-700">States</h3>
              <Button loading>Loading</Button>
              <Button disabled>Disabled</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Cards</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card variant="default" hover>
              <CardContent>
                <h3 className="font-medium mb-2">Default Card</h3>
                <p className="text-sm text-neutral-600">This is a default card with hover effects.</p>
              </CardContent>
            </Card>
            <Card variant="elevated" hover>
              <CardContent>
                <h3 className="font-medium mb-2">Elevated Card</h3>
                <p className="text-sm text-neutral-600">This card has more elevation and shadow.</p>
              </CardContent>
            </Card>
            <Card variant="outlined" hover interactive>
              <CardContent>
                <h3 className="font-medium mb-2">Interactive Card</h3>
                <p className="text-sm text-neutral-600">This card is interactive and focusable.</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Form Components */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Form Components</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                id="name"
                label="Full Name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                error={errors.name}
                helperText="This will be displayed on your profile"
              />
              
              <Input
                id="email"
                label="Email Address"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                error={errors.email}
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                }
              />
              
              <NumberInput
                id="amount"
                label="Amount (THB)"
                placeholder="0.00"
                currency
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                error={errors.amount}
              />
              
              <DateInput
                id="date"
                label="Transaction Date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              />
              
              <Select
                id="type"
                label="Entry Type"
                placeholder="Select type"
                options={entryTypes}
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
              />
            </div>
            
            <div className="flex gap-3">
              <Button type="submit">Submit Form</Button>
              <Button type="button" variant="outline" onClick={() => setModalOpen(true)}>
                Open Modal
              </Button>
              <Button type="button" variant="secondary" onClick={handleDeleteConfirm}>
                Test Confirm Dialog
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Toast Examples */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Toast Notifications</h2>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="outline" 
              onClick={() => toast.success('Operation completed successfully!')}
            >
              Success Toast
            </Button>
            <Button 
              variant="outline" 
              onClick={() => toast.error('Something went wrong. Please try again.')}
            >
              Error Toast
            </Button>
            <Button 
              variant="outline" 
              onClick={() => toast.warning('Please review your input before proceeding.')}
            >
              Warning Toast
            </Button>
            <Button 
              variant="outline" 
              onClick={() => toast.info('Here is some helpful information.')}
            >
              Info Toast
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Example Modal"
        size="md"
      >
        <ModalBody>
          <p className="text-neutral-600 mb-4">
            This is an example modal with proper accessibility features including:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-neutral-600">
            <li>Focus management and trapping</li>
            <li>Escape key handling</li>
            <li>Backdrop click to close</li>
            <li>ARIA attributes for screen readers</li>
            <li>Smooth animations</li>
          </ul>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => {
            toast.success('Modal action completed!')
            setModalOpen(false)
          }}>
            Confirm
          </Button>
        </ModalFooter>
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Entry"
        message="Are you sure you want to delete this entry? This action cannot be undone."
        confirmText="Delete"
        confirmVariant="danger"
      />
    </div>
  )
}