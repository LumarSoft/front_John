'use client'

import { useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { FileText, Loader2, Paperclip } from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/src/components/ui/dialog'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Skeleton } from '@/src/components/ui/skeleton'
import {
  adjuntoUrl,
  type AdminSiniestroDetail,
  type Adjunto,
  type SiniestroEstado,
} from '@/src/services/siniestros.service'
import { formatDate } from '../lib/asegurados-ui'
import { ESTADO_META, ESTADO_ORDER, EstadoBadge, tipoLabel } from '../lib/siniestros-ui'
import { useAdminSiniestro, useUpdateAdminSiniestro } from '../hooks/use-admin-siniestro'

interface SiniestroSheetProps {
  siniestroId: number | null
  onClose: () => void
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="mb-2.5 flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-faint">
      {children}
    </h3>
  )
}

function Field({ label, value }: { label: string; value: ReactNode }) {
  if (value === null || value === undefined || value === '') return null
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-line-2 bg-paper px-3.5 py-2.5">
      <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-faint">{label}</span>
      <span className="text-[13.5px] text-ink">{value}</span>
    </div>
  )
}

function AdjuntoCard({ adjunto }: { adjunto: Adjunto }) {
  const url = adjuntoUrl(adjunto)
  const isImage = adjunto.mimeType.startsWith('image/')

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-2.5 rounded-xl border border-line-2 bg-paper px-3 py-2 transition-colors hover:border-ember-ring hover:bg-ember-soft"
    >
      {isImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={adjunto.originalName} className="size-10 shrink-0 rounded-md object-cover" />
      ) : (
        <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-secondary text-muted-foreground">
          <FileText className="size-4" />
        </div>
      )}
      <span className="min-w-0 flex-1 truncate text-[12.5px] text-ink-3 group-hover:text-ember-2">
        {adjunto.originalName}
      </span>
    </a>
  )
}

// Loaded content. State is initialized straight from props and the component is
// remounted (via `key={siniestro.id}`) whenever a different claim is opened, so
// there's no state-syncing effect.
function SiniestroContent({ siniestro }: { siniestro: AdminSiniestroDetail }) {
  const update = useUpdateAdminSiniestro(siniestro.id)
  const [estado, setEstado] = useState<SiniestroEstado>(siniestro.estado)
  const [nro, setNro] = useState(siniestro.nroSiniestroCompania ?? '')

  const dirty = estado !== siniestro.estado || nro.trim() !== (siniestro.nroSiniestroCompania ?? '')

  const handleSave = () => {
    update.mutate(
      { estado, nroSiniestroCompania: nro.trim() },
      {
        onSuccess: () => toast.success('Siniestro actualizado'),
        onError: () => toast.error('No se pudo actualizar el siniestro'),
      },
    )
  }

  const vehiculo = siniestro.poliza.vehiculo
  const vehiculoLabel = vehiculo
    ? [vehiculo.marca, vehiculo.modelo].filter(Boolean).join(' ') || vehiculo.dominio || '—'
    : '—'

  return (
    <>
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="flex items-start justify-between gap-3 border-b border-line-2 px-6 pb-5 pt-6 pr-12">
        <div className="min-w-0">
          <DialogTitle className="font-display text-[19px] leading-tight tracking-tight text-ink">
            Siniestro #{siniestro.id} · {tipoLabel(siniestro.tipo)}
          </DialogTitle>
          <div className="mt-1 text-[12.5px] text-muted-foreground">Recibido el {formatDate(siniestro.createdAt)}</div>
        </div>
        <EstadoBadge estado={estado} className="mt-0.5 shrink-0" />
      </header>

      {/* ── Body (scrollable) ──────────────────────────────────── */}
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
        <div className="mx-auto flex max-w-2xl flex-col gap-6">
          <section>
            <SectionTitle>Asegurado y póliza</SectionTitle>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <Field label="Cliente" value={`${siniestro.client.firstName} ${siniestro.client.lastName}`} />
              <Field label="DNI" value={siniestro.client.dni} />
              <Field label="Teléfono" value={siniestro.client.phone} />
              <Field label="Email" value={siniestro.client.email} />
              <Field label="Póliza" value={`#${siniestro.poliza.certificado} · ${siniestro.poliza.company}`} />
              <Field label="Vehículo" value={vehiculoLabel} />
              <Field label="Fecha del hecho" value={formatDate(siniestro.fecha)} />
            </div>
          </section>

          <section>
            <SectionTitle>Descripción</SectionTitle>
            <p className="whitespace-pre-wrap rounded-xl border border-line-2 bg-paper px-3.5 py-3 text-[13.5px] leading-relaxed text-ink-3">
              {siniestro.descripcion}
            </p>
          </section>

          {siniestro.adjuntos && siniestro.adjuntos.length > 0 && (
            <section>
              <SectionTitle>
                <Paperclip className="size-3" />
                Adjuntos ({siniestro.adjuntos.length})
              </SectionTitle>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {siniestro.adjuntos.map(a => (
                  <AdjuntoCard key={a.filename} adjunto={a} />
                ))}
              </div>
            </section>
          )}

          {/* ── Gestión ──────────────────────────────────────────── */}
          <section className="rounded-xl border border-line-2 bg-secondary/20 p-4">
            <SectionTitle>Gestión del reclamo</SectionTitle>

            <div className="flex flex-col gap-1.5">
              <Label className="text-[12px] text-muted-foreground">Estado</Label>
              <div className="grid grid-cols-3 gap-1.5">
                {ESTADO_ORDER.map(opt => {
                  const active = estado === opt
                  const meta = ESTADO_META[opt]
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setEstado(opt)}
                      className={`flex h-9 items-center justify-center gap-1.5 rounded-lg border text-[12.5px] font-medium transition-colors ${
                        active ? meta.badge : 'border-line-2 text-ink-3 hover:bg-secondary/60'
                      }`}
                    >
                      <span className={`size-1.5 rounded-full ${meta.dot}`} />
                      {meta.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-1.5">
              <Label htmlFor="nro-compania" className="text-[12px] text-muted-foreground">
                N° de siniestro de la compañía
              </Label>
              <Input
                id="nro-compania"
                value={nro}
                onChange={e => setNro(e.target.value)}
                placeholder="Cargar tras presentarlo en Triunfo"
                maxLength={50}
                className="h-9 bg-paper"
              />
            </div>

            <Button
              type="button"
              className="mt-4 h-9 w-full"
              disabled={!dirty || update.isPending}
              onClick={handleSave}
            >
              {update.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Guardando…
                </>
              ) : (
                'Guardar cambios'
              )}
            </Button>
          </section>
        </div>
      </div>
    </>
  )
}

export function SiniestroSheet({ siniestroId, onClose }: SiniestroSheetProps) {
  const { data: siniestro, isLoading } = useAdminSiniestro(siniestroId)

  return (
    <Dialog open={siniestroId !== null} onOpenChange={open => !open && onClose()}>
      <DialogContent
        aria-describedby={undefined}
        className="flex max-h-[88vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl"
      >
        {isLoading || !siniestro ? (
          <div className="flex flex-col gap-4 p-6">
            <DialogTitle className="sr-only">Cargando siniestro</DialogTitle>
            <Skeleton className="h-6 w-56" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        ) : (
          <SiniestroContent key={siniestro.id} siniestro={siniestro} />
        )}
      </DialogContent>
    </Dialog>
  )
}
