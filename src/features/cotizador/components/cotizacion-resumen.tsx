'use client'

import { formatARS, type CoverageCard } from '../lib/coverages'
import { formatDisplayDate } from '../lib/dates'

interface CotizacionResumenProps {
  card: CoverageCard
  vehicleLabel: string | null
  quoteNumber: string | null
  startDate: string
  endDate: string | null
}

export function CotizacionResumen({
  card,
  vehicleLabel,
  quoteNumber,
  startDate,
  endDate,
}: Readonly<CotizacionResumenProps>) {
  return (
    <aside className="flex flex-col gap-4 rounded-2xl border border-ember/40 bg-paper p-5 shadow-[0_12px_32px_-16px_rgba(232,168,32,0.35)] md:sticky md:top-[96px]">
      <div>
        <div className="text-[10px] tracking-[0.2em] uppercase text-faint font-semibold mb-[6px]">Tu selección</div>
        <div className="font-display text-[19px] text-ink leading-tight">{card.tier.name}</div>
        {vehicleLabel && <div className="text-[12px] text-ink-3 mt-1 leading-snug">{vehicleLabel}</div>}
      </div>

      <div className="border-t border-line pt-4">
        <div className="flex items-baseline gap-1">
          <span className="font-display text-[28px] text-ink leading-none">{formatARS(card.displayPrice)}</span>
          <span className="text-[12px] text-faint">/mes</span>
        </div>
        <div className="text-[11px] text-faint mt-[6px] tracking-[0.02em]">Premio contado</div>
      </div>

      <dl className="flex flex-col gap-[10px] m-0 border-t border-line pt-4 text-[12.5px]">
        <div className="flex items-baseline justify-between gap-2">
          <dt className="text-faint m-0">Inicio de la cobertura *</dt>
          <dd className="text-ink font-semibold m-0">{startDate ? formatDisplayDate(startDate) : '—'}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-2">
          <dt className="text-faint m-0">Fin de la cobertura</dt>
          <dd className="text-ink font-semibold m-0">{endDate ? formatDisplayDate(endDate) : '—'}</dd>
        </div>
        {quoteNumber && (
          <div className="flex items-baseline justify-between gap-2">
            <dt className="text-faint m-0">Presupuesto Nro.</dt>
            <dd className="text-ink font-semibold m-0">{quoteNumber}</dd>
          </div>
        )}
      </dl>

      <p className="text-[10.5px] text-faint leading-[1.6] m-0 border-t border-line pt-3">
        * La fecha de inicio está sujeta a la inspección del vehículo. La cobertura se refactura automáticamente en
        forma mensual.
      </p>
    </aside>
  )
}
