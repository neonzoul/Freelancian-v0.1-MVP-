import { ComponentShowcase } from '@/components/ui/ComponentShowcase'

export default function ComponentsPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <ComponentShowcase />
    </div>
  )
}

export const metadata = {
  title: 'UI Components - Freelancian MVP',
  description: 'Component library showcase for Freelancian MVP',
}