import { useState } from 'react'
import type { PaymentMethod, SolicitudPagoData } from '@/src/types/api/cotizador'

interface PagoFormState {
  method: PaymentMethod | null
}

const INITIAL: PagoFormState = { method: null }

export interface PagoFormHook {
  form: PagoFormState
  isValid: boolean
  setMethod: (method: PaymentMethod) => void
  buildPayload: () => SolicitudPagoData
  reset: () => void
}

/**
 * Payment step state. Card data is NO LONGER collected at quote time — the client
 * only picks a preferred method and an agent finalizes the payment details when
 * issuing the policy. So validity is just "a method was chosen".
 */
export function usePagoForm(): PagoFormHook {
  const [form, setForm] = useState<PagoFormState>(INITIAL)

  const setMethod = (method: PaymentMethod) => setForm({ method })
  const isValid = form.method !== null
  const buildPayload = (): SolicitudPagoData => ({ paymentMethod: form.method ?? 'OTHER' })
  const reset = () => setForm(INITIAL)

  return { form, isValid, setMethod, buildPayload, reset }
}
