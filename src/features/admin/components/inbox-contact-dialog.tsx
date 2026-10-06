'use client'

import { useState, type FormEvent } from 'react'
import { Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/src/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import type { InboxConversation, UpdateInboxContactRequest } from '@/src/types/api/inbox'

interface Props {
  conversation: InboxConversation
  saving: boolean
  onClose: () => void
  onSave: (data: UpdateInboxContactRequest) => void
}

/**
 * Manual fix of who a chat belongs to: the name shown for whoever writes from
 * this number and, when a client was linked by mistake (someone who asked with
 * another person's DNI), unlinking it.
 */
export function InboxContactDialog({ conversation, saving, onClose, onSave }: Readonly<Props>) {
  const [name, setName] = useState(conversation.contactNameManual ?? '')
  const [unlink, setUnlink] = useState(false)
  const client = conversation.client

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const contactName = name.trim() || null
    if (contactName === (conversation.contactNameManual ?? null) && !unlink) {
      toast.info('No hay cambios para guardar')
      return
    }
    onSave({ contactName, ...(unlink ? { unlinkClient: true } : {}) })
  }

  return (
    <Dialog open onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar contacto</DialogTitle>
          <DialogDescription>
            Corregí a quién corresponde este chat de WhatsApp ({conversation.waId}).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="contact-name">Nombre de quien escribe</Label>
            <Input
              id="contact-name"
              value={name}
              maxLength={191}
              placeholder="Nombre automático"
              onChange={e => setName(e.target.value)}
            />
            <p className="text-muted-foreground text-xs">
              Vacío: se usa el nombre de la agenda de WhatsApp o el de su perfil.
            </p>
          </div>

          {client && (
            <label className="flex items-start gap-2.5 rounded-lg border border-line-2 px-3 py-2.5 text-[13px]">
              <input
                type="checkbox"
                checked={unlink}
                onChange={e => setUnlink(e.target.checked)}
                className="mt-0.5 size-4 accent-[var(--color-ember)]"
              />
              <span>
                Desvincular a{' '}
                <span className="font-medium">
                  {client.firstName} {client.lastName}
                </span>{' '}
                (DNI {client.dni})
                <span className="text-muted-foreground block text-xs">
                  Usalo si el chat quedó asociado a otra persona. El bot le va a pedir el DNI de nuevo.
                </span>
              </span>
            </label>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving} className="gap-2">
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
