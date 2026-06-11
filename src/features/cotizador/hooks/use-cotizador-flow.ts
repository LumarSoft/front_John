import { useState } from 'react'
import type { CoverageCard } from '../lib/coverages'
import type { VehicleType } from '@/src/types/api/cotizador'
import { addDaysISO, addYearsISO, todayISO } from '../lib/dates'
import { useCotizadorVehiculoForm, type CotizadorVehiculoFormHook } from './use-cotizador-vehiculo-form'
import { useDatosPersonalesForm, type DatosPersonalesFormHook } from './use-datos-personales-form'
import { usePagoForm, type PagoFormHook } from './use-pago-form'
import { useSolicitarCobertura } from './use-solicitar-cobertura'

export type CotizadorStep = 'vehicle' | 'coverage' | 'startDate' | 'personal' | 'payment' | 'done'

const STEP_ORDER: CotizadorStep[] = ['vehicle', 'coverage', 'startDate', 'personal', 'payment', 'done']

export interface CotizadorFlowHook {
  step: CotizadorStep
  vehicleForm: CotizadorVehiculoFormHook
  personalForm: DatosPersonalesFormHook
  pagoForm: PagoFormHook
  selectedCard: CoverageCard | null
  startDate: string
  endDate: string | null
  minStartDate: string
  maxStartDate: string
  submitting: boolean
  submitError: boolean
  selectCoverage: (card: CoverageCard) => void
  setStartDate: (iso: string) => void
  confirmStartDate: () => void
  confirmPersonal: () => void
  submitSolicitud: () => void
  goToStep: (target: CotizadorStep) => void
  resetAll: () => void
}

export function useCotizadorFlow(vehicleType: VehicleType): CotizadorFlowHook {
  const [step, setStep] = useState<CotizadorStep>('vehicle')
  const [selectedCard, setSelectedCard] = useState<CoverageCard | null>(null)
  const [startDate, setStartDate] = useState('')

  const solicitar = useSolicitarCobertura(vehicleType)
  const personalForm = useDatosPersonalesForm()
  const pagoForm = usePagoForm()
  const vehicleForm = useCotizadorVehiculoForm({
    vehicleType,
    onCotizado: () => {
      setSelectedCard(null)
      setStartDate('')
      solicitar.reset()
      setStep('coverage')
    },
  })

  const minStartDate = todayISO()
  const maxStartDate = vehicleForm.result?.validUntil ?? addDaysISO(minStartDate, 30)
  const endDate = startDate ? addYearsISO(startDate, 1) : null

  const selectCoverage = (card: CoverageCard) => {
    setSelectedCard(card)
    setStep('startDate')
  }

  const confirmStartDate = () => {
    if (startDate) setStep('personal')
  }

  const confirmPersonal = () => {
    if (personalForm.isValid) setStep('payment')
  }

  const submitSolicitud = () => {
    const quoteNumber = vehicleForm.result?.quoteNumber
    if (!quoteNumber || !selectedCard || !startDate || !personalForm.isValid || !pagoForm.isValid) return
    solicitar.mutate(
      {
        quoteNumber,
        data: {
          ...personalForm.buildPayload(),
          ...pagoForm.buildPayload(),
          coverage: selectedCard.code,
          startDate,
        },
      },
      { onSuccess: () => setStep('done') },
    )
  }

  // Only backwards navigation — moving forward always goes through each step's own action
  const goToStep = (target: CotizadorStep) => {
    if (step === 'done') return
    if (STEP_ORDER.indexOf(target) < STEP_ORDER.indexOf(step)) setStep(target)
  }

  const resetAll = () => {
    vehicleForm.reset()
    personalForm.reset()
    pagoForm.reset()
    solicitar.reset()
    setSelectedCard(null)
    setStartDate('')
    setStep('vehicle')
  }

  return {
    step,
    vehicleForm,
    personalForm,
    pagoForm,
    selectedCard,
    startDate,
    endDate,
    minStartDate,
    maxStartDate,
    submitting: solicitar.isPending,
    submitError: Boolean(solicitar.error),
    selectCoverage,
    setStartDate,
    confirmStartDate,
    confirmPersonal,
    submitSolicitud,
    goToStep,
    resetAll,
  }
}
