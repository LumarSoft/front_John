'use client'

import { Loader2 } from 'lucide-react'
import { MejorasEditorView } from '@/src/features/admin/components/mejoras-editor-view'
import { MejorasView } from '@/src/features/admin/components/mejoras-view'
import { useRole } from '@/src/features/admin/hooks/use-role'

export default function MejorasPage() {
  const { isOwner, isLoading } = useRole()

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-10">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    )
  }
  // Lumar writes and publishes; everyone else reads.
  return isOwner ? <MejorasEditorView /> : <MejorasView />
}
