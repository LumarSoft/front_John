'use client'

import { useState } from 'react'
import type { Product } from '@/src/features/landing/types'
import type { CoverageItem, FixedProductType, ProductPlan } from '@/src/types/api/pricing'
import { FormField } from './form-field'
import { LeadConfirmada } from './lead-confirmada'
import { usePlanes } from '../hooks/use-planes'
import { useLeadForm } from '../hooks/use-lead-form'
import { useSubmitLead } from '../hooks/use-submit-lead'

function formatMoney(value: number): string {
  return value.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
}

const rowKey = (c: Pick<CoverageItem, 'label' | 'category'>) => `${c.label}__${c.category ?? ''}`

// The union of coverage rows across the product's plans, in first-seen order.
function buildRows(plans: ProductPlan[]): CoverageItem[] {
  const seen = new Set<string>()
  const rows: CoverageItem[] = []
  for (const plan of plans) {
    for (const c of plan.coverageItems) {
      const k = rowKey(c)
      if (!seen.has(k)) {
        seen.add(k)
        rows.push(c)
      }
    }
  }
  return rows
}

function PlansTable({ plans, onSelect }: Readonly<{ plans: ProductPlan[]; onSelect: (p: ProductPlan) => void }>) {
  const rows = buildRows(plans)
  const amountByPlan = plans.map(p => {
    const m = new Map<string, number>()
    p.coverageItems.forEach(c => m.set(rowKey(c), c.amount))
    return m
  })
  const gridCols = { gridTemplateColumns: `minmax(170px, 1.4fr) repeat(${plans.length}, minmax(120px, 1fr))` }

  return (
    <div className="-mx-2 overflow-x-auto px-2 sm:mx-0 sm:px-0">
      <div className="min-w-[520px]">
        {/* Header — plan name tabs */}
        <div className="grid items-end gap-x-2" style={gridCols}>
          <div />
          {plans.map(p => (
            <div
              key={p.id}
              className="rounded-t-xl bg-ember px-3 py-2.5 text-center font-display text-[14px] leading-tight text-paper"
            >
              {p.name}
            </div>
          ))}
        </div>

        {/* Coverage rows */}
        <div className="rounded-2xl border border-line bg-canvas-2">
          {rows.map((row, i) => (
            <div
              key={rowKey(row)}
              className={`grid items-center gap-x-2 px-3 py-4 ${i < rows.length ? 'border-b border-line' : ''}`}
              style={gridCols}
            >
              <div className="min-w-0">
                <div className="text-[13.5px] font-semibold leading-snug text-ink">{row.label}</div>
                {row.category && (
                  <div className="mt-0.5 text-[10px] tracking-[0.14em] uppercase text-faint">{row.category}</div>
                )}
              </div>
              {plans.map((p, idx) => {
                const amount = amountByPlan[idx].get(rowKey(row))
                return (
                  <div key={p.id} className="text-center text-[13.5px] text-ink-3">
                    {amount === undefined ? <span className="text-faint">—</span> : formatMoney(amount)}
                  </div>
                )
              })}
            </div>
          ))}

          {/* Monthly fee + CTA */}
          <div className="grid items-center gap-x-2 px-3 py-5" style={gridCols}>
            <div className="text-[13.5px] font-semibold text-ink">Cuota mensual</div>
            {plans.map(p => (
              <div key={p.id} className="flex flex-col items-center gap-2">
                <div className="text-center leading-tight">
                  <div className="text-[10.5px] uppercase tracking-[0.14em] text-faint">Desde</div>
                  <div className="font-display text-[18px] text-ink">{formatMoney(p.monthlyPrice)}</div>
                  <div className="text-[11px] text-faint">/ mes</div>
                </div>
                <button
                  type="button"
                  onClick={() => onSelect(p)}
                  className="inline-flex items-center justify-center rounded-full border border-ember bg-transparent px-5 py-2 text-[12.5px] font-semibold text-ember-2 transition-colors hover:bg-ember hover:text-paper"
                >
                  Contratá
                </button>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-4 text-center text-[12px] text-faint">
          Estos valores pueden variar conforme los impuestos de cada provincia.
        </p>
      </div>
    </div>
  )
}

export function PlanesFijos({ product }: Readonly<{ product: Product }>) {
  const { data: plans, isLoading, isError } = usePlanes(product.id as FixedProductType)
  const [selected, setSelected] = useState<ProductPlan | null>(null)
  const [done, setDone] = useState(false)
  const form = useLeadForm(product.id, { includeProductFields: false })
  const submit = useSubmitLead()

  if (done && selected) {
    return (
      <LeadConfirmada
        name={form.values['Nombre y apellido']?.trim() ?? ''}
        productLabel={product.label}
        planName={selected.name}
        onReset={() => {
          form.reset()
          setSelected(null)
          setDone(false)
        }}
      />
    )
  }

  if (isLoading) {
    return <p className="text-[14px] text-ink-3">Cargando planes…</p>
  }

  if (isError || !plans || plans.length === 0) {
    return (
      <p className="text-[14px] text-ink-3">
        Estamos actualizando los planes de {product.label.toLowerCase()}. Escribinos y un asesor te pasa la propuesta.
      </p>
    )
  }

  if (!selected) {
    return <PlansTable plans={plans} onSelect={setSelected} />
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    form.markAttempted()
    if (!form.isValid) return
    submit.mutate(form.buildPayload(selected.id), { onSuccess: () => setDone(true) })
  }

  return (
    <form className="flex flex-col" onSubmit={handleSubmit}>
      <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-line bg-paper px-5 py-4">
        <div>
          <div className="text-[10.5px] tracking-[0.24em] uppercase text-faint font-semibold">Plan elegido</div>
          <div className="mt-1 text-[15px] font-semibold text-ink">
            {selected.name} · {formatMoney(selected.monthlyPrice)} / mes
          </div>
        </div>
        <button
          type="button"
          onClick={() => setSelected(null)}
          className="text-[13px] text-ember font-semibold cursor-pointer hover:underline"
        >
          Cambiar
        </button>
      </div>

      <div className="text-[10.5px] tracking-[0.24em] uppercase text-faint font-semibold mb-[18px]">
        Tus datos de contacto
      </div>
      <div className="grid grid-cols-2 gap-[14px] mb-2 max-[560px]:grid-cols-1">
        {form.contactFields.map(f => (
          <FormField
            key={f.label}
            field={f}
            value={form.values[f.label] ?? ''}
            onChange={v => form.setValue(f.label, v)}
            invalid={form.attempted && form.invalidLabels.has(f.label)}
          />
        ))}
      </div>

      {submit.isError && (
        <p className="mt-4 text-[13px] text-red-500">No pudimos enviar tu solicitud. Probá de nuevo en un momento.</p>
      )}

      <div className="flex items-center gap-5 mt-8 flex-wrap">
        <button
          type="submit"
          disabled={submit.isPending}
          className="btn-shimmer inline-flex items-center gap-2 bg-ember text-paper border-none py-[14px] px-6 rounded-full font-semibold text-[13.5px] tracking-[-0.005em] cursor-pointer transition-[background-color,box-shadow] hover:bg-ember-2 hover:shadow-[0_12px_32px_-8px_rgba(232,168,32,0.55)] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submit.isPending ? 'Enviando…' : 'Solicitar este plan'}
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span className="text-[12.5px] text-faint tracking-[-0.005em]">Un asesor confirma la contratación</span>
      </div>
    </form>
  )
}
