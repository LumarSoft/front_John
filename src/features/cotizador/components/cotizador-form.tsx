'use client'

import type { VehicleType } from '@/src/types/api/cotizador'
import { CotizadorStepper } from './cotizador-stepper'
import { VehiculoStep } from './vehiculo-step'
import { CotizacionResultados } from './cotizacion-resultados'
import { CotizacionResumen } from './cotizacion-resumen'
import { VigenciaStep } from './vigencia-step'
import { DatosPersonalesStep } from './datos-personales-step'
import { PagoStep } from './pago-step'
import { SolicitudConfirmada } from './solicitud-confirmada'
import { useCotizadorFlow } from '../hooks/use-cotizador-flow'

const stepInClass = 'animate-[step-in_0.45s_cubic-bezier(0.22,1,0.36,1)_both]'

interface CotizadorFormProps {
  vehicleType: VehicleType
}

export function CotizadorForm({ vehicleType }: Readonly<CotizadorFormProps>) {
  const flow = useCotizadorFlow(vehicleType)
  const { step, vehicleForm, personalForm, pagoForm, selectedCard } = flow
  const result = vehicleForm.result
  const applicantPhone = `${personalForm.form.areaCode} ${personalForm.form.phoneNumber}`.trim()

  return (
    <div className="flex flex-col gap-10">
      <CotizadorStepper current={step} onStepClick={flow.goToStep} />

      <div key={step} className={stepInClass}>
        {step === 'vehicle' && <VehiculoStep form={vehicleForm} vehicleType={vehicleType} />}

        {step === 'coverage' && result && (
          <CotizacionResultados result={result} onSelect={flow.selectCoverage} onReset={flow.resetAll} />
        )}

        {(step === 'startDate' || step === 'personal' || step === 'payment') && selectedCard && (
          <div className="grid grid-cols-[270px_1fr] gap-8 items-start max-[760px]:grid-cols-1">
            <CotizacionResumen
              card={selectedCard}
              vehicleLabel={vehicleForm.vehicleLabel}
              quoteNumber={result?.quoteNumber ?? null}
              startDate={flow.startDate}
              endDate={flow.endDate}
            />

            {step === 'startDate' && (
              <VigenciaStep
                startDate={flow.startDate}
                minDate={flow.minStartDate}
                maxDate={flow.maxStartDate}
                endDate={flow.endDate}
                onChangeStartDate={flow.setStartDate}
                onContinue={flow.confirmStartDate}
                onBack={() => flow.goToStep('coverage')}
              />
            )}
            {step === 'personal' && (
              <DatosPersonalesStep
                form={personalForm}
                onContinue={flow.confirmPersonal}
                onBack={() => flow.goToStep('startDate')}
              />
            )}
            {step === 'payment' && (
              <PagoStep
                form={pagoForm}
                phone={applicantPhone}
                submitting={flow.submitting}
                submitError={flow.submitError}
                onSubmit={flow.submitSolicitud}
                onBack={() => flow.goToStep('personal')}
              />
            )}
          </div>
        )}

        {step === 'done' && selectedCard && (
          <SolicitudConfirmada
            name={personalForm.form.firstName.trim()}
            coverageName={selectedCard.tier.name}
            startDate={flow.startDate}
            quoteNumber={result?.quoteNumber ?? null}
            otherPayment={pagoForm.form.method === 'OTHER'}
            phone={applicantPhone}
            onReset={flow.resetAll}
          />
        )}
      </div>
    </div>
  )
}
