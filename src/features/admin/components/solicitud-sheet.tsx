'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/src/components/ui/sheet'
import { Button } from '@/src/components/ui/button'
import { Skeleton } from '@/src/components/ui/skeleton'
import type { LeadDetail, SolicitudDetail, SolicitudKind, SolicitudStatus } from '@/src/types/api/solicitudes'
import { useSolicitud } from '../hooks/use-solicitudes'
import { useSolicitudActions } from '../hooks/use-solicitud-actions'
import { productLabel, STATUS_LABELS, STATUS_ORDER } from '../lib/solicitudes-ui'

interface SolicitudSheetProps {
  target: { kind: SolicitudKind; id: number } | null
  onClose: () => void
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  if (value === null || value === undefined || value === '') return null
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10.5px] uppercase tracking-[0.18em] text-faint font-semibold">{label}</span>
      <span className="text-[13.5px] text-ink">{value}</span>
    </div>
  )
}

export function SolicitudSheet({ target, onClose }: Readonly<SolicitudSheetProps>) {
  const { data, isLoading } = useSolicitud(target?.kind ?? null, target?.id ?? null)

  return (
    <Sheet open={target !== null} onOpenChange={open => !open && onClose()}>
      <SheetContent className="w-full gap-0 overflow-y-auto p-0 sm:max-w-md">
        <SheetHeader className="border-b border-line-2 px-5 py-4">
          <SheetTitle className="font-display text-[18px]">Solicitud de cotización</SheetTitle>
          <SheetDescription>
            {data
              ? `${productLabel(detailProductType(data))} · ${data.kind === 'lead' ? 'Lead' : 'Cotización online'}`
              : '…'}
          </SheetDescription>
        </SheetHeader>

        {isLoading || !data || !target ? (
          <div className="flex flex-col gap-4 p-5">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-56" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          // Keyed by id so the editor remounts with fresh state per solicitud,
          // initializing from the loaded data without a syncing effect.
          <SolicitudEditor key={`${target.kind}-${target.id}`} data={data} target={target} onClose={onClose} />
        )}
      </SheetContent>
    </Sheet>
  )
}

function SolicitudEditor({
  data,
  target,
  onClose,
}: Readonly<{ data: SolicitudDetail; target: { kind: SolicitudKind; id: number }; onClose: () => void }>) {
  const { update } = useSolicitudActions()
  const [status, setStatus] = useState<SolicitudStatus>(data.status)
  const [notes, setNotes] = useState(data.notes ?? '')

  const handleSave = () => {
    update.mutate(
      { kind: target.kind, id: target.id, data: { status, notes } },
      {
        onSuccess: () => {
          toast.success('Solicitud actualizada')
          onClose()
        },
        onError: () => toast.error('No se pudo guardar. Intentá de nuevo.'),
      },
    )
  }

  return (
    <div className="flex flex-col gap-5 p-5">
      <div className="grid grid-cols-2 gap-4">
        <Row label="Producto" value={productLabel(detailProductType(data))} />
        {data.kind === 'lead' && <Row label="Canal" value={data.channel === 'WHATSAPP' ? 'WhatsApp' : 'Web'} />}
        <Row label="Contacto" value={data.kind === 'lead' ? data.contactName : fullName(data)} />
        <Row label="Teléfono" value={data.kind === 'lead' ? data.phone : data.applicantPhone} />
        <Row label="Email" value={data.kind === 'lead' ? data.email : data.applicantEmail} />
      </div>

      {data.kind === 'lead' ? (
        <LeadExtra data={data} />
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <Row label="Cobertura" value={data.selectedCoverage} />
          <Row label="N° presupuesto" value={data.cotizacion.quoteNumber} />
          <Row label="Vehículo" value={`${data.cotizacion.vehicleType} ${data.cotizacion.manufactureYear}`} />
          <Row label="CP" value={data.cotizacion.postalCode} />
          <Row label="Documento" value={`${data.applicantDocType} ${data.applicantDocNumber}`} />
          <Row label="Dirección" value={data.applicantAddress} />
          <Row label="Pago" value={data.paymentMethod} />
        </div>
      )}

      <div className="flex flex-col gap-2">
        <span className="text-[10.5px] uppercase tracking-[0.18em] text-faint font-semibold">Estado</span>
        <div className="flex gap-2">
          {STATUS_ORDER.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={`rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors ${
                status === s
                  ? 'border-ember bg-ember-soft text-ember-2'
                  : 'border-line-2 text-ink-3 hover:bg-secondary/50'
              }`}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="solicitud-notes" className="text-[10.5px] uppercase tracking-[0.18em] text-faint font-semibold">
          Notas internas
        </label>
        <textarea
          id="solicitud-notes"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={4}
          maxLength={2000}
          placeholder="Anotá el seguimiento de esta solicitud…"
          className="w-full rounded-xl border border-line-2 bg-paper px-3 py-2.5 text-[13.5px] text-ink outline-none transition-[border-color,box-shadow] focus:border-ember focus:shadow-[0_0_0_3px_rgba(232,168,32,0.12)]"
        />
      </div>

      <Button type="button" onClick={handleSave} disabled={update.isPending} className="h-10">
        {update.isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Guardando…
          </>
        ) : (
          'Guardar cambios'
        )}
      </Button>
    </div>
  )
}

function fullName(d: { applicantFirstName: string; applicantLastName: string | null }): string {
  return `${d.applicantFirstName} ${d.applicantLastName ?? ''}`.trim()
}

function detailProductType(d: SolicitudDetail): string {
  return d.kind === 'lead' ? d.productType : d.cotizacion.vehicleType.toLowerCase()
}

function LeadExtra({ data }: { data: LeadDetail }) {
  const entries = Object.entries(data.payload ?? {}).filter(([, v]) => v !== null && v !== '')
  return (
    <div className="flex flex-col gap-4">
      {data.selectedPlan && (
        <Row
          label="Plan elegido"
          value={`${data.selectedPlan.name} · ${data.selectedPlan.monthlyPrice.toLocaleString('es-AR', {
            style: 'currency',
            currency: 'ARS',
            maximumFractionDigits: 0,
          })} / mes`}
        />
      )}
      {entries.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {entries.map(([k, v]) => (
            <Row key={k} label={k} value={String(v)} />
          ))}
        </div>
      )}
    </div>
  )
}
