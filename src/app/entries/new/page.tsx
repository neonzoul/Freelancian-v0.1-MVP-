import { EntryForm } from '@/components/entries/EntryForm'

export default function NewEntryPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">Create New Entry</h1>
          <p className="mt-2 text-neutral-600">
            Add a new income or expense entry with live preview
          </p>
        </div>
        
        <EntryForm />
      </div>
    </div>
  )
}