import { useState } from 'react'
import type { SelectOption } from '../components/select-search'
import type { VehicleType } from '@/src/types/api/cotizador'
import { useBrands } from './use-brands'
import { useGroups } from './use-groups'
import { useModels } from './use-models'
import { useCotizarVehiculo } from './use-cotizar-vehiculo'

interface FormState {
  brandId: number | null
  groupId: number | null
  codia: number | null
  year: number | null
  postalCode: string
}

const INITIAL: FormState = {
  brandId: null,
  groupId: null,
  codia: null,
  year: null,
  postalCode: '',
}

interface UseCotizadorVehiculoFormOptions {
  vehicleType: VehicleType
  onCotizado?: () => void
}

export interface CotizadorVehiculoFormHook {
  form: FormState
  vehicleLabel: string | null
  brandOptions: SelectOption[]
  groupOptions: SelectOption[]
  modelOptions: SelectOption[]
  loadingBrands: boolean
  loadingGroups: boolean
  loadingModels: boolean
  isPending: boolean
  result: ReturnType<typeof useCotizarVehiculo>['data']
  cotizarError: ReturnType<typeof useCotizarVehiculo>['error']
  isValid: boolean
  handleBrandChange: (val: string) => void
  handleGroupChange: (val: string) => void
  handleCodiaChange: (val: string) => void
  handleYearChange: (val: string) => void
  handlePostalCodeChange: (val: string) => void
  handleSubmit: (e: React.SubmitEvent<HTMLFormElement>) => void
  reset: () => void
}

export function useCotizadorVehiculoForm({
  vehicleType,
  onCotizado,
}: UseCotizadorVehiculoFormOptions): CotizadorVehiculoFormHook {
  const [form, setForm] = useState<FormState>(INITIAL)

  const { data: brandsData, isLoading: loadingBrands } = useBrands(vehicleType)
  const { data: groupsData, isLoading: loadingGroups } = useGroups(vehicleType, form.brandId)
  const { data: modelsData, isLoading: loadingModels } = useModels(vehicleType, form.brandId, form.groupId)
  const {
    mutate: cotizar,
    isPending,
    data: result,
    error: cotizarError,
    reset: resetMutation,
  } = useCotizarVehiculo(vehicleType)

  const brandOptions: SelectOption[] =
    brandsData?.data.map(b => ({ value: String(b.id), label: b.name, logo: b.logo_url })) ?? []
  const groupOptions: SelectOption[] = groupsData?.data.map(g => ({ value: String(g.id), label: g.name })) ?? []
  const modelOptions: SelectOption[] =
    modelsData?.data.map(m => ({ value: String(m.codia), label: m.description })) ?? []

  const isValid = Boolean(form.brandId && form.codia && form.year && form.postalCode.trim())

  const brandLabel = brandOptions.find(o => o.value === String(form.brandId))?.label
  const modelLabel = modelOptions.find(o => o.value === String(form.codia))?.label
  const vehicleLabel = brandLabel && modelLabel && form.year ? `${brandLabel} ${modelLabel} · ${form.year}` : null

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

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    const trimmedPostal = form.postalCode.trim()
    if (!form.brandId || !form.codia || !form.year || !trimmedPostal) return
    cotizar(
      {
        brand: String(form.brandId),
        model: String(form.codia),
        manufactureYear: form.year,
        postalCode: Number(trimmedPostal),
      },
      { onSuccess: () => onCotizado?.() },
    )
  }

  const reset = () => {
    resetMutation()
    setForm(INITIAL)
  }

  return {
    form,
    vehicleLabel,
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
    handleSubmit,
    reset,
  }
}
