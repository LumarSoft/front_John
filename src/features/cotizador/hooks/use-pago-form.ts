import { useState } from 'react'
import type { PaymentMethod, SolicitudPagoData } from '@/src/types/api/cotizador'

interface PagoFormState {
  method: PaymentMethod | null
  cardCompany: string
  cardNumber: string
  cardExpiry: string // MM/AA as typed by the user
  cardHolder: string
}

const INITIAL: PagoFormState = {
  method: null,
  cardCompany: '',
  cardNumber: '',
  cardExpiry: '',
  cardHolder: '',
}

const EXPIRY_RE = /^(0[1-9]|1[0-2])\/\d{2}$/

const isExpiryValid = (expiry: string): boolean => {
  if (!EXPIRY_RE.test(expiry)) return false
  const [month, shortYear] = expiry.split('/')
  const now = new Date()
  const current = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`
  return `20${shortYear}${month}` >= current
}

// MM/AA → YYYYMM (Triunfo format)
const toApiExpiry = (expiry: string): string => {
  const [month, shortYear] = expiry.split('/')
  return `20${shortYear}${month}`
}

export interface PagoFormHook {
  form: PagoFormState
  paysWithCard: boolean
  isValid: boolean
  setMethod: (method: PaymentMethod) => void
  setField: <K extends keyof PagoFormState>(field: K, value: PagoFormState[K]) => void
  buildPayload: () => SolicitudPagoData
  reset: () => void
}

export function usePagoForm(): PagoFormHook {
  const [form, setForm] = useState<PagoFormState>(INITIAL)

  const paysWithCard = form.method === 'CREDIT' || form.method === 'DEBIT'

  const setMethod = (method: PaymentMethod) => setForm(prev => ({ ...prev, method }))

  const setField = <K extends keyof PagoFormState>(field: K, value: PagoFormState[K]) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const cardComplete = Boolean(
    form.cardCompany && /^\d{13,19}$/.test(form.cardNumber) && isExpiryValid(form.cardExpiry) && form.cardHolder.trim(),
  )

  const isValid = form.method === 'OTHER' || (paysWithCard && cardComplete)

  const buildPayload = (): SolicitudPagoData => {
    if (!form.method || form.method === 'OTHER') return { paymentMethod: 'OTHER' }
    return {
      paymentMethod: form.method,
      cardCompany: form.cardCompany,
      cardNumber: form.cardNumber,
      cardExpiry: toApiExpiry(form.cardExpiry),
      cardHolder: form.cardHolder.trim(),
    }
  }

  const reset = () => setForm(INITIAL)

  return { form, paysWithCard, isValid, setMethod, setField, buildPayload, reset }
}
