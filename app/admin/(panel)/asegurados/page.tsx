import { Suspense } from 'react'
import { AseguradosView } from '@/src/features/admin/components/asegurados-view'

// AseguradosView opens a client's file from the URL (?cliente=ID, useSearchParams),
// which Next requires to be inside a Suspense boundary.
export default function AseguradosPage() {
  return (
    <Suspense>
      <AseguradosView />
    </Suspense>
  )
}
