import { EntryForm } from '@/components/entries/EntryForm'
import { PageWrapper } from '@/components/ui/PageWrapper'

export default function NewEntryPage() {
  return (
    <PageWrapper
      title="Create New Entry"
      subtitle="Add a new income or expense entry with live preview"
      className="max-w-7xl"
    >
      <EntryForm />
    </PageWrapper>
  )
}