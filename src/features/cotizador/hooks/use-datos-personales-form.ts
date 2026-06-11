import { useState } from 'react'
import type { DocType, PersonType, SolicitudPersonalData } from '@/src/types/api/cotizador'

interface DatosPersonalesState {
  personType: PersonType
  firstName: string
  lastName: string
  email: string
  areaCode: string
  phoneNumber: string
  birthDate: string
  docType: DocType
  docNumber: string
  street: string
  city: string
}

const INITIAL: DatosPersonalesState = {
  personType: 'FISICA',
  firstName: '',
  lastName: '',
  email: '',
  areaCode: '',
  phoneNumber: '',
  birthDate: '',
  docType: 'DNI',
  docNumber: '',
  street: '',
  city: '',
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export interface DatosPersonalesFormHook {
  form: DatosPersonalesState
  isFisica: boolean
  isValid: boolean
  setField: <K extends keyof DatosPersonalesState>(field: K, value: DatosPersonalesState[K]) => void
  setPersonType: (personType: PersonType) => void
  buildPayload: () => SolicitudPersonalData
  reset: () => void
}

export function useDatosPersonalesForm(): DatosPersonalesFormHook {
  const [form, setForm] = useState<DatosPersonalesState>(INITIAL)

  const isFisica = form.personType === 'FISICA'

  const setField = <K extends keyof DatosPersonalesState>(field: K, value: DatosPersonalesState[K]) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  // Switching the person type also switches the natural document type
  const setPersonType = (personType: PersonType) => {
    setForm(prev => ({ ...prev, personType, docType: personType === 'JURIDICA' ? 'CUIT' : 'DNI' }))
  }

  const isValid = Boolean(
    form.firstName.trim() &&
    EMAIL_RE.test(form.email.trim()) &&
    form.areaCode.trim() &&
    form.phoneNumber.trim() &&
    form.docNumber.trim() &&
    form.street.trim() &&
    form.city.trim() &&
    (!isFisica || (form.lastName.trim() && form.birthDate)),
  )

  const buildPayload = (): SolicitudPersonalData => ({
    personType: form.personType,
    firstName: form.firstName.trim(),
    lastName: isFisica ? form.lastName.trim() : undefined,
    email: form.email.trim(),
    phone: `${form.areaCode.trim()}${form.phoneNumber.trim()}`,
    birthDate: isFisica && form.birthDate ? form.birthDate : undefined,
    docType: form.docType,
    docNumber: form.docNumber.trim(),
    address: `${form.street.trim()}, ${form.city.trim()}`,
  })

  const reset = () => setForm(INITIAL)

  return { form, isFisica, isValid, setField, setPersonType, buildPayload, reset }
}
