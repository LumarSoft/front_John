import { useState } from 'react'
import type { SelectOption } from '../components/select-search'
import type { VehicleType } from '@/src/types/api/cotizador'
import type { VehicleModel } from '@/src/types/api/infoauto'
import { ApiError } from '@/src/lib/api-client'
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
  /** The client says it is brand new (only offered for this year's or last year's model). */
  zeroKm: boolean
  /** Cars: the client says it has GNC. */
  hasGnc: boolean
}

/**
 * Argentine postal codes run from 1000 to the 9400s. Triunfo prices an
 * unknown one instead of rejecting it (9999 came back at half the price), so
 * the form stops it first. Null when valid or still empty.
 */
export function postalCodeError(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  if (!/^\d{4}$/.test(trimmed)) return 'El código postal tiene 4 dígitos (por ejemplo 2000).'
  const code = Number(trimmed)
  return code >= 1000 && code <= 9499 ? null : 'Ese código postal no existe. Revisá los 4 dígitos.'
}

export interface YearOption {
  value: number
  label: string
}

const CURRENT_YEAR = new Date().getFullYear()
const DEFAULT_YEARS: YearOption[] = Array.from({ length: 31 }, (_, i) => CURRENT_YEAR - i).map(y => ({
  value: y,
  label: String(y),
}))

/**
 * Model years a version can actually be quoted for, mirroring the API's
 * validation so the form never offers a year that fails on submit:
 *  - a version with a used-price range is sold for those years (a recent moto
 *    still on sale also for the current year, InfoAuto lags a year);
 *  - a brand-new version (0km list price, no used range yet) only for the
 *    current year;
 *  - a version with no price at all cannot be quoted online.
 */
export function yearOptionsFor(
  model: VehicleModel | undefined,
  vehicleType: VehicleType,
): { options: YearOption[]; hint: string | null } {
  if (!model) return { options: DEFAULT_YEARS, hint: null }
  const from = model.prices_from
  const to = model.prices_to
  if (typeof from !== 'number' || typeof to !== 'number') {
    if (model.list_price) {
      return {
        options: [{ value: CURRENT_YEAR, label: `0km ${CURRENT_YEAR}` }],
        hint: `Esta versión se vende solo como 0km ${CURRENT_YEAR}.`,
      }
    }
    return {
      options: [],
      hint: 'Esta versión no tiene precio de referencia en el catálogo, así que no se puede cotizar online. Consultá con un asesor.',
    }
  }
  const recentMoto = vehicleType === 'moto' && to >= CURRENT_YEAR - 1
  const last = recentMoto ? Math.max(to, CURRENT_YEAR) : to
  const options: YearOption[] = []
  for (let y = last; y >= from; y--) options.push({ value: y, label: String(y) })
  return { options, hint: null }
}

const INITIAL: FormState = {
  brandId: null,
  groupId: null,
  codia: null,
  year: null,
  postalCode: '',
  zeroKm: false,
  hasGnc: false,
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
  /** Model years the chosen version can be quoted for; all recent years until a version is chosen. */
  yearOptions: YearOption[]
  /** Why the year list looks the way it does ("solo 0km 2026"), when worth saying. */
  yearHint: string | null
  /** What the API said when it refused the quote (wrong year, no reference price), or null for other failures. */
  cotizarErrorMessage: string | null
  /** Why the postal code can't be quoted, while it is being typed. */
  postalCodeError: string | null
  /** Whether "es 0 km" applies: a model of this year or the previous one. */
  zeroKmAvailable: boolean
  /** The version is only sold new (0km list price, no used range): always 0 km. */
  zeroKmOnly: boolean
  handleZeroKmChange: (checked: boolean) => void
  handleGncChange: (checked: boolean) => void
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
    modelsData?.data.map(m => ({
      value: String(m.codia),
      label: m.description,
      logo: vehicleType === 'moto' ? m.photo_url : null,
    })) ?? []

  const selectedModel = modelsData?.data.find(m => m.codia === form.codia)
  const { options: yearOptions, hint: yearHint } = yearOptionsFor(selectedModel, vehicleType)
  const yearAllowed = form.year !== null && yearOptions.some(o => o.value === form.year)

  const postalError = postalCodeError(form.postalCode)
  const zeroKmOnly = !!selectedModel && typeof selectedModel.prices_from !== 'number' && !!selectedModel.list_price
  const zeroKmAvailable = form.year !== null && form.year >= CURRENT_YEAR - 1
  const zeroKm = zeroKmOnly || (zeroKmAvailable && form.zeroKm)

  const isValid = Boolean(form.brandId && form.codia && yearAllowed && form.postalCode.trim() && !postalError)

  // A 400 carries the API's own explanation (year outside the catalog, no
  // reference price); anything else is a generic failure.
  const cotizarErrorMessage =
    cotizarError instanceof ApiError && cotizarError.status === 400 && cotizarError.message
      ? cotizarError.message
      : null

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
    const codia = val ? Number(val) : null
    const model = modelsData?.data.find(m => m.codia === codia)
    const { options } = yearOptionsFor(model, vehicleType)
    setForm(prev => ({
      ...prev,
      codia,
      // Keep the year only if the new version is sold for it; a 0km-only version picks its single year.
      year:
        options.length === 1
          ? options[0].value
          : prev.year && options.some(o => o.value === prev.year)
            ? prev.year
            : null,
    }))
  }

  const handleYearChange = (val: string) => {
    setForm(prev => ({ ...prev, year: val ? Number(val) : null }))
  }

  const handlePostalCodeChange = (val: string) => {
    setForm(prev => ({ ...prev, postalCode: val }))
  }

  const handleZeroKmChange = (checked: boolean) => {
    setForm(prev => ({ ...prev, zeroKm: checked }))
  }

  const handleGncChange = (checked: boolean) => {
    setForm(prev => ({ ...prev, hasGnc: checked }))
  }

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    const trimmedPostal = form.postalCode.trim()
    if (!form.brandId || !form.codia || !form.year || !yearAllowed || !trimmedPostal || postalError) return
    cotizar(
      {
        brand: String(form.brandId),
        model: String(form.codia),
        manufactureYear: form.year,
        postalCode: Number(trimmedPostal),
        ...(zeroKm ? { zeroKm: true } : {}),
        ...(vehicleType === 'auto' && form.hasGnc ? { hasGnc: true } : {}),
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
    yearOptions,
    yearHint,
    cotizarErrorMessage,
    postalCodeError: postalError,
    zeroKmAvailable,
    zeroKmOnly,
    handleZeroKmChange,
    handleGncChange,
    handleBrandChange,
    handleGroupChange,
    handleCodiaChange,
    handleYearChange,
    handlePostalCodeChange,
    handleSubmit,
    reset,
  }
}
