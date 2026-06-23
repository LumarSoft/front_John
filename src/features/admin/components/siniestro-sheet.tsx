'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Calendar, Car, FileText, Mail, Paperclip, Phone, Shield, User } from 'lucide-react'
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
import { useAdminSiniestro, useUpdateAdminSiniestro } from '../hooks/use-admin-siniestro'

interface SiniestroSheetProps {
  siniestroId: number | null
  onClose: () => void
}

const ESTADO_OPTIONS: { value: SiniestroEstado; label: string }[] = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'en_proceso', label: 'En proceso' },
  { value: 'resuelto', label: 'Resuelto' },
]

const TIPO_LABELS: Record<string, string> = {
  auto: 'Auto',
  hogar: 'Hogar',
  robo: 'Robo',
  otro: 'Otro',
}

function AdjuntoCard({ adjunto }: { adjunto: Adjunto }) {
  const url = adjuntoUrl(adjunto)
  const isImage = adjunto.mimeType.startsWith('image/')

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-2.5 rounded-lg border border-line-2 bg-card px-3 py-2 transition-colors hover:border-ember-ring hover:bg-ember-soft"
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

function InfoRow({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-card text-muted-foreground ring-1 ring-line-2">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-faint">{label}</div>
        <div className="truncate text-[13.5px] text-ink-3" title={value}>
          {value}
        </div>
      </div>
    </div>
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
      <div className="border-b border-line-2 px-6 pb-5 pt-6">
        <DialogTitle className="font-display text-[20px] leading-tight tracking-tight text-ink">
          Siniestro #{siniestro.id} · {TIPO_LABELS[siniestro.tipo] ?? siniestro.tipo}
        </DialogTitle>
        <div className="mt-1 text-[13px] text-muted-foreground">Recibido el {formatDate(siniestro.createdAt)}</div>

        <div className="mt-5 grid grid-cols-1 gap-x-8 gap-y-3.5 rounded-xl border border-line-2 bg-secondary/30 px-5 py-4 sm:grid-cols-2">
          <InfoRow
            icon={User}
            label="Cliente"
            value={`${siniestro.client.firstName} ${siniestro.client.lastName} · DNI ${siniestro.client.dni}`}
          />
          <InfoRow
            icon={Shield}
            label="Póliza"
            value={`#${siniestro.poliza.certificado} · ${siniestro.poliza.company}`}
          />
          <InfoRow icon={Car} label="Vehículo" value={vehiculoLabel} />
          <InfoRow icon={Calendar} label="Fecha del hecho" value={formatDate(siniestro.fecha)} />
          {siniestro.client.phone && <InfoRow icon={Phone} label="Teléfono" value={siniestro.client.phone} />}
          <InfoRow icon={Mail} label="Email" value={siniestro.client.email} />
        </div>
      </div>

      {/* ── Body (scrollable) ──────────────────────────────────── */}
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
        <div>
          <div className="text-[10.5px] uppercase tracking-[0.1em] text-muted-foreground">Descripción</div>
          <p className="mt-1.5 whitespace-pre-wrap text-[13.5px] leading-relaxed text-ink-3">{siniestro.descripcion}</p>
        </div>

        {siniestro.adjuntos && siniestro.adjuntos.length > 0 && (
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.1em] text-muted-foreground">
              <Paperclip className="size-3" />
              Adjuntos ({siniestro.adjuntos.length})
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {siniestro.adjuntos.map(a => (
                <AdjuntoCard key={a.filename} adjunto={a} />
              ))}
            </div>
          </div>
        )}

        {/* ── Gestión ──────────────────────────────────────────── */}
        <div className="rounded-xl border border-line-2 bg-secondary/20 p-4">
          <div className="text-[13px] font-semibold text-ink">Gestión</div>

          <div className="mt-3 space-y-1.5">
            <Label className="text-[12px] text-muted-foreground">Estado</Label>
            <div className="grid grid-cols-3 gap-1.5">
              {ESTADO_OPTIONS.map(opt => (
                <Button
                  key={opt.value}
                  type="button"
                  size="sm"
                  variant={estado === opt.value ? 'default' : 'outline'}
                  className={`h-8 text-[12.5px] ${estado === opt.value ? '' : 'border-line-2 text-ink-3'}`}
                  onClick={() => setEstado(opt.value)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="mt-4 space-y-1.5">
            <Label htmlFor="nro-compania" className="text-[12px] text-muted-foreground">
              N° de siniestro de la compañía
            </Label>
            <Input
              id="nro-compania"
              value={nro}
              onChange={e => setNro(e.target.value)}
              placeholder="Cargar tras presentarlo en Triunfo"
              maxLength={50}
              className="h-9"
            />
          </div>

          <Button type="button" className="mt-4 h-9 w-full" disabled={!dirty || update.isPending} onClick={handleSave}>
            {update.isPending ? 'Guardando…' : 'Guardar cambios'}
          </Button>
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
