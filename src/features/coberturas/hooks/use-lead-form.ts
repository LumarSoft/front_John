import { useState } from 'react'
import { CONTACT_FIELDS, FIELDS, type Field } from '../data/fields'
import type { CreateLeadRequest, LeadProductType } from '@/src/types/api/leads'

// Contact field labels, kept in sync with CONTACT_FIELDS in ../data/fields.
const NOMBRE = 'Nombre y apellido'
const TELEFONO = 'Teléfono'
const EMAIL = 'Correo electrónico'

export interface LeadFormHook {
  productFields: Field[]
  contactFields: Field[]
  values: Record<string, string>
  setValue: (label: string, value: string) => void
  invalidLabels: Set<string>
  isValid: boolean
  attempted: boolean
  markAttempted: () => void
  buildPayload: (selectedPlanId?: number) => CreateLeadRequest
  reset: () => void
}

interface Options {
  includeProductFields?: boolean
}

export function useLeadForm(productId: string, { includeProductFields = true }: Options = {}): LeadFormHook {
  const productFields = includeProductFields ? (FIELDS[productId] ?? []) : []
  const [values, setValues] = useState<Record<string, string>>({})
  const [attempted, setAttempted] = useState(false)

  const setValue = (label: string, value: string) => setValues(prev => ({ ...prev, [label]: value }))

  const val = (label: string) => (values[label] ?? '').trim()

  const invalidLabels = new Set<string>()
  for (const f of productFields) if (!val(f.label)) invalidLabels.add(f.label)
  if (!val(NOMBRE)) invalidLabels.add(NOMBRE)
  const phoneDigits = val(TELEFONO).replace(/\D/g, '')
  if (phoneDigits.length < 6) invalidLabels.add(TELEFONO)
  const email = val(EMAIL)
  if (email && !/^\S+@\S+\.\S+$/.test(email)) invalidLabels.add(EMAIL)

  const isValid = invalidLabels.size === 0

  const buildPayload = (selectedPlanId?: number): CreateLeadRequest => {
    const payload: Record<string, string> = {}
    for (const f of productFields) {
      const v = val(f.label)
      if (v) payload[f.label] = v
    }
    return {
      productType: productId as LeadProductType,
      contactName: val(NOMBRE),
      phone: val(TELEFONO),
      email: email || undefined,
      payload,
      ...(selectedPlanId ? { selectedPlanId } : {}),
    }
  }

  const reset = () => {
    setValues({})
    setAttempted(false)
  }

  return {
    productFields,
    contactFields: CONTACT_FIELDS,
    values,
    setValue,
    invalidLabels,
    isValid,
    attempted,
    markAttempted: () => setAttempted(true),
    buildPayload,
    reset,
  }
}
