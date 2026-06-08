import { useState } from 'react'
import type { SelectOption } from '../components/select-search'
import { useBrands } from './use-brands'
import { useGroups } from './use-groups'
import { useModels } from './use-models'
import { useCotizarAuto } from './use-cotizar-auto'

interface FormState {
  brandId: number | null
  groupId: number | null
  codia: number | null
  year: number | null
  postalCode: string
  name: string
  phone: string
  email: string
}

const INITIAL: FormState = {
  brandId: null,
  groupId: null,
  codia: null,
  year: null,
  postalCode: '',
  name: '',
  phone: '',
  email: '',
}

interface CotizadorAutoFormHook {
  form: FormState
  brandOptions: SelectOption[]
  groupOptions: SelectOption[]
  modelOptions: SelectOption[]
  loadingBrands: boolean
  loadingGroups: boolean
  loadingModels: boolean
  isPending: boolean
  result: ReturnType<typeof useCotizarAuto>['data']
  cotizarError: ReturnType<typeof useCotizarAuto>['error']
  isValid: boolean
  handleBrandChange: (val: string) => void
  handleGroupChange: (val: string) => void
  handleCodiaChange: (val: string) => void
  handleYearChange: (val: string) => void
  handlePostalCodeChange: (val: string) => void
  handleNameChange: (val: string) => void
  handlePhoneChange: (val: string) => void
  handleEmailChange: (val: string) => void
  handleSubmit: (e: React.FormEvent) => void
  reset: () => void
}

export function useCotizadorAutoForm(): CotizadorAutoFormHook {
  const [form, setForm] = useState<FormState>(INITIAL)

  const { data: brandsData, isLoading: loadingBrands } = useBrands()
  const { data: groupsData, isLoading: loadingGroups } = useGroups(form.brandId)
  const { data: modelsData, isLoading: loadingModels } = useModels(form.brandId, form.groupId)
  const { mutate: cotizar, isPending, data: result, error: cotizarError, reset: resetMutation } = useCotizarAuto()

  const brandOptions: SelectOption[] =
    brandsData?.data.map(b => ({ value: String(b.id), label: b.name, logo: b.logo_url })) ?? []
  const groupOptions: SelectOption[] = groupsData?.data.map(g => ({ value: String(g.id), label: g.name })) ?? []
  const modelOptions: SelectOption[] =
    modelsData?.data.map(m => ({ value: String(m.codia), label: m.description })) ?? []

  const isValid = Boolean(form.brandId && form.codia && form.year && form.postalCode.trim())

  const handleBrandChange = (val: string) => {
    setForm(prev => ({ ...prev, brandId: val ? Number(val) : null, groupId: null, codia: null }))
  }

  const handleGroupChange = (val: string) => {
    setForm(prev => ({ ...prev, groupId: val ? Number(val) : null, codia: null }))
  }

  const handleCodiaChange = (val: string) => {
    setForm(prev => ({ ...prev, codia: val ? Number(val) : null }))
  }

  const handleYearChange = (val: string) => {
    setForm(prev => ({ ...prev, year: val ? Number(val) : null }))
  }

  const handlePostalCodeChange = (val: string) => {
    setForm(prev => ({ ...prev, postalCode: val }))
  }

  const handleNameChange = (val: string) => {
    setForm(prev => ({ ...prev, name: val }))
  }

  const handlePhoneChange = (val: string) => {
    setForm(prev => ({ ...prev, phone: val }))
  }

  const handleEmailChange = (val: string) => {
    setForm(prev => ({ ...prev, email: val }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedPostal = form.postalCode.trim()
    if (!form.brandId || !form.codia || !form.year || !trimmedPostal) return
    cotizar({
      marca: String(form.brandId),
      modelo: String(form.codia),
      anioFabricacion: form.year,
      codigoPostal: Number(trimmedPostal),
    })
  }

  const reset = () => {
    resetMutation()
    setForm(INITIAL)
  }

  return {
    form,
    brandOptions,
    groupOptions,
    modelOptions,
    loadingBrands,
    loadingGroups,
    loadingModels,
    isPending,
    result,
    cotizarError,
    isValid,
    handleBrandChange,
    handleGroupChange,
    handleCodiaChange,
    handleYearChange,
    handlePostalCodeChange,
    handleNameChange,
    handlePhoneChange,
    handleEmailChange,
    handleSubmit,
    reset,
  }
}
