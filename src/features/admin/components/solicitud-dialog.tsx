'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/src/components/ui/dialog'
import type { SolicitudKind } from '@/src/types/api/solicitudes'
import { SolicitudDetailView } from './solicitud-detail'

interface SolicitudDialogProps {
  target: { kind: SolicitudKind; id: number } | null
  onClose: () => void
}

/** Modal with the full solicitud detail, opened when a row is clicked. */
export function SolicitudDialog({ target, onClose }: Readonly<SolicitudDialogProps>) {
  return (
    <Dialog open={target !== null} onOpenChange={open => !open && onClose()}>
      <DialogContent className="flex max-h-[88vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Solicitud de cotización</DialogTitle>
        </DialogHeader>
        <SolicitudDetailView target={target} onClose={onClose} />
      </DialogContent>
    </Dialog>
  )
}
