'use client'

import { useState } from 'react'
import type { Product } from '@/src/features/landing/types'
import { FormField } from './form-field'
import { useLeadForm } from '../hooks/use-lead-form'
import { useProductFields } from '../hooks/use-product-fields'
import { useSubmitLead } from '../hooks/use-submit-lead'
import { LeadConfirmada } from './lead-confirmada'

export function LeadForm({ product }: Readonly<{ product: Product }>) {
  const productFields = useProductFields(product.id)
  const form = useLeadForm(product.id, productFields)
  const submit = useSubmitLead()
  const [done, setDone] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    form.markAttempted()
    if (!form.isValid) return
    submit.mutate(form.buildPayload(), { onSuccess: () => setDone(true) })
  }

  if (done) {
    return (
      <LeadConfirmada
        name={form.values['Nombre y apellido']?.trim() ?? ''}
        productLabel={product.label}
        onReset={() => {
          form.reset()
          setDone(false)
        }}
      />
    )
  }

  return (
    <form className="flex flex-col" onSubmit={handleSubmit}>
      {form.productFields.length > 0 && (
        <>
          <div className="text-[10.5px] tracking-[0.24em] uppercase text-faint font-semibold mb-[18px]">
            Datos de la cobertura
          </div>
          <div className="grid grid-cols-2 gap-[14px] mb-2 max-[560px]:grid-cols-1">
            {form.productFields.map(f => (
              <FormField
                key={f.label}
                field={f}
                value={form.values[f.label] ?? ''}
                onChange={v => form.setValue(f.label, v)}
                invalid={form.attempted && form.invalidLabels.has(f.label)}
              />
            ))}
          </div>

          <hr className="border-none border-t border-line my-7" />
        </>
      )}

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
          {submit.isPending ? 'Enviando…' : 'Solicitar cotización'}
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span className="text-[12.5px] text-faint tracking-[-0.005em]">Te respondemos en menos de 24 hs hábiles</span>
      </div>
    </form>
  )
}
