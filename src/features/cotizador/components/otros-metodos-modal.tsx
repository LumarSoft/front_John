'use client'

import { createPortal } from 'react-dom'

interface OtrosMetodosModalProps {
  open: boolean
  phone: string
  submitting: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function OtrosMetodosModal({ open, phone, submitting, onCancel, onConfirm }: Readonly<OtrosMetodosModalProps>) {
  // Portal to body so the fixed overlay escapes the wizard's transformed ancestors and covers the full viewport.
  // The modal only opens after a client interaction, so the document guard is enough for SSR safety.
  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-5 bg-ink/45 backdrop-blur-[2px] animate-[step-in_0.2s_ease-out_both]"
      onClick={submitting ? undefined : onCancel}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="otros-metodos-title"
        className="w-full max-w-[460px] flex flex-col gap-5 rounded-2xl bg-paper border border-line-2 p-7 text-center shadow-[0_32px_80px_-24px_rgba(15,13,10,0.45)] animate-[pop-in_0.35s_cubic-bezier(0.34,1.56,0.64,1)_both]"
        onClick={e => e.stopPropagation()}
      >
        <h4 id="otros-metodos-title" className="font-display text-[22px] text-ink m-0">
          Otros métodos de pago
        </h4>

        <p className="text-[13.5px] text-ink-3 leading-[1.65] m-0">
          Para abonar con otro método de pago continuamos la contratación a través de un agente que te va a contactar a
          tu número de teléfono:
        </p>

        <div className="font-display text-[20px] text-ink">{phone}</div>

        <p className="text-[12.5px] text-faint leading-[1.6] m-0">
          Al presionar confirmar el proceso finaliza y nuestro agente se contacta con vos.
        </p>

        <div className="grid grid-cols-2 gap-3 mt-1 max-[420px]:grid-cols-1">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="py-[12px] px-5 rounded-full text-[13px] font-semibold tracking-[-0.005em] cursor-pointer bg-transparent text-ink border border-line-strong transition-[border-color,color] duration-[180ms] hover:border-ember hover:text-ember-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={submitting}
            className="btn-shimmer py-[12px] px-5 rounded-full text-[13px] font-semibold tracking-[-0.005em] cursor-pointer bg-ember text-paper border-none transition-[background-color,box-shadow,opacity] duration-[180ms] hover:bg-ember-2 hover:shadow-[0_12px_32px_-8px_rgba(232,168,32,0.55)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Enviando…' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
