'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/src/components/ui/button'
import { Skeleton } from '@/src/components/ui/skeleton'
import { WhatsAppIcon } from '@/src/components/ui/brand-icons'
import type {
  CotizacionCoverageView,
  LeadDetail,
  SolicitudDetail,
  SolicitudKind,
  SolicitudStatus,
} from '@/src/types/api/solicitudes'
import { useSolicitud } from '../hooks/use-solicitudes'
import { useSolicitudActions } from '../hooks/use-solicitud-actions'
import { buildSolicitudWhatsappUrl, productLabel, STATUS_LABELS, STATUS_ORDER, timeAgo } from '../lib/solicitudes-ui'
import { StatusPill } from './solicitud-status-pill'

interface SolicitudDetailViewProps {
  target: { kind: SolicitudKind; id: number } | null
  onClose: () => void
}

/**
 * The full solicitud detail: header (product + status), data grid, status
 * selector and internal notes. Rendered inside the dialog modal.
 */
export function SolicitudDetailView({ target, onClose }: Readonly<SolicitudDetailViewProps>) {
  const { data, isLoading } = useSolicitud(target?.kind ?? null, target?.id ?? null)

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex items-start gap-3 border-b border-line-2 px-5 py-4 pr-12">
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-[17px] tracking-tight text-ink">
            {data ? productLabel(detailProductType(data)) : 'Solicitud de cotización'}
          </h2>
          <p className="mt-0.5 text-[12.5px] text-muted-foreground">
            {data
              ? `${data.kind === 'lead' ? 'Lead / asesor' : 'Cotización online'} · ${timeAgo(data.createdAt)}`
              : '…'}
          </p>
        </div>
        {data && <StatusPill status={data.status} className="mt-0.5" />}
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
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
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  if (value === null || value === undefined || value === '') return null
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-line-2 bg-paper px-3.5 py-2.5">
      <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-faint">{label}</span>
      <span className="text-[13.5px] text-ink">{value}</span>
    </div>
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

  const contactName = data.kind === 'lead' ? data.contactName : fullName(data)
  const contactPhone = data.kind === 'lead' ? data.phone : data.applicantPhone
  const whatsappUrl = buildSolicitudWhatsappUrl(contactPhone, contactName, detailProductType(data))

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 p-5">
      <section>
        <h3 className="mb-2.5 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-faint">Datos de contacto</h3>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <Row label="Contacto" value={contactName} />
          <Row label="Teléfono" value={contactPhone} />
          <Row label="Email" value={data.kind === 'lead' ? data.email : data.applicantEmail} />
          {data.kind === 'lead' && <Row label="Canal" value={data.channel === 'WHATSAPP' ? 'WhatsApp' : 'Web'} />}
        </div>
        {whatsappUrl && (
          <Button asChild className="mt-3 h-10 w-full gap-2 bg-[#25D366] text-white hover:bg-[#1ebe5b] sm:w-auto">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon className="size-4" />
              Hablar por WhatsApp
            </a>
          </Button>
        )}
      </section>

      <section>
        <h3 className="mb-2.5 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-faint">
          Detalle de la cobertura
        </h3>
        {data.kind === 'lead' ? (
          <LeadExtra data={data} />
        ) : (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <Row label="Cobertura elegida" value={data.selectedCoverage} />
              <Row label="N° presupuesto" value={data.cotizacion.quoteNumber} />
              <Row label="Vehículo" value={`${data.cotizacion.vehicleType} ${data.cotizacion.manufactureYear}`} />
              <Row label="CP" value={data.cotizacion.postalCode} />
              <Row label="Documento" value={`${data.applicantDocType} ${data.applicantDocNumber}`} />
              <Row label="Dirección" value={data.applicantAddress} />
              <Row label="Pago" value={data.paymentMethod} />
            </div>
            <CoveragesList coverages={data.coverages} selected={data.selectedCoverage} />
          </div>
        )}
      </section>

      <section className="flex flex-col gap-2.5">
        <h3 className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-faint">Estado</h3>
        <div className="flex flex-wrap gap-2">
          {STATUS_ORDER.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={`rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium transition-colors ${
                status === s
                  ? 'border-ember bg-ember-soft text-ember-2'
                  : 'border-line-2 text-ink-3 hover:bg-secondary/50'
              }`}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-2.5">
        <label htmlFor="solicitud-notes" className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-faint">
          Notas internas
        </label>
        <textarea
          id="solicitud-notes"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={4}
          maxLength={2000}
          placeholder="Anotá el seguimiento de esta solicitud…"
          className="w-full rounded-xl border border-line-2 bg-paper px-3.5 py-3 text-[13.5px] text-ink outline-none transition-[border-color,box-shadow] focus:border-ember focus:shadow-[0_0_0_3px_rgba(232,168,32,0.12)]"
        />
      </section>

      <div className="flex justify-end">
        <Button type="button" onClick={handleSave} disabled={update.isPending} className="h-10 px-6">
          {update.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Guardando…
            </>
          ) : (
            'Guardar cambios'
          )}
        </Button>
      </div>
    </div>
  )
}

const ars = (n: number) => n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })

/** All quoted coverages with their prices — the same figures shown to the client. */
function CoveragesList({ coverages, selected }: { coverages: CotizacionCoverageView[]; selected: string }) {
  if (!coverages || coverages.length === 0) return null
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-faint">
        Coberturas cotizadas (mismos precios que vio el cliente)
      </span>
      <div className="flex flex-col gap-2">
        {coverages.map(c => {
          const isSel = c.code === selected
          const prices = c.paymentOptions.map(p => p.premium).filter(p => p > 0)
          const best = prices.length ? Math.min(...prices) : null
          return (
            <div
              key={c.code}
              className={`rounded-xl border px-3.5 py-2.5 ${isSel ? 'border-ember bg-ember-soft' : 'border-line-2 bg-paper'}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[13.5px] font-medium text-ink">
                  Cobertura {c.code}
                  {isSel ? ' · elegida' : ''}
                </span>
                {best !== null && (
                  <span className="text-[14px] font-semibold text-ink">
                    {ars(best)}
                    <span className="text-[11px] font-normal text-muted-foreground"> /mes</span>
                  </span>
                )}
              </div>
              {c.paymentOptions.length > 1 && (
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11.5px] text-muted-foreground">
                  {c.paymentOptions.map((p, i) => (
                    <span key={`${p.name}-${i}`}>
                      {p.name}: {ars(p.premium)}
                      {p.installments > 1 ? ` (${p.installments}×${ars(p.installmentValue)})` : ''}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
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
    <div className="flex flex-col gap-2.5">
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
      {entries.length > 0 ? (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {entries.map(([k, v]) => (
            <Row key={k} label={k} value={String(v)} />
          ))}
        </div>
      ) : (
        !data.selectedPlan && (
          <p className="text-[13px] text-muted-foreground">
            Sin datos adicionales — el cliente pidió que lo contacten.
          </p>
        )
      )}
    </div>
  )
}
