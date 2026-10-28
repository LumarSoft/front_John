'use client'

import { useRef, useState } from 'react'
import { BanknoteX, FileSpreadsheet, Loader2, Upload } from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import { cn } from '@/src/lib/utils'
import { useRejectionImports } from '../hooks/use-rejections'
import { useRejectionUpload } from '../hooks/use-rejection-upload'
import { formatMoment } from '../lib/rejections-format'
import { RejectionImportDetail } from './rejection-import-detail'

export function RejectionsView() {
  const { data, isLoading, isError } = useRejectionImports()
  const [pickedId, setPickedId] = useState<number | null>(null)
  const { upload, busy } = useRejectionUpload(setPickedId)
  const fileInput = useRef<HTMLInputElement>(null)

  const imports = data?.imports ?? []
  // The one picked, else the latest Excel.
  const selectedId = imports.some(item => item.id === pickedId) ? pickedId : (imports[0]?.id ?? null)

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 font-display text-[22px] tracking-tight text-ink">
            <BanknoteX className="size-5 text-ember-2" />
            Rechazos
          </h1>
          <p className="mt-1 max-w-[640px] text-[13px] text-muted-foreground">
            Cargá el Excel de débitos rechazados que baja de Triunfo (el de CBU o el de tarjetas) y el bot le avisa a
            cada cliente por WhatsApp.
          </p>
        </div>
        <input
          ref={fileInput}
          type="file"
          accept=".xls,.xlsx"
          className="hidden"
          onChange={event => {
            const file = event.target.files?.[0]
            event.target.value = ''
            if (file) void upload(file)
          }}
        />
        <Button onClick={() => fileInput.current?.click()} disabled={busy}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
          Cargar Excel
        </Button>
      </header>

      {data && !data.templateReady && (
        <p className="mb-4 rounded-lg border border-amber-border bg-amber-subtle px-4 py-3 text-[13px] text-amber-700 dark:text-amber">
          El mensaje de WhatsApp para avisar rechazos está en revisión de Meta. Ya podés cargar los Excel; el botón de
          enviar se habilita cuando lo aprueben.
        </p>
      )}

      {isError ? (
        <p role="alert" className="rounded-xl border border-line-2 bg-card p-10 text-center text-destructive">
          No se pudieron cargar los rechazos.
        </p>
      ) : isLoading ? (
        <p className="flex items-center justify-center gap-2 p-10 text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Cargando…
        </p>
      ) : imports.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line-2 bg-card p-12 text-center">
          <FileSpreadsheet className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-3 text-[14px] text-ink-3">Todavía no cargaste ningún Excel de rechazos.</p>
          <Button variant="outline" className="mt-4" onClick={() => fileInput.current?.click()} disabled={busy}>
            <Upload className="size-4" /> Cargar el primero
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <ul className="flex gap-2 overflow-x-auto pb-1">
            {imports.map(item => {
              const sent = (item.counts.SENT ?? 0) + (item.counts.MARKED ?? 0)
              const total = Object.values(item.counts).reduce((sum, n) => sum + (n ?? 0), 0)
              return (
                <li key={item.id} className="w-[240px] shrink-0">
                  <button
                    type="button"
                    onClick={() => setPickedId(item.id)}
                    className={cn(
                      'w-full rounded-lg border px-3 py-2.5 text-left transition-colors',
                      item.id === selectedId
                        ? 'border-ember-ring bg-ember-soft'
                        : 'border-line-2 bg-card hover:bg-secondary/60',
                    )}
                  >
                    <p className="truncate text-[13px] font-medium text-ink">{item.fileName}</p>
                    <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                      {formatMoment(item.createdAt)} · {sent}/{total} avisados
                    </p>
                  </button>
                </li>
              )
            })}
          </ul>

          <section className="min-w-0 overflow-hidden rounded-xl border border-line-2 bg-card">
            {selectedId !== null && (
              <RejectionImportDetail key={selectedId} importId={selectedId} onDeleted={() => setPickedId(null)} />
            )}
          </section>
        </div>
      )}
    </div>
  )
}
