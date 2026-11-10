'use client'

import { useRef } from 'react'
import { ImageUp, Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/src/components/ui/button'
import { ApiError } from '@/src/lib/api-client'
import type { PanelBrand } from '../lib/org-brand'
import { OrgMark } from './org-mark'

const ACCEPTED = ['image/png', 'image/jpeg', 'image/webp']
const MAX_BYTES = 2 * 1024 * 1024

interface LogoMutation<TArg> {
  mutate: (arg: TArg, options: { onSuccess: () => void; onError: (error: unknown) => void }) => void
  isPending: boolean
}

interface LogoUploaderProps {
  brand: PanelBrand
  upload: LogoMutation<File>
  remove: LogoMutation<void>
  canEdit: boolean
}

function failed(error: unknown, fallback: string) {
  toast.error(error instanceof ApiError && error.status < 500 ? error.message : fallback)
}

/** The organization's mark with buttons to upload a logo (PNG, JPG or WebP) or go back to its initials. */
export function LogoUploader({ brand, upload, remove, canEdit }: LogoUploaderProps) {
  const input = useRef<HTMLInputElement>(null)
  const busy = upload.isPending || remove.isPending

  const pick = (file: File | undefined) => {
    if (!file) return
    if (!ACCEPTED.includes(file.type)) {
      toast.error('El logo tiene que ser PNG, JPG o WebP.')
      return
    }
    if (file.size > MAX_BYTES) {
      toast.error('El logo puede pesar hasta 2 MB.')
      return
    }
    upload.mutate(file, {
      onSuccess: () => toast.success('Logo actualizado'),
      onError: error => failed(error, 'No se pudo subir el logo'),
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <OrgMark brand={brand} size={64} className="rounded-xl border border-line-2 shadow-sm" />
      {canEdit && (
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={input}
            type="file"
            accept={ACCEPTED.join(',')}
            className="hidden"
            onChange={event => {
              pick(event.target.files?.[0])
              event.target.value = ''
            }}
          />
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => input.current?.click()}
            className="border-line-2"
          >
            {upload.isPending ? <Loader2 className="size-4 animate-spin" /> : <ImageUp className="size-4" />}
            {brand.logoUrl ? 'Cambiar logo' : 'Subir logo'}
          </Button>
          {brand.logoUrl && (
            <Button
              type="button"
              variant="ghost"
              disabled={busy}
              onClick={() =>
                remove.mutate(undefined, {
                  onSuccess: () => toast.success('Logo quitado: se muestran las iniciales'),
                  onError: error => failed(error, 'No se pudo quitar el logo'),
                })
              }
              className="text-ink-3 hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="size-4" />
              Quitar
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
