'use client'

import { formatDisplayDate } from '../lib/dates'

interface SolicitudConfirmadaProps {
  name: string
  coverageName: string
  startDate: string
  quoteNumber: string | null
  otherPayment: boolean
  phone: string
  onReset: () => void
}

export function SolicitudConfirmada({
  name,
  coverageName,
  startDate,
  quoteNumber,
  otherPayment,
  phone,
  onReset,
}: Readonly<SolicitudConfirmadaProps>) {
  return (
    <div className="flex flex-col items-center gap-6 py-12 text-center">
      <div className="flex items-center justify-center w-[72px] h-[72px] rounded-full bg-ember shadow-[0_16px_40px_-12px_rgba(232,168,32,0.6)] animate-[pop-in_0.5s_cubic-bezier(0.34,1.56,0.64,1)_both]">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path
            d="M9 17l5 5 9-11"
            stroke="var(--color-paper)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="28"
            strokeDashoffset="28"
            style={{ animation: 'draw-check 0.4s ease-out 0.35s forwards' }}
          />
        </svg>
      </div>

      <div className="animate-[step-in_0.5s_cubic-bezier(0.22,1,0.36,1)_0.15s_both]">
        <h3 className="font-display text-[28px] text-ink m-0 mb-3">
          ¡Listo{name ? `, ${name}` : ''}! Recibimos tu solicitud.
        </h3>
        <p className="text-[14px] text-ink-3 leading-[1.65] max-w-[460px] m-0">
          Solicitaste la cobertura <span className="text-ink font-semibold">{coverageName}</span> con inicio el{' '}
          <span className="text-ink font-semibold">{formatDisplayDate(startDate)}</span>.{' '}
          {otherPayment ? (
            <>
              Nuestro agente te va a contactar al <span className="text-ink font-semibold">{phone}</span> para coordinar
              el pago, la inspección del vehículo y emitir la póliza.
            </>
          ) : (
            <>Te contactamos a la brevedad para coordinar la inspección del vehículo y emitir la póliza.</>
          )}
        </p>
      </div>

      {quoteNumber && (
        <div className="text-[12px] text-faint tracking-[0.02em] animate-[step-in_0.5s_cubic-bezier(0.22,1,0.36,1)_0.25s_both]">
          Presupuesto Nro. <span className="text-ink font-semibold">{quoteNumber}</span> — guardalo como referencia
        </div>
      )}

      <button
        onClick={onReset}
        className="text-[12px] tracking-[-0.005em] font-semibold text-ember-2 hover:text-ember transition-colors duration-[180ms] bg-transparent border-none cursor-pointer animate-[step-in_0.5s_cubic-bezier(0.22,1,0.36,1)_0.35s_both]"
      >
        Nueva cotización →
      </button>
    </div>
  )
}
