'use client'

import { useState } from 'react'
import { Chevron, inputClass, labelClass } from './form-controls'
import { OtrosMetodosModal } from './otros-metodos-modal'
import type { PagoFormHook } from '../hooks/use-pago-form'
import type { PaymentMethod } from '@/src/types/api/cotizador'

const CARD_COMPANIES = ['VISA', 'MASTERCARD', 'AMERICAN EXPRESS', 'NARANJA', 'CABAL', 'OTRA']

const METHODS: { value: PaymentMethod; label: string; description: string }[] = [
  { value: 'CREDIT', label: 'Tarjeta de crédito', description: 'Débito automático en tu tarjeta' },
  { value: 'DEBIT', label: 'Tarjeta de débito', description: 'Débito automático en tu cuenta' },
  { value: 'OTHER', label: 'Otro método de pago', description: 'Un agente te contacta para coordinarlo' },
]

const CardIcon = ({ method }: { method: PaymentMethod }) =>
  method === 'OTHER' ? (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path
        d="M21 11.5a8.5 8.5 0 01-8.5 8.5c-1.5 0-2.9-.38-4.13-1.05L3 20l1.05-5.37A8.5 8.5 0 1121 11.5z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ) : (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="2" y="5" width="20" height="14" rx="2.5" />
      <path d="M2 10h20" />
      {method === 'CREDIT' ? (
        <path d="M6 15h4" strokeLinecap="round" />
      ) : (
        <path d="M6 15h2M16 15h2" strokeLinecap="round" />
      )}
    </svg>
  )

const digitsOnly = (value: string): string => value.replace(/\D/g, '')

const formatCardNumber = (digits: string): string => digits.replace(/(\d{4})(?=\d)/g, '$1 ')

const formatExpiry = (value: string): string => {
  const digits = digitsOnly(value).slice(0, 4)
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits
}

interface PagoStepProps {
  form: PagoFormHook
  phone: string
  submitting: boolean
  submitError: boolean
  onSubmit: () => void
  onBack: () => void
}

