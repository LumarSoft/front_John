import { Suspense } from 'react'
import { InboxView } from '@/src/features/admin/components/inbox-view'

// InboxView reads the open chat from the URL (useSearchParams), which Next
// requires to be inside a Suspense boundary.
export default function InboxPage() {
  return (
    <Suspense>
      <InboxView />
    </Suspense>
  )
}
