import { Suspense } from 'react'
import { InternalChatView } from '@/src/features/admin/components/internal-chat-view'

// InternalChatView reads the open chat from the URL (useSearchParams), which
// Next requires to be inside a Suspense boundary.
export default function ChatInternoPage() {
  return (
    <Suspense>
      <InternalChatView />
    </Suspense>
  )
}