export function PagoStep({ form: hook, phone, submitting, submitError, onSubmit, onBack }: Readonly<PagoStepProps>) {
  const { form, paysWithCard, isValid, setMethod, setField } = hook
  const [modalOpen, setModalOpen] = useState(false)

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!isValid || submitting) return
    if (form.method === 'OTHER') setModalOpen(true)
    else onSubmit()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <div className="text-[10.5px] tracking-[0.24em] uppercase text-faint font-semibold mb-[6px]">Método de pago</div>
      <h3 className="font-display text-[24px] text-ink m-0 mb-2">¿Cómo querés pagar?</h3>
      <p className="text-[13px] text-ink-3 leading-[1.65] m-0 mb-6 max-w-[420px]">
        El premio se debita todos los meses. Podés cambiar el método de pago cuando quieras hablando con nosotros.
      </p>

      <div className="grid grid-cols-3 gap-[10px] mb-6 max-[680px]:grid-cols-1">
        {METHODS.map(method => {
          const selected = form.method === method.value
          return (
            <button
              key={method.value}
              type="button"
              onClick={() => setMethod(method.value)}
              aria-pressed={selected}
              className={`flex flex-col items-start gap-2 rounded-2xl border p-4 text-left cursor-pointer transition-[border-color,box-shadow,background-color] duration-[180ms] ${
                selected
                  ? 'border-ember bg-ember-soft shadow-[0_10px_28px_-14px_rgba(232,168,32,0.45)]'
                  : 'border-line-2 bg-paper hover:border-line-strong'
              }`}
            >
              <span className={selected ? 'text-ember-2' : 'text-faint'}>
                <CardIcon method={method.value} />
              </span>
              <span className="text-[13px] font-semibold text-ink leading-tight">{method.label}</span>
              <span className="text-[11.5px] text-faint leading-snug">{method.description}</span>
            </button>
          )
        })}
      </div>

      {paysWithCard && (
        <div
          key={form.method}
          className="grid grid-cols-2 gap-[14px] mb-2 max-[560px]:grid-cols-1 animate-[step-in_0.35s_ease-out_both]"
        >
          <div className="flex flex-col gap-[7px]">
            <label className={labelClass} htmlFor="card-company">
              Empresa
            </label>
            <div className="relative">
              <select
                id="card-company"
                className={inputClass}
                value={form.cardCompany}
                onChange={e => setField('cardCompany', e.target.value)}
              >
                <option value="">Seleccioná la empresa</option>
                {CARD_COMPANIES.map(company => (
                  <option key={company} value={company}>
                    {company}
                  </option>
                ))}
              </select>
              <Chevron />
            </div>
          </div>

          <div className="flex flex-col gap-[7px]">
            <label className={labelClass} htmlFor="card-holder">
              Titular
            </label>
            <input
              id="card-holder"
              type="text"
              className={inputClass}
              placeholder="Como figura en la tarjeta"
              value={form.cardHolder}
              onChange={e => setField('cardHolder', e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-[7px]">
            <label className={labelClass} htmlFor="card-number">
              Número de tarjeta
            </label>
            <input
              id="card-number"
              type="text"
              inputMode="numeric"
              autoComplete="cc-number"
              className={inputClass}
              placeholder="0000 0000 0000 0000"
              value={formatCardNumber(form.cardNumber)}
              onChange={e => setField('cardNumber', digitsOnly(e.target.value).slice(0, 19))}
            />
          </div>

          <div className="flex flex-col gap-[7px]">
            <label className={labelClass} htmlFor="card-expiry">
              Vencimiento
            </label>
            <input
              id="card-expiry"
              type="text"
              inputMode="numeric"
              autoComplete="cc-exp"
              className={inputClass}
              placeholder="MM/AA"
              value={form.cardExpiry}
              onChange={e => setField('cardExpiry', formatExpiry(e.target.value))}
            />
          </div>

          <p className="col-span-2 max-[560px]:col-span-1 text-[11px] text-faint leading-[1.6] m-0">
            No te cobramos nada ahora: los datos se usan para configurar el débito automático al emitir la póliza.
          </p>
        </div>
      )}

      {form.method === 'OTHER' && (
        <p className="text-[12.5px] text-ink-3 leading-[1.65] m-0 mb-2 max-w-[420px] animate-[step-in_0.35s_ease-out_both]">
          Un agente te va a contactar al <span className="text-ink font-semibold">{phone}</span> para coordinar el pago
          y finalizar la contratación.
        </p>
      )}

      {submitError && (
        <p className="mt-4 text-[13px] text-red-600 leading-[1.5]">
          Ocurrió un error al enviar tu solicitud. Por favor intentá de nuevo.
        </p>
      )}

      <div className="flex items-center gap-5 mt-7 flex-wrap">
        <button
          type="submit"
          disabled={!isValid || submitting}
          className="btn-shimmer inline-flex items-center gap-2 bg-ember text-paper border-none py-[14px] px-6 rounded-full font-semibold text-[13.5px] tracking-[-0.005em] cursor-pointer transition-[background-color,box-shadow,opacity] duration-[180ms] hover:bg-ember-2 hover:shadow-[0_12px_32px_-8px_rgba(232,168,32,0.55)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Enviando…' : 'Confirmar solicitud'}
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          type="button"
          onClick={onBack}
          className="text-[12px] tracking-[-0.005em] font-semibold text-ember-2 hover:text-ember transition-colors duration-[180ms] bg-transparent border-none cursor-pointer"
        >
          ← Volver a tus datos
        </button>
      </div>

      <OtrosMetodosModal
        open={modalOpen}
        phone={phone}
        submitting={submitting}
        onCancel={() => setModalOpen(false)}
        onConfirm={onSubmit}
      />
    </form>
  )
}
